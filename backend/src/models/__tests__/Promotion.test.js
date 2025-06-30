import mongoose from 'mongoose';
import Promotion from '../Promotion.js';

describe('Promotion Model', () => {
  beforeEach(async () => {
    await Promotion.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid promotion', async () => {
      const promotionData = {
        name: 'Summer Sale',
        code: 'SUMMER20',
        description: '20% off all products',
        type: 'percentage',
        value: 20,
        minimumOrderSubtotal: 50,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-08-31'),
        status: 'active',
        totalUsageLimit: 100,
        perUserUsageLimit: 2
      };

      const promotion = new Promotion(promotionData);
      const saved = await promotion.save();

      expect(saved._id).toBeDefined();
      expect(saved.code).toBe('SUMMER20');
      expect(saved.timesUsed).toBe(0);
      expect(saved.usersUsed).toHaveLength(0);
    });

    it('should require name and code', async () => {
      const promotion = new Promotion({
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });

      await expect(promotion.save()).rejects.toThrow();
    });

    it('should enforce unique code constraint', async () => {
      const promotionData = {
        name: 'Test Promotion',
        code: 'UNIQUE10',
        type: 'fixed_amount',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      };

      await Promotion.create(promotionData);
      
      const duplicate = new Promotion(promotionData);
      await expect(duplicate.save()).rejects.toThrow();
    });

    it('should validate date range', async () => {
      const promotion = new Promotion({
        name: 'Invalid Dates',
        code: 'INVALID',
        type: 'percentage',
        value: 10,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-07-01')
      });

      await expect(promotion.save()).rejects.toThrow('End date must be after start date');
    });

    it('should require value for percentage and fixed_amount types', async () => {
      const promotion = new Promotion({
        name: 'No Value',
        code: 'NOVALUE',
        type: 'percentage',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });

      await expect(promotion.save()).rejects.toThrow();
    });

    it('should not require value for free_shipping type', async () => {
      const promotion = new Promotion({
        name: 'Free Shipping',
        code: 'FREESHIP',
        type: 'free_shipping',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });

      const saved = await promotion.save();
      expect(saved.type).toBe('free_shipping');
      expect(saved.value).toBeUndefined();
    });
  });

  describe('Virtual Properties', () => {
    it('should correctly determine if promotion is valid', async () => {
      const activePromotion = await Promotion.create({
        name: 'Active Promo',
        code: 'ACTIVE',
        type: 'percentage',
        value: 10,
        status: 'active',
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000)
      });

      expect(activePromotion.isValid).toBe(true);

      const expiredPromotion = await Promotion.create({
        name: 'Expired Promo',
        code: 'EXPIRED',
        type: 'percentage',
        value: 10,
        status: 'active',
        startDate: new Date(Date.now() - 172800000),
        endDate: new Date(Date.now() - 86400000)
      });

      expect(expiredPromotion.isValid).toBe(false);
    });

    it('should check if promotion has reached usage limit', async () => {
      const promotion = await Promotion.create({
        name: 'Limited Use',
        code: 'LIMITED',
        type: 'percentage',
        value: 10,
        totalUsageLimit: 5,
        timesUsed: 5,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });

      expect(promotion.hasReachedLimit).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    describe('canUserUse', () => {
      it('should allow user to use valid promotion', async () => {
        const promotion = await Promotion.create({
          name: 'User Test',
          code: 'USERTEST',
          type: 'percentage',
          value: 10,
          status: 'active',
          perUserUsageLimit: 2,
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        });

        const userId = new mongoose.Types.ObjectId();
        expect(promotion.canUserUse(userId)).toBe(true);
      });

      it('should prevent user from exceeding usage limit', async () => {
        const userId = new mongoose.Types.ObjectId();
        const promotion = await Promotion.create({
          name: 'Limited User',
          code: 'LIMITUSER',
          type: 'percentage',
          value: 10,
          status: 'active',
          perUserUsageLimit: 1,
          usersUsed: [{
            userId,
            usageCount: 1
          }],
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        });

        expect(promotion.canUserUse(userId)).toBe(false);
      });
    });

    describe('calculateDiscount', () => {
      it('should calculate percentage discount correctly', async () => {
        const promotion = await Promotion.create({
          name: 'Percent Off',
          code: 'PERCENT20',
          type: 'percentage',
          value: 20,
          status: 'active',
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        });

        expect(promotion.calculateDiscount(100)).toBe(20);
        expect(promotion.calculateDiscount(150)).toBe(30);
      });

      it('should calculate fixed amount discount correctly', async () => {
        const promotion = await Promotion.create({
          name: 'Fixed Off',
          code: 'FIXED10',
          type: 'fixed_amount',
          value: 10,
          status: 'active',
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        });

        expect(promotion.calculateDiscount(100)).toBe(10);
        expect(promotion.calculateDiscount(5)).toBe(5); // Can't discount more than subtotal
      });

      it('should calculate free shipping discount correctly', async () => {
        const promotion = await Promotion.create({
          name: 'Free Ship',
          code: 'FREESHIP',
          type: 'free_shipping',
          status: 'active',
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        });

        expect(promotion.calculateDiscount(100, 15)).toBe(15);
        expect(promotion.calculateDiscount(100, 25)).toBe(25);
      });

      it('should respect minimum order subtotal', async () => {
        const promotion = await Promotion.create({
          name: 'Min Order',
          code: 'MIN50',
          type: 'percentage',
          value: 20,
          minimumOrderSubtotal: 50,
          status: 'active',
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        });

        expect(promotion.calculateDiscount(40)).toBe(0);
        expect(promotion.calculateDiscount(60)).toBe(12);
      });
    });

    describe('recordUsage', () => {
      it('should record promotion usage correctly', async () => {
        const promotion = await Promotion.create({
          name: 'Usage Test',
          code: 'USAGE',
          type: 'percentage',
          value: 10,
          status: 'active',
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        });

        const userId = new mongoose.Types.ObjectId();
        await promotion.recordUsage(userId);

        expect(promotion.timesUsed).toBe(1);
        expect(promotion.usersUsed).toHaveLength(1);
        expect(promotion.usersUsed[0].userId.toString()).toBe(userId.toString());
        expect(promotion.usersUsed[0].usageCount).toBe(1);
      });

      it('should increment usage count for existing user', async () => {
        const userId = new mongoose.Types.ObjectId();
        const promotion = await Promotion.create({
          name: 'Multi Use',
          code: 'MULTI',
          type: 'percentage',
          value: 10,
          status: 'active',
          timesUsed: 1,
          usersUsed: [{
            userId,
            usageCount: 1
          }],
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000)
        });

        await promotion.recordUsage(userId);

        expect(promotion.timesUsed).toBe(2);
        expect(promotion.usersUsed).toHaveLength(1);
        expect(promotion.usersUsed[0].usageCount).toBe(2);
      });
    });
  });

  describe('Static Methods', () => {
    it('should find active promotions', async () => {
      await Promotion.create({
        name: 'Active 1',
        code: 'ACTIVE1',
        type: 'percentage',
        value: 10,
        status: 'active',
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000)
      });

      await Promotion.create({
        name: 'Inactive',
        code: 'INACTIVE',
        type: 'percentage',
        value: 10,
        status: 'inactive',
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000)
      });

      const activePromotions = await Promotion.findActive();
      expect(activePromotions).toHaveLength(1);
      expect(activePromotions[0].code).toBe('ACTIVE1');
    });

    it('should find promotion by code', async () => {
      await Promotion.create({
        name: 'Find Me',
        code: 'FINDME',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });

      const found = await Promotion.findByCode('findme');
      expect(found).toBeTruthy();
      expect(found.code).toBe('FINDME');

      const notFound = await Promotion.findByCode('NOTEXIST');
      expect(notFound).toBeNull();
    });
  });

  describe('Pre-save Hooks', () => {
    it('should auto-expire promotions past end date', async () => {
      const promotion = new Promotion({
        name: 'Auto Expire',
        code: 'AUTOEXP',
        type: 'percentage',
        value: 10,
        status: 'active',
        startDate: new Date(Date.now() - 172800000),
        endDate: new Date(Date.now() - 86400000)
      });

      const saved = await promotion.save();
      expect(saved.status).toBe('expired');
    });

    it('should convert code to uppercase', async () => {
      const promotion = await Promotion.create({
        name: 'Uppercase',
        code: 'lowercase',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000)
      });

      expect(promotion.code).toBe('LOWERCASE');
    });
  });
});