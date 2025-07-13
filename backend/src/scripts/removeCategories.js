import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const CATEGORIES_TO_REMOVE = [
  'smartphones',
  'accessories', 
  'cases'
];

const CATEGORIES_TO_REMOVE_NAMES = [
  'Smartphones',
  'Accessories', 
  'Cases'
  // Keeping Action Figure Accessories
];

const removeCategories = async () => {
  try {
    console.log('🔄 Connecting to database...');
    
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/graphene-store';
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Find categories to remove
    console.log('\n📋 Finding categories to remove...');
    
    const categoriesToRemove = await Category.find({
      $or: [
        { slug: { $in: CATEGORIES_TO_REMOVE } },
        { name: { $in: CATEGORIES_TO_REMOVE_NAMES } }
      ]
    });

    console.log(`Found ${categoriesToRemove.length} categories to remove:`);
    categoriesToRemove.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    if (categoriesToRemove.length === 0) {
      console.log('ℹ️  No matching categories found. Exiting.');
      await mongoose.disconnect();
      return;
    }

    // Get category IDs
    const categoryIds = categoriesToRemove.map(cat => cat._id);

    // Step 2: Find products in these categories
    console.log('\n📦 Finding products in these categories...');
    
    const productsToRemove = await Product.find({
      category: { $in: categoryIds }
    });

    console.log(`Found ${productsToRemove.length} products to remove`);

    // Show sample products
    if (productsToRemove.length > 0) {
      console.log('\nSample products that will be removed:');
      productsToRemove.slice(0, 5).forEach(product => {
        console.log(`  - ${product.name}`);
      });
      if (productsToRemove.length > 5) {
        console.log(`  ... and ${productsToRemove.length - 5} more`);
      }
    }

    // Step 3: Ask for confirmation (in a real scenario)
    console.log('\n⚠️  CONFIRMATION: This will permanently delete:');
    console.log(`   - ${productsToRemove.length} products`);
    console.log(`   - ${categoriesToRemove.length} categories`);
    console.log('\nProceeding with deletion...\n');

    // Step 4: Remove products
    if (productsToRemove.length > 0) {
      console.log('🗑️  Removing products...');
      const deleteProductsResult = await Product.deleteMany({
        category: { $in: categoryIds }
      });
      console.log(`✅ Removed ${deleteProductsResult.deletedCount} products`);
    }

    // Step 5: Remove categories
    console.log('🗑️  Removing categories...');
    const deleteCategoriesResult = await Category.deleteMany({
      _id: { $in: categoryIds }
    });
    console.log(`✅ Removed ${deleteCategoriesResult.deletedCount} categories`);

    // Step 6: Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    
    const remainingProducts = await Product.countDocuments({
      category: { $in: categoryIds }
    });
    
    const remainingCategories = await Category.countDocuments({
      _id: { $in: categoryIds }
    });

    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    console.log('\n📊 Cleanup Summary:');
    console.log(`   - Remaining products in deleted categories: ${remainingProducts}`);
    console.log(`   - Remaining deleted categories: ${remainingCategories}`);
    console.log(`   - Total products remaining: ${totalProducts}`);
    console.log(`   - Total categories remaining: ${totalCategories}`);

    if (remainingProducts === 0 && remainingCategories === 0) {
      console.log('\n✅ Cleanup completed successfully!');
    } else {
      console.log('\n⚠️  Some items may not have been removed completely.');
    }

    // Show remaining categories
    console.log('\n📋 Remaining categories:');
    const remainingCategoriesList = await Category.find({}).select('name slug');
    if (remainingCategoriesList.length > 0) {
      remainingCategoriesList.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
    } else {
      console.log('   - No categories remaining');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    console.log('\n🔌 Disconnecting from database...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the script
removeCategories();