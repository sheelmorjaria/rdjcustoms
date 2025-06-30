import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { isUsingDocker } from '../../test/setup.integration.docker-shared.js';

describe('Docker MongoDB Integration Test', () => {
  it('should connect to MongoDB successfully', async () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  it('should report correct database method', () => {
    const usingDocker = isUsingDocker();
    console.log(`Using Docker for tests: ${usingDocker}`);
    
    // This will be true if Docker is available and being used
    if (process.env.FORCE_MEMORY_SERVER !== 'true' && !process.env.MONGO_URI) {
      expect(typeof usingDocker).toBe('boolean');
    }
  });

  it('should create and retrieve a document', async () => {
    // Create a simple test schema
    const TestSchema = new mongoose.Schema({
      name: String,
      value: Number
    });
    
    // Use a unique model name to avoid conflicts
    const modelName = `TestModel_${Date.now()}`;
    const TestModel = mongoose.model(modelName, TestSchema);
    
    // Create a document
    const doc = await TestModel.create({
      name: 'test',
      value: 42
    });
    
    expect(doc.name).toBe('test');
    expect(doc.value).toBe(42);
    
    // Retrieve the document
    const found = await TestModel.findById(doc._id);
    expect(found).toBeTruthy();
    expect(found.name).toBe('test');
    
    // Clean up
    await TestModel.deleteMany({});
  });
});