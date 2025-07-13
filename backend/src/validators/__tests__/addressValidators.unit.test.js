import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createAddressValidator, 
  updateAddressValidator, 
  deleteAddressValidator, 
  setDefaultAddressValidator,
  getAddressValidator,
  validatePostalCodeByCountry,
  conditionalValidation
} from '../addressValidators.js';

describe('Address Validators Unit Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Mock Express request, response, and next
    mockReq = {
      body: {},
      params: {},
      query: {}
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    mockNext = vi.fn();
  });

  describe('Create Address Validator', () => {
    it('should be an array of validation middleware', () => {
      expect(Array.isArray(createAddressValidator)).toBe(true);
      expect(createAddressValidator.length).toBeGreaterThan(0);
    });

    it('should validate required fields', () => {
      const requiredFields = ['fullName', 'addressLine1', 'city', 'stateProvince', 'postalCode', 'country'];
      
      // Check that required field validators exist
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      requiredFields.forEach(field => {
        const hasRequiredValidator = validatorStrings.some(v => 
          v.includes(field) && v.includes('notEmpty')
        );
        expect(hasRequiredValidator).toBe(true);
      });
    });

    it('should have proper length constraints', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      // Full name: 2-100 characters
      const fullNameValidator = validatorStrings.find(v => 
        v.includes('fullName') && v.includes('isLength')
      );
      expect(fullNameValidator).toBeTruthy();
      
      // Address line 1: 5-100 characters  
      const addressLine1Validator = validatorStrings.find(v =>
        v.includes('addressLine1') && v.includes('isLength')
      );
      expect(addressLine1Validator).toBeTruthy();
    });

    it('should validate city format with regex', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      const cityValidator = validatorStrings.find(v =>
        v.includes('city') && v.includes('matches')
      );
      expect(cityValidator).toBeTruthy();
    });

    it('should validate postal code format', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      const postalCodeValidator = validatorStrings.find(v =>
        v.includes('postalCode') && v.includes('matches')
      );
      expect(postalCodeValidator).toBeTruthy();
    });

    it('should validate country against allowed list', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      const countryValidator = validatorStrings.find(v =>
        v.includes('country') && v.includes('isIn')
      );
      expect(countryValidator).toBeTruthy();
    });

    it('should make optional fields truly optional', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      const optionalFields = ['company', 'addressLine2', 'phoneNumber', 'setAsDefaultShipping', 'setAsDefaultBilling'];
      
      optionalFields.forEach(field => {
        const hasOptionalValidator = validatorStrings.some(v =>
          v.includes(field) && v.includes('optional')
        );
        expect(hasOptionalValidator).toBe(true);
      });
    });

    it('should validate phone number format when provided', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      const phoneValidator = validatorStrings.find(v =>
        v.includes('phoneNumber') && v.includes('matches')
      );
      expect(phoneValidator).toBeTruthy();
    });

    it('should validate boolean fields', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      const booleanFields = ['setAsDefaultShipping', 'setAsDefaultBilling'];
      
      booleanFields.forEach(field => {
        const hasBooleanValidator = validatorStrings.some(v =>
          v.includes(field) && v.includes('isBoolean')
        );
        expect(hasBooleanValidator).toBe(true);
      });
    });
  });

  describe('Update Address Validator', () => {
    it('should be an array of validation middleware', () => {
      expect(Array.isArray(updateAddressValidator)).toBe(true);
      expect(updateAddressValidator.length).toBeGreaterThan(0);
    });

    it('should validate address ID parameter', () => {
      const validatorStrings = updateAddressValidator.map(v => v.toString());
      
      const addressIdValidator = validatorStrings.find(v =>
        v.includes('addressId') && v.includes('isMongoId')
      );
      expect(addressIdValidator).toBeTruthy();
    });

    it('should make all body fields optional for updates', () => {
      const validatorStrings = updateAddressValidator.map(v => v.toString());
      
      const updateFields = ['fullName', 'company', 'addressLine1', 'addressLine2', 'city', 'stateProvince', 'postalCode', 'country', 'phoneNumber'];
      
      updateFields.forEach(field => {
        const hasOptionalValidator = validatorStrings.some(v =>
          v.includes(field) && v.includes('optional')
        );
        expect(hasOptionalValidator).toBe(true);
      });
    });

    it('should maintain same validation rules for optional fields', () => {
      const validatorStrings = updateAddressValidator.map(v => v.toString());
      
      // City should still have character restrictions
      const cityValidator = validatorStrings.find(v =>
        v.includes('city') && v.includes('matches')
      );
      expect(cityValidator).toBeTruthy();
      
      // Country should still validate against allowed list
      const countryValidator = validatorStrings.find(v =>
        v.includes('country') && v.includes('isIn')
      );
      expect(countryValidator).toBeTruthy();
    });
  });

  describe('Delete Address Validator', () => {
    it('should be an array with address ID validation', () => {
      expect(Array.isArray(deleteAddressValidator)).toBe(true);
      expect(deleteAddressValidator.length).toBeGreaterThan(0);
    });

    it('should validate MongoDB ObjectId for address ID', () => {
      const validatorStrings = deleteAddressValidator.map(v => v.toString());
      
      const addressIdValidator = validatorStrings.find(v =>
        v.includes('addressId') && v.includes('isMongoId')
      );
      expect(addressIdValidator).toBeTruthy();
    });
  });

  describe('Set Default Address Validator', () => {
    it('should validate address ID and type', () => {
      expect(Array.isArray(setDefaultAddressValidator)).toBe(true);
      
      const validatorStrings = setDefaultAddressValidator.map(v => v.toString());
      
      // Should validate address ID
      const addressIdValidator = validatorStrings.find(v =>
        v.includes('addressId') && v.includes('isMongoId')
      );
      expect(addressIdValidator).toBeTruthy();
      
      // Should validate type field
      const typeValidator = validatorStrings.find(v =>
        v.includes('type') && v.includes('isIn')
      );
      expect(typeValidator).toBeTruthy();
    });

    it('should only allow shipping or billing types', () => {
      const validatorStrings = setDefaultAddressValidator.map(v => v.toString());
      
      const typeValidator = validatorStrings.find(v =>
        v.includes('type') && v.includes('isIn')
      );
      expect(typeValidator).toContain('shipping');
      expect(typeValidator).toContain('billing');
    });
  });

  describe('Get Address Validator', () => {
    it('should optionally validate address ID', () => {
      expect(Array.isArray(getAddressValidator)).toBe(true);
      
      const validatorStrings = getAddressValidator.map(v => v.toString());
      
      const addressIdValidator = validatorStrings.find(v =>
        v.includes('addressId') && v.includes('optional') && v.includes('isMongoId')
      );
      expect(addressIdValidator).toBeTruthy();
    });
  });

  describe('Postal Code Validation by Country', () => {
    it('should validate UK postal codes correctly', () => {
      const validUKCodes = ['M1 1AA', 'M60 1NW', 'CR0 2YR', 'DN55 1PT', 'W1A 0AX', 'EC1A 1BB'];
      const invalidUKCodes = ['12345', 'INVALID', 'M1', ''];
      
      validUKCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'United Kingdom')).toBe(true);
      });
      
      invalidUKCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'United Kingdom')).toBe(false);
      });
    });

    it('should validate US postal codes correctly', () => {
      const validUSCodes = ['12345', '12345-6789', '90210'];
      const invalidUSCodes = ['1234', '123456', 'ABCDE', '12345-678'];
      
      validUSCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'United States')).toBe(true);
      });
      
      invalidUSCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'United States')).toBe(false);
      });
    });

    it('should validate Canadian postal codes correctly', () => {
      const validCanadaCodes = ['K1A 0A6', 'M5V 3L9', 'H2Y 1C6', 'K1A0A6'];
      const invalidCanadaCodes = ['12345', 'INVALID', 'K1A', 'K1A 0A'];
      
      validCanadaCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Canada')).toBe(true);
      });
      
      invalidCanadaCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Canada')).toBe(false);
      });
    });

    it('should validate German postal codes correctly', () => {
      const validGermanCodes = ['12345', '01067', '80331'];
      const invalidGermanCodes = ['1234', '123456', 'ABCDE'];
      
      validGermanCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Germany')).toBe(true);
      });
      
      invalidGermanCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Germany')).toBe(false);
      });
    });

    it('should validate French postal codes correctly', () => {
      const validFrenchCodes = ['75001', '69002', '13008'];
      const invalidFrenchCodes = ['1234', '123456', 'ABCDE'];
      
      validFrenchCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'France')).toBe(true);
      });
      
      invalidFrenchCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'France')).toBe(false);
      });
    });

    it('should validate Dutch postal codes correctly', () => {
      const validDutchCodes = ['1012 JS', '2514 AB', '1012JS', '2514AB'];
      const invalidDutchCodes = ['12345', 'INVALID', '1012', 'AB12'];
      
      validDutchCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Netherlands')).toBe(true);
      });
      
      invalidDutchCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Netherlands')).toBe(false);
      });
    });

    it('should validate Australian postal codes correctly', () => {
      const validAusCodes = ['2000', '3000', '4000'];
      const invalidAusCodes = ['200', '20000', 'ABCD'];
      
      validAusCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Australia')).toBe(true);
      });
      
      invalidAusCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Australia')).toBe(false);
      });
    });

    it('should validate Swiss postal codes correctly', () => {
      const validSwissCodes = ['8001', '1200', '4000'];
      const invalidSwissCodes = ['800', '80000', 'ABCD'];
      
      validSwissCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Switzerland')).toBe(true);
      });
      
      invalidSwissCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Switzerland')).toBe(false);
      });
    });

    it('should validate Swedish postal codes correctly', () => {
      const validSwedishCodes = ['123 45', '12345', '111 22'];
      const invalidSwedishCodes = ['1234', '123456', 'ABCDE'];
      
      validSwedishCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Sweden')).toBe(true);
      });
      
      invalidSwedishCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Sweden')).toBe(false);
      });
    });

    it('should validate Norwegian postal codes correctly', () => {
      const validNorwegianCodes = ['0001', '1234', '9999'];
      const invalidNorwegianCodes = ['001', '12345', 'ABCD'];
      
      validNorwegianCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Norway')).toBe(true);
      });
      
      invalidNorwegianCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Norway')).toBe(false);
      });
    });

    it('should validate Danish postal codes correctly', () => {
      const validDanishCodes = ['1234', '5678', '9999'];
      const invalidDanishCodes = ['123', '12345', 'ABCD'];
      
      validDanishCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Denmark')).toBe(true);
      });
      
      invalidDanishCodes.forEach(code => {
        expect(validatePostalCodeByCountry(code, 'Denmark')).toBe(false);
      });
    });

    it('should return true for unsupported countries', () => {
      const unsupportedCountries = ['Japan', 'Brazil', 'India', 'China'];
      
      unsupportedCountries.forEach(country => {
        expect(validatePostalCodeByCountry('12345', country)).toBe(true);
        expect(validatePostalCodeByCountry('INVALID', country)).toBe(true);
      });
    });

    it('should handle edge cases', () => {
      // Empty postal code
      expect(validatePostalCodeByCountry('', 'United Kingdom')).toBe(false);
      
      // Null/undefined postal code
      expect(validatePostalCodeByCountry(null, 'United States')).toBe(false);
      expect(validatePostalCodeByCountry(undefined, 'Canada')).toBe(false);
      
      // Case insensitive matching
      expect(validatePostalCodeByCountry('m1 1aa', 'United Kingdom')).toBe(true);
      expect(validatePostalCodeByCountry('k1a 0a6', 'Canada')).toBe(true);
    });
  });

  describe('Conditional Validation', () => {
    it('should return a validator function', () => {
      const condition = (body) => body.requiresField === true;
      const validator = conditionalValidation('testField', condition);
      
      expect(typeof validator).toBe('object');
      expect(validator.toString()).toContain('testField');
    });

    it('should validate conditionally required fields', () => {
      const condition = (body) => body.type === 'business';
      const validator = conditionalValidation('companyName', condition);
      
      // Test the custom validation logic conceptually
      expect(typeof validator).toBe('object');
      expect(validator.toString()).toContain('companyName');
      expect(validator.toString()).toContain('custom');
    });
  });

  describe('Field Validation Rules', () => {
    it('should have consistent validation patterns across create and update', () => {
      const createStrings = createAddressValidator.map(v => v.toString());
      const updateStrings = updateAddressValidator.map(v => v.toString());
      
      // Both should validate city with same regex pattern
      const createCityRegex = createStrings.find(v => v.includes('city') && v.includes('matches'));
      const updateCityRegex = updateStrings.find(v => v.includes('city') && v.includes('matches'));
      
      expect(createCityRegex).toBeTruthy();
      expect(updateCityRegex).toBeTruthy();
    });

    it('should properly validate supported countries', () => {
      const supportedCountries = [
        'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 
        'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Sweden', 
        'Norway', 'Denmark', 'Ireland', 'New Zealand', 'Switzerland'
      ];
      
      const validatorStrings = createAddressValidator.map(v => v.toString());
      const countryValidator = validatorStrings.find(v => v.includes('country') && v.includes('isIn'));
      
      supportedCountries.forEach(country => {
        expect(countryValidator).toContain(country);
      });
    });

    it('should validate phone number format consistently', () => {
      const createStrings = createAddressValidator.map(v => v.toString());
      const updateStrings = updateAddressValidator.map(v => v.toString());
      
      const createPhoneRegex = createStrings.find(v => v.includes('phoneNumber') && v.includes('matches'));
      const updatePhoneRegex = updateStrings.find(v => v.includes('phoneNumber') && v.includes('matches'));
      
      expect(createPhoneRegex).toBeTruthy();
      expect(updatePhoneRegex).toBeTruthy();
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error messages for required fields', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      const requiredFieldMessages = [
        'Full name is required',
        'Address line 1 is required', 
        'City is required',
        'State/Province is required',
        'Postal code is required',
        'Country is required'
      ];
      
      requiredFieldMessages.forEach(message => {
        const hasMessage = validatorStrings.some(v => v.includes(message));
        expect(hasMessage).toBe(true);
      });
    });

    it('should provide clear error messages for length constraints', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      const lengthConstraintMessages = [
        'must be between 2 and 100 characters',
        'must be between 5 and 100 characters',
        'must be between 2 and 50 characters',
        'cannot exceed 100 characters',
        'cannot exceed 20 characters'
      ];
      
      lengthConstraintMessages.forEach(message => {
        const hasMessage = validatorStrings.some(v => v.includes(message));
        expect(hasMessage).toBe(true);
      });
    });

    it('should provide clear error messages for format validation', () => {
      const validatorStrings = createAddressValidator.map(v => v.toString());
      
      const formatMessages = [
        'City contains invalid characters',
        'Invalid postal code format',
        'Invalid phone number format',
        'Country not supported for shipping',
        'Invalid address ID'
      ];
      
      const allValidatorStrings = [
        ...createAddressValidator,
        ...updateAddressValidator,
        ...deleteAddressValidator,
        ...setDefaultAddressValidator
      ].map(v => v.toString());
      
      formatMessages.forEach(message => {
        const hasMessage = allValidatorStrings.some(v => v.includes(message));
        expect(hasMessage).toBe(true);
      });
    });
  });
});