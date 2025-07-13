import { describe, it, test as _test, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../server.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger.js';

// Mock the logger to avoid console output during tests
vi.mock('../../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('User Address Controller - Unit and Integration Tests', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    await User.deleteMany({});
    
    // Create a test user with common data
    testUser = new User({
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      emailVerified: true
    });
    await testUser.save();
    
    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'your-secret-key');
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
    vi.clearAllMocks();
  });

  describe('GET /api/user/addresses', () => {
    it('should get all user addresses with default IDs', async () => {
      // Add addresses to user
      const user = await User.findById(testUser._id);
      const address1 = user.addAddress({
        fullName: 'John Doe',
        company: 'Acme Corp',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'New York',
        stateProvince: 'NY',
        postalCode: '10001',
        country: 'United States',
        phoneNumber: '+1 (555) 123-4567'
      });
      
      const address2 = user.addAddress({
        fullName: 'Jane Doe',
        addressLine1: '456 Oak Ave',
        city: 'Los Angeles',
        stateProvince: 'CA',
        postalCode: '90210',
        country: 'United States'
      });
      
      // Set defaults
      user.defaultShippingAddressId = address1._id;
      user.defaultBillingAddressId = address2._id;
      await user.save();

      const response = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.addresses).toHaveLength(2);
      expect(response.body.data.defaultShippingAddressId).toBe(address1._id.toString());
      expect(response.body.data.defaultBillingAddressId).toBe(address2._id.toString());
      
      // Check address details
      const returnedAddress1 = response.body.data.addresses.find(a => a._id === address1._id.toString());
      expect(returnedAddress1.fullName).toBe('John Doe');
      expect(returnedAddress1.company).toBe('Acme Corp');
      expect(returnedAddress1.isDeleted).toBe(false);
    });

    it('should return empty array for user with no addresses', async () => {
      const response = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.addresses).toHaveLength(0);
      expect(response.body.data.defaultShippingAddressId).toBeNull();
      expect(response.body.data.defaultBillingAddressId).toBeNull();
    });

    it('should not return soft-deleted addresses', async () => {
      const user = await User.findById(testUser._id);
      const _address1 = user.addAddress({
        fullName: 'Active Address',
        addressLine1: '123 Main St',
        city: 'New York',
        stateProvince: 'NY',
        postalCode: '10001',
        country: 'United States'
      });
      
      const _address2 = user.addAddress({
        fullName: 'Deleted Address',
        addressLine1: '456 Oak Ave',
        city: 'Los Angeles',
        stateProvince: 'CA',
        postalCode: '90210',
        country: 'United States',
        isDeleted: true
      });
      
      await user.save();

      const response = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.addresses).toHaveLength(1);
      expect(response.body.data.addresses[0].fullName).toBe('Active Address');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/user/addresses');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/customer/addresses/:addressId', () => {
    it('should get a specific address by ID', async () => {
      const user = await User.findById(testUser._id);
      const address = user.addAddress({
        fullName: 'John Doe',
        addressLine1: '123 Main St',
        city: 'New York',
        stateProvince: 'NY',
        postalCode: '10001',
        country: 'United States'
      });
      await user.save();

      const response = await request(app)
        .get(`/api/user/addresses/${address._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(address._id.toString());
      expect(response.body.data.fullName).toBe('John Doe');
    });

    it('should return 404 for non-existent address', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/user/addresses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Address not found');
    });

    it('should return 404 for deleted address', async () => {
      const user = await User.findById(testUser._id);
      const address = user.addAddress({
        fullName: 'Deleted Address',
        addressLine1: '123 Main St',
        city: 'New York',
        stateProvince: 'NY',
        postalCode: '10001',
        country: 'United States',
        isDeleted: true
      });
      await user.save();

      const response = await request(app)
        .get(`/api/user/addresses/${address._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/user/addresses', () => {
    const validAddress = {
      fullName: 'Jane Smith',
      company: 'Tech Co',
      addressLine1: '789 Pine St',
      addressLine2: 'Unit 12',
      city: 'Chicago',
      stateProvince: 'IL',
      postalCode: '60601',
      country: 'United States',
      phoneNumber: '+1 (555) 555-5555',
      setAsDefaultShipping: true,
      setAsDefaultBilling: false
    };

    it('should add a new address successfully', async () => {
      const response = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAddress);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Address added successfully');
      expect(response.body.data.address.fullName).toBe('Jane Smith');
      expect(response.body.data.address.company).toBe('Tech Co');
      expect(response.body.data.address._id).toBeDefined();
      expect(response.body.data.defaultShippingAddressId).toBe(response.body.data.address._id);
      expect(response.body.data.defaultBillingAddressId).toBeNull();

      // Verify address was saved to database
      const user = await User.findById(testUser._id);
      expect(user.addresses).toHaveLength(1);
      expect(user.addresses[0].fullName).toBe('Jane Smith');
      expect(user.defaultShippingAddressId.toString()).toBe(user.addresses[0]._id.toString());
    });

    it('should validate postal code based on country', async () => {
      const ukAddress = {
        ...validAddress,
        country: 'United Kingdom',
        postalCode: '12345' // Invalid UK postal code
      };

      const response = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ukAddress);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid postal code format for United Kingdom');
    });

    it('should accept valid postal codes for different countries', async () => {
      const testCases = [
        { country: 'United Kingdom', postalCode: 'SW1A 1AA' },
        { country: 'Canada', postalCode: 'K1A 0B1' },
        { country: 'Germany', postalCode: '10115' },
        { country: 'Netherlands', postalCode: '1234 AB' }
      ];

      for (const testCase of testCases) {
        const address = {
          ...validAddress,
          ...testCase
        };

        const response = await request(app)
          .post('/api/user/addresses')
          .set('Authorization', `Bearer ${authToken}`)
          .send(address);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);

        // Clean up for next iteration
        const user = await User.findById(testUser._id);
        user.addresses = [];
        await user.save();
      }
    });

    it('should set both default addresses when requested', async () => {
      const address = {
        ...validAddress,
        setAsDefaultShipping: true,
        setAsDefaultBilling: true
      };

      const response = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(address);

      expect(response.status).toBe(201);
      expect(response.body.data.defaultShippingAddressId).toBe(response.body.data.address._id);
      expect(response.body.data.defaultBillingAddressId).toBe(response.body.data.address._id);
    });

    it('should fail with missing required fields', async () => {
      const incompleteAddress = {
        fullName: 'Jane Smith',
        city: 'Chicago'
      };

      const response = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteAddress);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail with invalid country', async () => {
      const invalidCountryAddress = {
        ...validAddress,
        country: 'Unsupported Country'
      };

      const response = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCountryAddress);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].msg).toContain('Country not supported for shipping');
    });

    it('should log address creation', async () => {
      await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAddress);

      expect(logger.info).toHaveBeenCalledWith('Address added', expect.objectContaining({
        userId: testUser._id,
        action: 'add_address'
      }));
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/user/addresses')
        .send(validAddress);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/user/addresses/:addressId', () => {
    let existingAddress;

    beforeEach(async () => {
      const user = await User.findById(testUser._id);
      existingAddress = user.addAddress({
        fullName: 'Original Name',
        addressLine1: '123 Original St',
        city: 'Original City',
        stateProvince: 'CA',
        postalCode: '12345',
        country: 'United States'
      });
      await user.save();
    });

    it('should update an address successfully', async () => {
      const updatedData = {
        fullName: 'Updated Name',
        company: 'New Company',
        addressLine1: '456 Updated St',
        addressLine2: 'Suite 100',
        city: 'Updated City',
        stateProvince: 'NY',
        postalCode: '54321',
        country: 'United States',
        phoneNumber: '+1 (555) 999-8888',
        setAsDefaultShipping: true
      };

      const response = await request(app)
        .put(`/api/user/addresses/${existingAddress._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Address updated successfully');
      expect(response.body.data.address.fullName).toBe('Updated Name');
      expect(response.body.data.address.company).toBe('New Company');
      expect(response.body.data.address.city).toBe('Updated City');
      expect(response.body.data.defaultShippingAddressId).toBe(existingAddress._id.toString());

      // Verify update in database
      const user = await User.findById(testUser._id);
      const address = user.addresses.id(existingAddress._id);
      expect(address.fullName).toBe('Updated Name');
      expect(address.addressLine2).toBe('Suite 100');
    });

    it('should update only provided fields', async () => {
      const partialUpdate = {
        fullName: 'Partially Updated',
        phoneNumber: '+44 20 7946 0958'
      };

      const response = await request(app)
        .put(`/api/user/addresses/${existingAddress._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdate);

      expect(response.status).toBe(200);
      
      const user = await User.findById(testUser._id);
      const address = user.addresses.id(existingAddress._id);
      expect(address.fullName).toBe('Partially Updated');
      expect(address.city).toBe('Original City'); // Unchanged
      expect(address.phoneNumber).toBe('+44 20 7946 0958');
    });

    it('should validate postal code when country changes', async () => {
      const updateWithInvalidPostal = {
        country: 'United Kingdom',
        postalCode: '12345' // Valid for US, invalid for UK
      };

      const response = await request(app)
        .put(`/api/user/addresses/${existingAddress._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateWithInvalidPostal);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid postal code format for United Kingdom');
    });

    it('should fail with invalid address ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/user/addresses/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fullName: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Address not found');
    });

    it('should fail to update deleted address', async () => {
      const user = await User.findById(testUser._id);
      user.deleteAddress(existingAddress._id);
      await user.save();

      const response = await request(app)
        .put(`/api/user/addresses/${existingAddress._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fullName: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should log address update', async () => {
      await request(app)
        .put(`/api/user/addresses/${existingAddress._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ fullName: 'Updated' });

      expect(logger.info).toHaveBeenCalledWith('Address updated', expect.objectContaining({
        userId: testUser._id,
        addressId: existingAddress._id.toString(),
        action: 'update_address'
      }));
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/user/addresses/${existingAddress._id}`)
        .send({ fullName: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/user/addresses/:addressId', () => {
    let address1, address2;

    beforeEach(async () => {
      const user = await User.findById(testUser._id);
      address1 = user.addAddress({
        fullName: 'First Address',
        addressLine1: '123 First St',
        city: 'First City',
        stateProvince: 'CA',
        postalCode: '12345',
        country: 'United States'
      });
      
      address2 = user.addAddress({
        fullName: 'Second Address',
        addressLine1: '456 Second St',
        city: 'Second City',
        stateProvince: 'NY',
        postalCode: '54321',
        country: 'United States'
      });
      
      await user.save();
    });

    it('should soft delete an address successfully', async () => {
      const response = await request(app)
        .delete(`/api/user/addresses/${address1._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Address deleted successfully');

      // Verify soft deletion in database
      const user = await User.findById(testUser._id);
      const deletedAddress = user.addresses.id(address1._id);
      expect(deletedAddress.isDeleted).toBe(true);
      
      // Verify it doesn't appear in active addresses
      const activeAddresses = user.getActiveAddresses();
      expect(activeAddresses).toHaveLength(1);
      expect(activeAddresses[0]._id.toString()).toBe(address2._id.toString());
    });

    it('should clear default address when deleting default address', async () => {
      // Set address as default
      const user = await User.findById(testUser._id);
      user.defaultShippingAddressId = address1._id;
      user.defaultBillingAddressId = address1._id;
      await user.save();

      const response = await request(app)
        .delete(`/api/user/addresses/${address1._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify defaults were cleared
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.defaultShippingAddressId).toBeNull();
      expect(updatedUser.defaultBillingAddressId).toBeNull();
    });

    it('should fail with invalid address ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/user/addresses/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Address not found');
    });

    it('should fail to delete already deleted address', async () => {
      // First delete
      await request(app)
        .delete(`/api/user/addresses/${address1._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to delete again
      const response = await request(app)
        .delete(`/api/user/addresses/${address1._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Address not found');
    });

    it('should log address deletion', async () => {
      await request(app)
        .delete(`/api/user/addresses/${address1._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(logger.info).toHaveBeenCalledWith('Address deleted', expect.objectContaining({
        userId: testUser._id,
        addressId: address1._id.toString(),
        action: 'delete_address'
      }));
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/user/addresses/${address1._id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/user/addresses/:addressId/default', () => {
    let address1, address2;

    beforeEach(async () => {
      const user = await User.findById(testUser._id);
      address1 = user.addAddress({
        fullName: 'Address 1',
        addressLine1: '123 Main St',
        city: 'City 1',
        stateProvince: 'CA',
        postalCode: '12345',
        country: 'United States'
      });
      
      address2 = user.addAddress({
        fullName: 'Address 2',
        addressLine1: '456 Oak Ave',
        city: 'City 2',
        stateProvince: 'NY',
        postalCode: '54321',
        country: 'United States'
      });
      
      await user.save();
    });

    it('should set default shipping address', async () => {
      const response = await request(app)
        .put(`/api/user/addresses/${address1._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'shipping' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Default shipping address set successfully');
      expect(response.body.data.defaultShippingAddressId).toBe(address1._id.toString());
      
      const user = await User.findById(testUser._id);
      expect(user.defaultShippingAddressId.toString()).toBe(address1._id.toString());
    });

    it('should set default billing address', async () => {
      const response = await request(app)
        .put(`/api/user/addresses/${address2._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'billing' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Default billing address set successfully');
      expect(response.body.data.defaultBillingAddressId).toBe(address2._id.toString());
    });

    it('should change default address from one to another', async () => {
      // Set initial default
      const user = await User.findById(testUser._id);
      user.defaultShippingAddressId = address1._id;
      await user.save();

      // Change to different address
      const response = await request(app)
        .put(`/api/user/addresses/${address2._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'shipping' });

      expect(response.status).toBe(200);
      expect(response.body.data.defaultShippingAddressId).toBe(address2._id.toString());
    });

    it('should fail with invalid address type', async () => {
      const response = await request(app)
        .put(`/api/user/addresses/${address1._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid address type');
    });

    it('should fail with non-existent address', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/user/addresses/${fakeId}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'shipping' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Address not found');
    });

    it('should fail to set deleted address as default', async () => {
      const user = await User.findById(testUser._id);
      user.deleteAddress(address1._id);
      await user.save();

      const response = await request(app)
        .put(`/api/user/addresses/${address1._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'shipping' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Address not found');
    });

    it('should log default address setting', async () => {
      await request(app)
        .put(`/api/user/addresses/${address1._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'shipping' });

      expect(logger.info).toHaveBeenCalledWith('Default address set', expect.objectContaining({
        userId: testUser._id,
        addressId: address1._id.toString(),
        type: 'shipping',
        action: 'set_default_address'
      }));
    });
  });

  describe('User ownership and security', () => {
    let otherUser;
    let otherUserToken;
    let userAddress;

    beforeEach(async () => {
      // Create another user
      otherUser = new User({
        email: 'other@example.com',
        password: 'OtherPassword123!',
        firstName: 'Other',
        lastName: 'User'
      });
      await otherUser.save();
      otherUserToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET || 'your-secret-key');

      // Add address to original test user
      const user = await User.findById(testUser._id);
      userAddress = user.addAddress({
        fullName: 'User Address',
        addressLine1: '123 Main St',
        city: 'City',
        stateProvince: 'CA',
        postalCode: '12345',
        country: 'United States'
      });
      await user.save();
    });

    it('should not allow accessing another user\'s addresses', async () => {
      const response = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.addresses).toHaveLength(0); // Should not see other user's addresses
    });

    it('should not allow updating another user\'s address', async () => {
      const response = await request(app)
        .put(`/api/user/addresses/${userAddress._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ fullName: 'Hacked' });

      expect(response.status).toBe(404); // Address not found for this user
    });

    it('should not allow deleting another user\'s address', async () => {
      const response = await request(app)
        .delete(`/api/user/addresses/${userAddress._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Address limits and edge cases', () => {
    it('should handle maximum length validation', async () => {
      const longAddress = {
        fullName: 'a'.repeat(101), // Exceeds 100 char limit
        addressLine1: 'b'.repeat(101), // Exceeds 100 char limit
        city: 'c'.repeat(51), // Exceeds 50 char limit
        stateProvince: 'CA',
        postalCode: '12345',
        country: 'United States'
      };

      const response = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(longAddress);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should handle special characters in city names', async () => {
      const address = {
        fullName: 'John Doe',
        addressLine1: '123 Main St',
        city: 'Saint-Paul-de-l\'Île-aux-Noix', // City with special chars
        stateProvince: 'QC',
        postalCode: 'J0J 1G0',
        country: 'Canada'
      };

      const response = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(address);

      expect(response.status).toBe(201);
      expect(response.body.data.address.city).toBe('Saint-Paul-de-l\'Île-aux-Noix');
    });

    it('should handle multiple addresses for same user', async () => {
      // Add 10 addresses
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/user/addresses')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              fullName: `Address ${i}`,
              addressLine1: `${i} Main St`,
              city: 'City',
              stateProvince: 'CA',
              postalCode: '12345',
              country: 'United States'
            })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all addresses are saved
      const getResponse = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body.data.addresses).toHaveLength(10);
    });
  });
});