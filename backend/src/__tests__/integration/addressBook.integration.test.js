import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../server.js';
import jwt from 'jsonwebtoken';

// Import User model dynamically to ensure methods are loaded
let User;
beforeAll(async () => {
  // Delete the model if it exists to ensure fresh import
  try {
    delete mongoose.models.User;
    delete mongoose.modelSchemas.User;
  } catch (error) {
    // Model doesn't exist yet, that's fine
  }
  
  // Import User model
  const userModule = await import('../../models/User.js');
  User = userModule.default;
});

describe('Address Book Integration Tests - Story 6.2', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
    vi.clearAllMocks();
  });

  // Task 6.2.19.1: Register a test user and log in
  describe('Task 6.2.19.1 - User Registration and Login', () => {
    it('should register a new user and log in to access address book', async () => {
      // Register a new user
      const registrationData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'User',
        marketingOptIn: true
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registrationData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user.email).toBe('newuser@example.com');

      // Log in with the new user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: registrationData.email,
          password: registrationData.password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();

      authToken = loginResponse.body.data.token;

      // Verify the user can access their (empty) address book
      const addressResponse = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(addressResponse.status).toBe(200);
      expect(addressResponse.body.success).toBe(true);
      expect(addressResponse.body.data.addresses).toHaveLength(0);
      // Accept either null or undefined for empty defaults
      expect(addressResponse.body.data.defaultShippingAddressId == null).toBe(true);
      expect(addressResponse.body.data.defaultBillingAddressId == null).toBe(true);
    });

    it('should prevent access to address book without authentication', async () => {
      const response = await request(app)
        .get('/api/user/addresses');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // Task 6.2.19.2: Add new addresses
  describe('Task 6.2.19.2 - Adding Addresses', () => {
    beforeEach(async () => {
      testUser = new User({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true
      });
      await testUser.save();
      authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'your-secret-key');
    });

    it('should add multiple addresses successfully', async () => {
      const addresses = [
        {
          fullName: 'Home Address',
          company: '',
          addressLine1: '123 Home St',
          addressLine2: 'Apt 1',
          city: 'London',
          stateProvince: 'England',
          postalCode: 'SW1A 1AA',
          country: 'United Kingdom',
          phoneNumber: '+44 20 7946 0958',
          setAsDefaultShipping: true,
          setAsDefaultBilling: false
        },
        {
          fullName: 'Work Address',
          company: 'Tech Company Ltd',
          addressLine1: '456 Business Ave',
          addressLine2: 'Floor 10',
          city: 'Manchester',
          stateProvince: 'England',
          postalCode: 'M1 1AE',
          country: 'United Kingdom',
          phoneNumber: '+44 161 123 4567',
          setAsDefaultShipping: false,
          setAsDefaultBilling: true
        },
        {
          fullName: 'Parent\'s House',
          company: '',
          addressLine1: '789 Family Rd',
          addressLine2: '',
          city: 'Birmingham',
          stateProvince: 'England',
          postalCode: 'B1 1BB',
          country: 'United Kingdom',
          phoneNumber: '+44 121 987 6543',
          setAsDefaultShipping: false,
          setAsDefaultBilling: false
        }
      ];

      // Add all addresses
      for (const address of addresses) {
        const response = await request(app)
          .post('/api/user/addresses')
          .set('Authorization', `Bearer ${authToken}`)
          .send(address);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Address added successfully');
      }

      // Verify all addresses were saved
      const getResponse = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.addresses).toHaveLength(3);
      
      // Verify defaults were set correctly
      const homeAddress = getResponse.body.data.addresses.find(a => a.fullName === 'Home Address');
      const workAddress = getResponse.body.data.addresses.find(a => a.fullName === 'Work Address');
      
      expect(getResponse.body.data.defaultShippingAddressId).toBe(homeAddress._id);
      expect(getResponse.body.data.defaultBillingAddressId).toBe(workAddress._id);
    });

    it('should validate all required fields when adding address', async () => {
      const invalidAddress = {
        fullName: '', // Empty required field
        addressLine1: '', // Empty required field
        city: 'London',
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAddress);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  // Task 6.2.19.3: Fetch all addresses
  describe('Task 6.2.19.3 - Fetching Addresses', () => {
    let addedAddresses;

    beforeEach(async () => {
      testUser = new User({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true
      });
      
      // Add some test addresses
      const user = testUser;
      addedAddresses = [];
      
      addedAddresses.push(user.addAddress({
        fullName: 'Primary Address',
        addressLine1: '123 Main St',
        city: 'New York',
        stateProvince: 'NY',
        postalCode: '10001',
        country: 'United States',
        phoneNumber: '+1 (555) 111-1111'
      }));
      
      addedAddresses.push(user.addAddress({
        fullName: 'Secondary Address',
        company: 'My Company',
        addressLine1: '456 Oak Ave',
        city: 'Los Angeles',
        stateProvince: 'CA',
        postalCode: '90210',
        country: 'United States',
        phoneNumber: '+1 (555) 222-2222'
      }));
      
      // Set one as deleted (soft delete)
      addedAddresses.push(user.addAddress({
        fullName: 'Deleted Address',
        addressLine1: '789 Deleted St',
        city: 'Chicago',
        stateProvince: 'IL',
        postalCode: '60601',
        country: 'United States',
        isDeleted: true
      }));
      
      user.defaultShippingAddressId = addedAddresses[0]._id;
      user.defaultBillingAddressId = addedAddresses[1]._id;
      
      await user.save();
      authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'your-secret-key');
    });

    it('should fetch all active addresses with correct details', async () => {
      const response = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Should only return 2 addresses (not the deleted one)
      expect(response.body.data.addresses).toHaveLength(2);
      
      // Verify address details
      const primaryAddress = response.body.data.addresses.find(a => a.fullName === 'Primary Address');
      expect(primaryAddress).toBeDefined();
      expect(primaryAddress.addressLine1).toBe('123 Main St');
      expect(primaryAddress.city).toBe('New York');
      expect(primaryAddress.phoneNumber).toBe('+1 (555) 111-1111');
      
      const secondaryAddress = response.body.data.addresses.find(a => a.fullName === 'Secondary Address');
      expect(secondaryAddress).toBeDefined();
      expect(secondaryAddress.company).toBe('My Company');
      
      // Verify defaults
      expect(response.body.data.defaultShippingAddressId).toBe(primaryAddress._id);
      expect(response.body.data.defaultBillingAddressId).toBe(secondaryAddress._id);
      
      // Verify deleted address is not returned
      const deletedAddress = response.body.data.addresses.find(a => a.fullName === 'Deleted Address');
      expect(deletedAddress).toBeUndefined();
    });

    it('should return empty list for user with no addresses', async () => {
      // Create a new user with no addresses
      const newUser = new User({
        email: 'noaddress@example.com',
        password: 'Password123!',
        firstName: 'No',
        lastName: 'Address'
      });
      await newUser.save();
      
      const newAuthToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || 'your-secret-key');
      
      const response = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${newAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.addresses).toHaveLength(0);
      // Accept either null or undefined for empty defaults
      expect(response.body.data.defaultShippingAddressId == null).toBe(true);
      expect(response.body.data.defaultBillingAddressId == null).toBe(true);
    });
  });

  // Task 6.2.19.4: Edit addresses
  describe('Task 6.2.19.4 - Editing Addresses', () => {
    let addressToEdit;

    beforeEach(async () => {
      testUser = new User({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true
      });
      
      addressToEdit = testUser.addAddress({
        fullName: 'Original Name',
        addressLine1: '123 Original St',
        city: 'Original City',
        stateProvince: 'CA',
        postalCode: '90210',
        country: 'United States'
      });
      
      await testUser.save();
      authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'your-secret-key');
    });

    it('should edit an address with all fields updated', async () => {
      const updatedData = {
        fullName: 'Updated Full Name',
        company: 'New Company',
        addressLine1: '456 Updated St',
        addressLine2: 'Suite 200',
        city: 'Updated City',
        stateProvince: 'NY',
        postalCode: '10001',
        country: 'United States',
        phoneNumber: '+1 (555) 999-8888',
        setAsDefaultShipping: true,
        setAsDefaultBilling: true
      };

      const response = await request(app)
        .put(`/api/user/addresses/${addressToEdit._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Address updated successfully');
      
      // Verify the address was updated
      expect(response.body.data.address.fullName).toBe('Updated Full Name');
      expect(response.body.data.address.company).toBe('New Company');
      expect(response.body.data.address.addressLine1).toBe('456 Updated St');
      expect(response.body.data.address.addressLine2).toBe('Suite 200');
      expect(response.body.data.address.city).toBe('Updated City');
      expect(response.body.data.address.stateProvince).toBe('NY');
      expect(response.body.data.address.postalCode).toBe('10001');
      expect(response.body.data.address.phoneNumber).toBe('+1 (555) 999-8888');
      
      // Verify defaults were set
      expect(response.body.data.defaultShippingAddressId).toBe(addressToEdit._id.toString());
      expect(response.body.data.defaultBillingAddressId).toBe(addressToEdit._id.toString());
    });

    it('should edit only specific fields without affecting others', async () => {
      const partialUpdate = {
        fullName: 'Only Name Changed',
        phoneNumber: '+1 (555) 777-6666'
      };

      const response = await request(app)
        .put(`/api/user/addresses/${addressToEdit._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdate);

      expect(response.status).toBe(200);
      
      // Get the updated address to verify
      const getResponse = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);
      
      const updatedAddress = getResponse.body.data.addresses[0];
      expect(updatedAddress.fullName).toBe('Only Name Changed');
      expect(updatedAddress.phoneNumber).toBe('+1 (555) 777-6666');
      
      // Original fields should be unchanged
      expect(updatedAddress.addressLine1).toBe('123 Original St');
      expect(updatedAddress.city).toBe('Original City');
      expect(updatedAddress.stateProvince).toBe('CA');
    });

    it('should validate updated fields', async () => {
      const invalidUpdate = {
        fullName: 'a'.repeat(101), // Exceeds max length
        phoneNumber: 'invalid-phone-format',
        country: 'Unsupported Country'
      };

      const response = await request(app)
        .put(`/api/user/addresses/${addressToEdit._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  // Task 6.2.19.5: Set default addresses
  describe('Task 6.2.19.5 - Setting Default Addresses', () => {
    let address1, address2, address3;

    beforeEach(async () => {
      testUser = new User({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true
      });
      
      address1 = testUser.addAddress({
        fullName: 'Home Address',
        addressLine1: '123 Home St',
        city: 'Home City',
        stateProvince: 'CA',
        postalCode: '90210',
        country: 'United States'
      });
      
      address2 = testUser.addAddress({
        fullName: 'Work Address',
        addressLine1: '456 Work Ave',
        city: 'Work City',
        stateProvince: 'NY',
        postalCode: '10001',
        country: 'United States'
      });
      
      address3 = testUser.addAddress({
        fullName: 'Vacation Home',
        addressLine1: '789 Beach Rd',
        city: 'Beach City',
        stateProvince: 'FL',
        postalCode: '33139',
        country: 'United States'
      });
      
      await testUser.save();
      authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'your-secret-key');
    });

    it('should set different addresses as default shipping and billing', async () => {
      // Set address1 as default shipping
      const shippingResponse = await request(app)
        .put(`/api/user/addresses/${address1._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'shipping' });

      expect(shippingResponse.status).toBe(200);
      expect(shippingResponse.body.success).toBe(true);
      expect(shippingResponse.body.data.defaultShippingAddressId).toBe(address1._id.toString());
      
      // Set address2 as default billing
      const billingResponse = await request(app)
        .put(`/api/user/addresses/${address2._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'billing' });

      expect(billingResponse.status).toBe(200);
      expect(billingResponse.body.success).toBe(true);
      expect(billingResponse.body.data.defaultBillingAddressId).toBe(address2._id.toString());
      
      // Verify both defaults are set correctly
      const getResponse = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body.data.defaultShippingAddressId).toBe(address1._id.toString());
      expect(getResponse.body.data.defaultBillingAddressId).toBe(address2._id.toString());
    });

    it('should change default from one address to another', async () => {
      // First set address1 as default shipping
      await request(app)
        .put(`/api/user/addresses/${address1._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'shipping' });

      // Then change to address3
      const response = await request(app)
        .put(`/api/user/addresses/${address3._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'shipping' });

      expect(response.status).toBe(200);
      expect(response.body.data.defaultShippingAddressId).toBe(address3._id.toString());
      
      // Verify the change persisted
      const user = await User.findById(testUser._id);
      expect(user.defaultShippingAddressId.toString()).toBe(address3._id.toString());
    });

    it('should set same address as both default shipping and billing', async () => {
      // Set as default shipping
      await request(app)
        .put(`/api/user/addresses/${address1._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'shipping' });

      // Set same address as default billing
      const response = await request(app)
        .put(`/api/user/addresses/${address1._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'billing' });

      expect(response.status).toBe(200);
      
      const getResponse = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body.data.defaultShippingAddressId).toBe(address1._id.toString());
      expect(getResponse.body.data.defaultBillingAddressId).toBe(address1._id.toString());
    });

    it('should reject invalid address type', async () => {
      const response = await request(app)
        .put(`/api/user/addresses/${address1._id}/default`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'invalid_type' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Address type must be either');
    });
  });

  // Task 6.2.19.6: Delete addresses
  describe('Task 6.2.19.6 - Deleting Addresses', () => {
    let addressToDelete, defaultAddress;

    beforeEach(async () => {
      testUser = new User({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true
      });
      
      addressToDelete = testUser.addAddress({
        fullName: 'Address to Delete',
        addressLine1: '123 Delete St',
        city: 'Delete City',
        stateProvince: 'CA',
        postalCode: '90210',
        country: 'United States'
      });
      
      defaultAddress = testUser.addAddress({
        fullName: 'Default Address',
        addressLine1: '456 Default Ave',
        city: 'Default City',
        stateProvince: 'NY',
        postalCode: '10001',
        country: 'United States'
      });
      
      // Set the second address as both defaults
      testUser.defaultShippingAddressId = defaultAddress._id;
      testUser.defaultBillingAddressId = defaultAddress._id;
      
      await testUser.save();
      authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'your-secret-key');
    });

    it('should delete a non-default address', async () => {
      const response = await request(app)
        .delete(`/api/user/addresses/${addressToDelete._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Address deleted successfully');
      
      // Verify the address is soft deleted
      const user = await User.findById(testUser._id);
      const deletedAddress = user.addresses.id(addressToDelete._id);
      expect(deletedAddress.isDeleted).toBe(true);
      
      // Verify it doesn't appear in the address list
      const getResponse = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.body.data.addresses).toHaveLength(1);
      expect(getResponse.body.data.addresses[0]._id).toBe(defaultAddress._id.toString());
    });

    it('should clear defaults when deleting a default address', async () => {
      const response = await request(app)
        .delete(`/api/user/addresses/${defaultAddress._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify defaults were cleared
      expect(response.body.data.defaultShippingAddressId).toBeNull();
      expect(response.body.data.defaultBillingAddressId).toBeNull();
      
      // Verify in database
      const user = await User.findById(testUser._id);
      expect(user.defaultShippingAddressId).toBeNull();
      expect(user.defaultBillingAddressId).toBeNull();
    });

    it('should prevent deleting non-existent address', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/user/addresses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Address not found');
    });

    it('should prevent deleting already deleted address', async () => {
      // First deletion
      await request(app)
        .delete(`/api/user/addresses/${addressToDelete._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Attempt second deletion
      const response = await request(app)
        .delete(`/api/user/addresses/${addressToDelete._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Address not found');
    });
  });

  // Task 6.2.19.7: Test unauthorized access
  describe('Task 6.2.19.7 - Unauthorized Access Tests', () => {
    let userAddress;
    let otherUserToken;

    beforeEach(async () => {
      // Create first user with an address
      testUser = new User({
        email: 'user1@example.com',
        password: 'Password123!',
        firstName: 'User',
        lastName: 'One',
        emailVerified: true
      });
      
      userAddress = testUser.addAddress({
        fullName: 'User One Address',
        addressLine1: '123 Private St',
        city: 'Private City',
        stateProvince: 'CA',
        postalCode: '90210',
        country: 'United States'
      });
      
      await testUser.save();
      authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'your-secret-key');

      // Create second user
      const otherUser = new User({
        email: 'user2@example.com',
        password: 'Password123!',
        firstName: 'User',
        lastName: 'Two',
        emailVerified: true
      });
      await otherUser.save();
      otherUserToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET || 'your-secret-key');
    });

    it('should prevent unauthenticated access to all address endpoints', async () => {
      // Test GET addresses
      let response = await request(app)
        .get('/api/user/addresses');
      expect(response.status).toBe(401);

      // Test GET specific address
      response = await request(app)
        .get(`/api/user/addresses/${userAddress._id}`);
      expect(response.status).toBe(401);

      // Test POST address
      response = await request(app)
        .post('/api/user/addresses')
        .send({
          fullName: 'Test',
          addressLine1: '123 Test St',
          city: 'Test City',
          stateProvince: 'CA',
          postalCode: '12345',
          country: 'United States'
        });
      expect(response.status).toBe(401);

      // Test PUT address
      response = await request(app)
        .put(`/api/user/addresses/${userAddress._id}`)
        .send({ fullName: 'Updated' });
      expect(response.status).toBe(401);

      // Test DELETE address
      response = await request(app)
        .delete(`/api/user/addresses/${userAddress._id}`);
      expect(response.status).toBe(401);

      // Test PUT default address
      response = await request(app)
        .put(`/api/user/addresses/${userAddress._id}/default`)
        .send({ type: 'shipping' });
      expect(response.status).toBe(401);
    });

    it('should prevent user from accessing another user\'s addresses', async () => {
      // Try to get first user's addresses with second user's token
      const response = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.addresses).toHaveLength(0); // Should not see other user's addresses
    });

    it('should prevent user from modifying another user\'s address', async () => {
      // Try to update first user's address with second user's token
      const response = await request(app)
        .put(`/api/user/addresses/${userAddress._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ fullName: 'Hacked Name' });

      expect(response.status).toBe(404); // Address not found for this user
      
      // Verify the address wasn't changed
      const user = await User.findById(testUser._id);
      const address = user.addresses.id(userAddress._id);
      expect(address.fullName).toBe('User One Address'); // Original name unchanged
    });

    it('should prevent user from deleting another user\'s address', async () => {
      // Try to delete first user's address with second user's token
      const response = await request(app)
        .delete(`/api/user/addresses/${userAddress._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(404); // Address not found for this user
      
      // Verify the address wasn't deleted
      const user = await User.findById(testUser._id);
      const address = user.addresses.id(userAddress._id);
      expect(address.isDeleted).toBe(false);
    });

    it('should prevent user from setting another user\'s address as default', async () => {
      // Try to set first user's address as default with second user's token
      const response = await request(app)
        .put(`/api/user/addresses/${userAddress._id}/default`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ type: 'shipping' });

      expect(response.status).toBe(404); // Address not found for this user
      
      // Verify no defaults were set for the second user
      const otherUser = await User.findOne({ email: 'user2@example.com' });
      expect(otherUser.defaultShippingAddressId).toBeUndefined();
    });

    it('should handle expired or invalid tokens', async () => {
      const invalidToken = 'invalid.jwt.token';
      
      const response = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // Additional integration tests for complete flow
  describe('Complete Address Book Flow', () => {
    it('should handle complete user journey from registration to address management', async () => {
      // 1. Register new user
      const userData = {
        email: 'journey@example.com',
        password: 'JourneyPass123!',
        confirmPassword: 'JourneyPass123!',
        firstName: 'Journey',
        lastName: 'User',
        marketingOptIn: false
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(registerResponse.status).toBe(201);

      // 2. Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(loginResponse.status).toBe(200);
      const token = loginResponse.body.data.token;

      // 3. Add first address
      const firstAddress = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'Journey User',
          addressLine1: '123 Journey St',
          city: 'Journey City',
          stateProvince: 'CA',
          postalCode: '90210',
          country: 'United States',
          phoneNumber: '+1 (555) 123-4567',
          setAsDefaultShipping: true,
          setAsDefaultBilling: true
        });

      expect(firstAddress.status).toBe(201);
      const addressId = firstAddress.body.data.address._id;

      // 4. Update the address
      const updateResponse = await request(app)
        .put(`/api/user/addresses/${addressId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          addressLine2: 'Apt 42',
          phoneNumber: '+1 (555) 987-6543'
        });

      expect(updateResponse.status).toBe(200);

      // 5. Add second address
      const secondAddress = await request(app)
        .post('/api/user/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'Work Address',
          company: 'Journey Corp',
          addressLine1: '456 Business Blvd',
          city: 'Corporate City',
          stateProvince: 'NY',
          postalCode: '10001',
          country: 'United States'
        });

      expect(secondAddress.status).toBe(201);
      const secondAddressId = secondAddress.body.data.address._id;

      // 6. Change default billing to second address
      const setDefaultResponse = await request(app)
        .put(`/api/user/addresses/${secondAddressId}/default`)
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'billing' });

      expect(setDefaultResponse.status).toBe(200);

      // 7. Verify final state
      const finalState = await request(app)
        .get('/api/user/addresses')
        .set('Authorization', `Bearer ${token}`);

      expect(finalState.status).toBe(200);
      expect(finalState.body.data.addresses).toHaveLength(2);
      expect(finalState.body.data.defaultShippingAddressId).toBe(addressId);
      expect(finalState.body.data.defaultBillingAddressId).toBe(secondAddressId);

      // 8. Delete first address
      const deleteResponse = await request(app)
        .delete(`/api/user/addresses/${addressId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
      
      // Verify shipping default was cleared
      expect(deleteResponse.body.data.defaultShippingAddressId).toBeNull();
      expect(deleteResponse.body.data.defaultBillingAddressId).toBe(secondAddressId);
    });
  });
});