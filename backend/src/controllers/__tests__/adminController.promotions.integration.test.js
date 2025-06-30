import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import User from '../../models/User.js';
import Promotion from '../../models/Promotion.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import jwt from 'jsonwebtoken';

describe('Admin Promotions Management Integration Tests', () => {
  let adminUser;
  let adminToken;
  let testProduct;
  let testCategory;

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'Test123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });

    // Generate admin token
    adminToken = jwt.sign(
      { userId: adminUser._id, role: 'admin', email: adminUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test product and category
    testCategory = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test category for promotions'
    });

    testProduct = await Product.create({
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test product for promotions',
      price: 100,
      stockQuantity: 10,
      category: testCategory._id,
      isActive: true
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Promotion.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
  });

  beforeEach(async () => {
    await Promotion.deleteMany({});
  });

  describe('GET /api/admin/promotions', () => {
    beforeEach(async () => {
      // Create test promotions
      await Promotion.create([
        {
          name: 'Summer Sale',
          code: 'SUMMER20',
          type: 'percentage',
          value: 20,
          status: 'active',
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        },
        {
          name: 'Winter Special',
          code: 'WINTER10',
          type: 'fixed_amount',
          value: 10,
          status: 'inactive',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000)
        },
        {
          name: 'Free Shipping Deal',
          code: 'FREESHIP',
          type: 'free_shipping',
          status: 'active',
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        }
      ]);
    });

    it('should get all promotions with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalItems).toBe(3);
    });

    it('should filter promotions by type', async () => {
      const response = await request(app)
        .get('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ type: 'percentage' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('percentage');
    });

    it('should filter promotions by status', async () => {
      const response = await request(app)
        .get('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'active' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(p => p.status === 'active')).toBe(true);
    });

    it('should search promotions by name or code', async () => {
      const response = await request(app)
        .get('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'SUMMER' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].code).toBe('SUMMER20');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/promotions');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/admin/promotions', () => {
    it('should create a percentage promotion', async () => {
      const promotionData = {
        name: 'New Year Sale',
        code: 'NEWYEAR25',
        description: '25% off for New Year',
        type: 'percentage',
        value: 25,
        minimumOrderSubtotal: 50,
        totalUsageLimit: 100,
        perUserUsageLimit: 2,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 604800000).toISOString(),
        status: 'active'
      };

      const response = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('NEWYEAR25');
      expect(response.body.data.type).toBe('percentage');
      expect(response.body.data.value).toBe(25);
    });

    it('should create a fixed amount promotion', async () => {
      const promotionData = {
        name: 'Holiday Special',
        code: 'HOLIDAY15',
        type: 'fixed_amount',
        value: 15,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString()
      };

      const response = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData);

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe('fixed_amount');
      expect(response.body.data.value).toBe(15);
    });

    it('should create a free shipping promotion', async () => {
      const promotionData = {
        name: 'Free Shipping Weekend',
        code: 'SHIPFREE',
        type: 'free_shipping',
        minimumOrderSubtotal: 30,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString()
      };

      const response = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData);

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe('free_shipping');
      expect(response.body.data.value).toBeUndefined();
    });

    it('should create promotion with applicable products', async () => {
      const promotionData = {
        name: 'Product Special',
        code: 'PRODSPEC',
        type: 'percentage',
        value: 15,
        applicableProducts: [testProduct._id.toString()],
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString()
      };

      const response = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(promotionData);

      expect(response.status).toBe(201);
      expect(response.body.data.applicableProducts).toHaveLength(1);
    });

    it('should reject duplicate promotion code', async () => {
      await Promotion.create({
        name: 'Existing Promo',
        code: 'EXISTING',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });

      const response = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Code',
          code: 'EXISTING',
          type: 'percentage',
          value: 20,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Promo'
        });

      expect(response.status).toBe(400);
    });

    it('should validate date range', async () => {
      const response = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Dates',
          code: 'INVALIDDATES',
          type: 'percentage',
          value: 10,
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date().toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('End date must be after start date');
    });
  });

  describe('PUT /api/admin/promotions/:promoId', () => {
    let testPromotion;

    beforeEach(async () => {
      testPromotion = await Promotion.create({
        name: 'Test Promotion',
        code: 'TESTPROMO',
        type: 'percentage',
        value: 20,
        status: 'draft',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });
    });

    it('should update promotion details', async () => {
      const updateData = {
        name: 'Updated Promotion',
        description: 'Updated description',
        value: 25,
        minimumOrderSubtotal: 100
      };

      const response = await request(app)
        .put(`/api/admin/promotions/${testPromotion._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Promotion');
      expect(response.body.data.value).toBe(25);
      expect(response.body.data.minimumOrderSubtotal).toBe(100);
    });

    it('should update promotion code', async () => {
      const response = await request(app)
        .put(`/api/admin/promotions/${testPromotion._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: 'NEWCODE' });

      expect(response.status).toBe(200);
      expect(response.body.data.code).toBe('NEWCODE');
    });

    it('should prevent duplicate code on update', async () => {
      await Promotion.create({
        name: 'Another Promo',
        code: 'TAKEN',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });

      const response = await request(app)
        .put(`/api/admin/promotions/${testPromotion._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: 'TAKEN' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    it('should restrict changes after promotion is used', async () => {
      // Simulate promotion usage
      testPromotion.timesUsed = 5;
      await testPromotion.save();

      const response = await request(app)
        .put(`/api/admin/promotions/${testPromotion._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'fixed_amount', value: 50 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cannot modify type or value');
    });

    it('should handle non-existent promotion', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/admin/promotions/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/admin/promotions/:promoId/status', () => {
    let testPromotion;

    beforeEach(async () => {
      testPromotion = await Promotion.create({
        name: 'Status Test',
        code: 'STATUSTEST',
        type: 'percentage',
        value: 10,
        status: 'draft',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });
    });

    it('should update promotion status', async () => {
      const response = await request(app)
        .put(`/api/admin/promotions/${testPromotion._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('active');
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .put(`/api/admin/promotions/${testPromotion._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/admin/promotions/:promoId', () => {
    let testPromotion;

    beforeEach(async () => {
      testPromotion = await Promotion.create({
        name: 'Delete Test',
        code: 'DELETETEST',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });
    });

    it('should soft delete promotion', async () => {
      const response = await request(app)
        .delete(`/api/admin/promotions/${testPromotion._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const deletedPromo = await Promotion.findById(testPromotion._id);
      expect(deletedPromo.isDeleted).toBe(true);
      expect(deletedPromo.status).toBe('archived');
    });

    it('should handle non-existent promotion', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/admin/promotions/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/admin/promotions/check-code', () => {
    beforeEach(async () => {
      await Promotion.create({
        name: 'Existing Code',
        code: 'EXISTCODE',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });
    });

    it('should check if code is available', async () => {
      const response = await request(app)
        .get('/api/admin/promotions/check-code')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ code: 'NEWCODE' });

      expect(response.status).toBe(200);
      expect(response.body.isAvailable).toBe(true);
    });

    it('should check if code is taken', async () => {
      const response = await request(app)
        .get('/api/admin/promotions/check-code')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ code: 'EXISTCODE' });

      expect(response.status).toBe(200);
      expect(response.body.isAvailable).toBe(false);
    });

    it('should check code case-insensitively', async () => {
      const response = await request(app)
        .get('/api/admin/promotions/check-code')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ code: 'existcode' });

      expect(response.status).toBe(200);
      expect(response.body.isAvailable).toBe(false);
    });

    it('should exclude current promotion when updating', async () => {
      const promotion = await Promotion.findOne({ code: 'EXISTCODE' });
      
      const response = await request(app)
        .get('/api/admin/promotions/check-code')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ code: 'EXISTCODE', promoId: promotion._id });

      expect(response.status).toBe(200);
      expect(response.body.isAvailable).toBe(true);
    });
  });
});