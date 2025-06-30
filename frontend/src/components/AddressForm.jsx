import React, { useState, useEffect } from 'react';

const SUPPORTED_COUNTRIES = [
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Belgium',
  'Sweden',
  'Norway',
  'Denmark',
  'Ireland',
  'New Zealand',
  'Switzerland'
];

const POSTAL_CODE_PATTERNS = {
  'United Kingdom': /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i,
  'United States': /^\d{5}(-\d{4})?$/,
  'Canada': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  'Germany': /^\d{5}$/,
  'France': /^\d{5}$/,
  'Netherlands': /^\d{4}\s?[A-Z]{2}$/i,
  'Australia': /^\d{4}$/,
  'Switzerland': /^\d{4}$/,
  'Sweden': /^\d{3}\s?\d{2}$/,
  'Norway': /^\d{4}$/,
  'Denmark': /^\d{4}$/
};

const AddressForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = {}, 
  isEdit = false, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
    setAsDefaultShipping: false,
    setAsDefaultBilling: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        company: initialData.company || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        city: initialData.city || '',
        stateProvince: initialData.stateProvince || '',
        postalCode: initialData.postalCode || '',
        country: initialData.country || '',
        phoneNumber: initialData.phoneNumber || '',
        setAsDefaultShipping: initialData.setAsDefaultShipping || false,
        setAsDefaultBilling: initialData.setAsDefaultBilling || false
      });
    }
  }, [initialData]);

  const validateField = (name, value, allValues = formData) => {
    const requiredFields = ['fullName', 'addressLine1', 'city', 'stateProvince', 'postalCode', 'country'];
    
    if (requiredFields.includes(name) && !value.trim()) {
      return getRequiredFieldError(name);
    }

    if (name === 'phoneNumber' && value.trim()) {
      const phoneRegex = /^[+]?[1-9][\d\s\-()]{0,20}$/;
      if (!phoneRegex.test(value.trim())) {
        return 'Please enter a valid phone number';
      }
    }

    if (name === 'postalCode' && value.trim() && allValues.country) {
      const pattern = POSTAL_CODE_PATTERNS[allValues.country];
      if (pattern && !pattern.test(value.trim())) {
        return `Invalid postal code format for ${allValues.country}`;
      }
    }

    if (name === 'country' && value && !SUPPORTED_COUNTRIES.includes(value)) {
      return 'Please select a supported country';
    }

    return '';
  };

  const getRequiredFieldError = (fieldName) => {
    const errorMessages = {
      fullName: 'Full name is required',
      addressLine1: 'Address line 1 is required',
      city: 'City is required',
      stateProvince: 'State/Province is required',
      postalCode: 'Postal code is required',
      country: 'Country is required'
    };
    return errorMessages[fieldName] || `${fieldName} is required`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Revalidate postal code when country changes
    if (name === 'country' && formData.postalCode) {
      const postalCodeError = validateField('postalCode', formData.postalCode, { ...formData, country: value });
      setErrors(prev => ({
        ...prev,
        postalCode: postalCodeError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      // Skip validation for checkbox fields
      if (key === 'setAsDefaultShipping' || key === 'setAsDefaultBilling') {
        return;
      }
      const error = validateField(key, formData[key], formData);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getFieldId = (fieldName) => `address-${fieldName}`;
  const getErrorId = (fieldName) => `${fieldName}-error`;

  return (
    <form role="form" onSubmit={handleSubmit} className="address-form">
      <div className="form-group">
        <label htmlFor={getFieldId('fullName')}>Full Name *</label>
        <input
          id={getFieldId('fullName')}
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isLoading}
          required
          aria-describedby={errors.fullName ? getErrorId('fullName') : undefined}
          className={errors.fullName ? 'error' : ''}
        />
        {errors.fullName && (
          <div id={getErrorId('fullName')} className="error-message" role="alert">
            {errors.fullName}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('company')}>Company</label>
        <input
          id={getFieldId('company')}
          name="company"
          type="text"
          value={formData.company}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isLoading}
          aria-describedby={errors.company ? getErrorId('company') : undefined}
          className={errors.company ? 'error' : ''}
        />
        {errors.company && (
          <div id={getErrorId('company')} className="error-message" role="alert">
            {errors.company}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('addressLine1')}>Address Line 1 *</label>
        <input
          id={getFieldId('addressLine1')}
          name="addressLine1"
          type="text"
          value={formData.addressLine1}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isLoading}
          required
          aria-describedby={errors.addressLine1 ? getErrorId('addressLine1') : undefined}
          className={errors.addressLine1 ? 'error' : ''}
        />
        {errors.addressLine1 && (
          <div id={getErrorId('addressLine1')} className="error-message" role="alert">
            {errors.addressLine1}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('addressLine2')}>Address Line 2</label>
        <input
          id={getFieldId('addressLine2')}
          name="addressLine2"
          type="text"
          value={formData.addressLine2}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isLoading}
          aria-describedby={errors.addressLine2 ? getErrorId('addressLine2') : undefined}
          className={errors.addressLine2 ? 'error' : ''}
        />
        {errors.addressLine2 && (
          <div id={getErrorId('addressLine2')} className="error-message" role="alert">
            {errors.addressLine2}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('city')}>City *</label>
        <input
          id={getFieldId('city')}
          name="city"
          type="text"
          value={formData.city}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isLoading}
          required
          aria-describedby={errors.city ? getErrorId('city') : undefined}
          className={errors.city ? 'error' : ''}
        />
        {errors.city && (
          <div id={getErrorId('city')} className="error-message" role="alert">
            {errors.city}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('stateProvince')}>State/Province *</label>
        <input
          id={getFieldId('stateProvince')}
          name="stateProvince"
          type="text"
          value={formData.stateProvince}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isLoading}
          required
          aria-describedby={errors.stateProvince ? getErrorId('stateProvince') : undefined}
          className={errors.stateProvince ? 'error' : ''}
        />
        {errors.stateProvince && (
          <div id={getErrorId('stateProvince')} className="error-message" role="alert">
            {errors.stateProvince}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('postalCode')}>Postal Code *</label>
        <input
          id={getFieldId('postalCode')}
          name="postalCode"
          type="text"
          value={formData.postalCode}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isLoading}
          required
          aria-describedby={errors.postalCode ? getErrorId('postalCode') : undefined}
          className={errors.postalCode ? 'error' : ''}
        />
        {errors.postalCode && (
          <div id={getErrorId('postalCode')} className="error-message" role="alert">
            {errors.postalCode}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('country')}>Country *</label>
        <select
          id={getFieldId('country')}
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isLoading}
          required
          aria-describedby={errors.country ? getErrorId('country') : undefined}
          className={errors.country ? 'error' : ''}
        >
          <option value="">Select a country</option>
          {SUPPORTED_COUNTRIES.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {errors.country && (
          <div id={getErrorId('country')} className="error-message" role="alert">
            {errors.country}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('phoneNumber')}>Phone Number</label>
        <input
          id={getFieldId('phoneNumber')}
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={isLoading}
          aria-describedby={errors.phoneNumber ? getErrorId('phoneNumber') : undefined}
          className={errors.phoneNumber ? 'error' : ''}
        />
        {errors.phoneNumber && (
          <div id={getErrorId('phoneNumber')} className="error-message" role="alert">
            {errors.phoneNumber}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('setAsDefaultShipping')}>
          <input
            id={getFieldId('setAsDefaultShipping')}
            name="setAsDefaultShipping"
            type="checkbox"
            checked={formData.setAsDefaultShipping}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          Set as Default Shipping Address
        </label>
      </div>

      <div className="form-group">
        <label htmlFor={getFieldId('setAsDefaultBilling')}>
          <input
            id={getFieldId('setAsDefaultBilling')}
            name="setAsDefaultBilling"
            type="checkbox"
            checked={formData.setAsDefaultBilling}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          Set as Default Billing Address
        </label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Address' : 'Save Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddressForm;