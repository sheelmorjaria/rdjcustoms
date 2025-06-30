#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import csv from 'csv-parser';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  CSV_FILE_PATH: path.join(__dirname, '../../../Etsy.csv'),
  DEFAULT_CATEGORY: 'Action Figure Accessories', // Default category for Etsy products
  BATCH_SIZE: 10, // Process products in batches
  DRY_RUN: process.argv.includes('--dry-run'),
  VERBOSE: process.argv.includes('--verbose')
};

// Utility functions
class EtsyImporter {
  constructor() {
    this.stats = {
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    this.defaultCategory = null;
    this.errors = [];
  }

  async init() {
    try {
      await this.connectDatabase();
      await this.ensureDefaultCategory();
      console.log(`🚀 Etsy Import Script ${CONFIG.DRY_RUN ? '(DRY RUN)' : '(LIVE MODE)'}`);
      console.log(`📁 CSV File: ${CONFIG.CSV_FILE_PATH}`);
      console.log(`📦 Default Category: ${CONFIG.DEFAULT_CATEGORY}`);
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  }

  async connectDatabase() {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/graphene-store';
    
    try {
      await mongoose.connect(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Database connected successfully');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async ensureDefaultCategory() {
    try {
      this.defaultCategory = await Category.findOne({ name: CONFIG.DEFAULT_CATEGORY });
      
      if (!this.defaultCategory) {
        const slug = await Category.generateSlug(CONFIG.DEFAULT_CATEGORY);
        this.defaultCategory = new Category({
          name: CONFIG.DEFAULT_CATEGORY,
          slug,
          description: 'Imported accessories and props for action figures'
        });
        
        if (!CONFIG.DRY_RUN) {
          await this.defaultCategory.save();
        }
        console.log(`✅ Created default category: ${CONFIG.DEFAULT_CATEGORY}`);
      } else {
        console.log(`✅ Found existing category: ${CONFIG.DEFAULT_CATEGORY}`);
      }
    } catch (error) {
      throw new Error(`Failed to ensure default category: ${error.message}`);
    }
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .trim()
      .substring(0, 200); // Limit length
  }

  async generateUniqueSku(title) {
    const baseSku = title
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
    
    let sku = `ETSY_${baseSku}`;
    let counter = 1;

    while (true) {
      const existing = await Product.findOne({ sku });
      if (!existing) {
        return sku;
      }
      sku = `ETSY_${baseSku}_${counter}`;
      counter++;
    }
  }

  parsePrice(priceStr) {
    const cleanPrice = priceStr.toString().replace(/[^0-9.]/g, '');
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? 0 : price;
  }

  parseImages(row) {
    const images = [];
    for (let i = 1; i <= 10; i++) {
      const imageKey = `IMAGE${i}`;
      if (row[imageKey] && row[imageKey].trim()) {
        images.push(row[imageKey].trim());
      }
    }
    return images;
  }

  parseTags(tagsStr) {
    if (!tagsStr) return [];
    
    return tagsStr
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .slice(0, 20); // Limit to 20 tags
  }

  mapCsvToProduct(row) {
    const title = row.TITLE || 'Untitled Product';
    const description = row.DESCRIPTION || '';
    const price = this.parsePrice(row.PRICE || 0);
    const quantity = parseInt(row.QUANTITY) || 0;
    const images = this.parseImages(row);
    const tags = this.parseTags(row.TAGS);

    // Determine stock status based on quantity
    let stockStatus = 'out_of_stock';
    if (quantity > 10) {
      stockStatus = 'in_stock';
    } else if (quantity > 0) {
      stockStatus = 'low_stock';
    }

    return {
      name: title.substring(0, 200),
      slug: this.generateSlug(title),
      sku: '', // Will be generated in mapToProduct
      shortDescription: description.substring(0, 300),
      longDescription: description.substring(0, 2000),
      price: price,
      tags: tags,
      images: images,
      category: this.defaultCategory._id,
      condition: 'new',
      stockStatus: stockStatus,
      stockQuantity: quantity,
      status: 'active',
      isActive: true,
      weight: 100, // Default weight in grams
      dimensions: {
        length: 10,
        width: 10,
        height: 5
      },
    };
  }

  async processProduct(productData) {
    try {
      // Generate unique SKU
      productData.sku = await this.generateUniqueSku(productData.name);

      // Check if product already exists by name or similar title
      const existingProduct = await Product.findOne({
        $or: [
          { name: productData.name },
          { slug: productData.slug }
        ]
      });

      if (existingProduct) {
        if (CONFIG.VERBOSE) {
          console.log(`⏭️  Skipping existing product: ${productData.name}`);
        }
        this.stats.skipped++;
        return null;
      }

      // Create new product
      const product = new Product(productData);

      // Validate before saving
      const validationError = product.validateSync();
      if (validationError) {
        throw new Error(`Validation failed: ${validationError.message}`);
      }

      if (!CONFIG.DRY_RUN) {
        await product.save();
        this.stats.created++;
        if (CONFIG.VERBOSE) {
          console.log(`✅ Created product: ${product.name} (SKU: ${product.sku})`);
        }
        return product;
      } else {
        this.stats.created++;
        if (CONFIG.VERBOSE) {
          console.log(`🔍 [DRY RUN] Would create: ${product.name} (SKU: ${product.sku})`);
        }
        return product;
      }
    } catch (error) {
      this.stats.errors++;
      const errorMsg = `Failed to process product "${productData.name}": ${error.message}`;
      this.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
      return null;
    }
  }

  async importProducts() {
    return new Promise((resolve, reject) => {
      const products = [];
      
      if (!fs.existsSync(CONFIG.CSV_FILE_PATH)) {
        return reject(new Error(`CSV file not found: ${CONFIG.CSV_FILE_PATH}`));
      }

      console.log('📖 Reading CSV file...');

      fs.createReadStream(CONFIG.CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row) => {
          this.stats.processed++;
          
          try {
            const productData = this.mapCsvToProduct(row);
            products.push(productData);
          } catch (error) {
            this.stats.errors++;
            console.error(`❌ Error parsing row ${this.stats.processed}:`, error.message);
          }
        })
        .on('end', async () => {
          console.log(`📊 Parsed ${products.length} products from CSV`);
          
          try {
            // Process products in batches
            for (let i = 0; i < products.length; i += CONFIG.BATCH_SIZE) {
              const batch = products.slice(i, i + CONFIG.BATCH_SIZE);
              const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
              const totalBatches = Math.ceil(products.length / CONFIG.BATCH_SIZE);
              
              console.log(`⚙️  Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)...`);
              
              const promises = batch.map(productData => this.processProduct(productData));
              await Promise.all(promises);
              
              // Brief pause between batches to avoid overwhelming the database
              if (i + CONFIG.BATCH_SIZE < products.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }
            
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        });
    });
  }

  printSummary() {
    console.log('\n📈 Import Summary:');
    console.log('='.repeat(50));
    console.log(`📋 Total Processed: ${this.stats.processed}`);
    console.log(`✅ Created: ${this.stats.created}`);
    console.log(`🔄 Updated: ${this.stats.updated}`);
    console.log(`⏭️  Skipped: ${this.stats.skipped}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    
    if (this.errors.length > 0) {
      console.log('\n⚠️  Error Details:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (CONFIG.DRY_RUN) {
      console.log('\n🔍 This was a DRY RUN - no data was actually imported.');
      console.log('Run without --dry-run flag to perform actual import.');
    }
    
    console.log('\n✨ Import completed!');
  }

  async cleanup() {
    try {
      await mongoose.connection.close();
      console.log('📡 Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error.message);
    }
  }

  async run() {
    try {
      await this.init();
      await this.importProducts();
      this.printSummary();
    } catch (error) {
      console.error('💥 Import failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// CLI interface
function printUsage() {
  console.log(`
🛍️  Etsy CSV Import Script

Usage: node importEtsy.js [options]

Options:
  --dry-run    Simulate import without saving to database
  --verbose    Show detailed output for each product
  --help       Show this help message

Examples:
  node importEtsy.js                    # Run import
  node importEtsy.js --dry-run          # Test import without saving
  node importEtsy.js --dry-run --verbose # Test with detailed output
`);
}

// Main execution
if (process.argv.includes('--help')) {
  printUsage();
  process.exit(0);
}

// Handle interruption gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️  Import interrupted by user');
  mongoose.connection.close();
  process.exit(0);
});

// Run the importer
const importer = new EtsyImporter();
importer.run();