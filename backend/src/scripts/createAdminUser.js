import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

export const createAdminUser = async (adminData = null) => {
  let shouldDisconnect = false;
  
  try {
    // Connect to MongoDB only if not already connected (e.g., in tests)
    if (mongoose.connection.readyState === 0) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/graphene-store';
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB');
      shouldDisconnect = true; // We made the connection, so we should disconnect
    } else {
      console.log('Using existing MongoDB connection');
    }

    // Admin user details
    const defaultAdminData = {
      email: process.env.ADMIN_EMAIL || 'admin@grapheneos-store.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      emailVerified: true
    };
    
    const finalAdminData = adminData || defaultAdminData;

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: finalAdminData.email });
    if (existingAdmin) {
      console.log(`Admin user with email ${finalAdminData.email} already exists`);
      
      // Update existing user to admin role if needed
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated existing user to admin role');
      }
      
      // Only exit if running as script (not when called from tests)
      if (!adminData && !process.env.NODE_ENV?.includes('test') && !global.isTestEnvironment) {
        process.exit(0);
      }
      return existingAdmin;
    }

    // Create new admin user
    const adminUser = new User(finalAdminData);
    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${finalAdminData.email}`);
    console.log(`Password: ${finalAdminData.password}`);
    console.log('');
    console.log('🔐 Please change the default password after first login');
    console.log('🌐 Admin login URL: http://localhost:3000/admin/login (frontend)');
    
    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    // Only exit if running as script (not when called from tests)
    if (!adminData && !process.env.NODE_ENV?.includes('test') && !global.isTestEnvironment) {
      process.exit(1);
    }
    throw error; // Re-throw for test handling
  } finally {
    // Only disconnect if we made the connection and not in test environment
    if (shouldDisconnect && !process.env.NODE_ENV?.includes('test') && !global.isTestEnvironment) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
};

// Run the script only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser();
}