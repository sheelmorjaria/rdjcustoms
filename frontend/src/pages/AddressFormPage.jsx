import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSave, FiX, FiMapPin } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  getAddressById, 
  addAddress, 
  updateAddress, 
  getSupportedCountries, 
  getStatesProvinces, 
  validatePostalCode 
} from '../services/addressService';

const AddressFormPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams();
  const isEditMode = !!addressId;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'United Kingdom',
    phoneNumber: '',
    setAsDefaultShipping: false,
    setAsDefaultBilling: false
  });

  const [errors, setErrors] = useState({});
  const [availableStates, setAvailableStates] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      fetchAddress();
    } else {
      setLoading(false);
    }
  }, [addressId, isEditMode, fetchAddress]);

  useEffect(() => {
    // Update available states when country changes
    const states = getStatesProvinces(formData.country);
    setAvailableStates(states);
    
    // Clear state/province if it's not valid for the new country
    if (states.length > 0 && !states.includes(formData.stateProvince)) {
      setFormData(prev => ({ ...prev, stateProvince: '' }));
    }
  }, [formData.country, formData.stateProvince]);

  const fetchAddress = useCallback(async () => {
    try {
      const response = await getAddressById(addressId);
      setFormData({
        fullName: response.data.fullName || '',
        company: response.data.company || '',
        addressLine1: response.data.addressLine1 || '',
        addressLine2: response.data.addressLine2 || '',
        city: response.data.city || '',
        stateProvince: response.data.stateProvince || '',
        postalCode: response.data.postalCode || '',
        country: response.data.country || 'United Kingdom',
        phoneNumber: response.data.phoneNumber || '',
        setAsDefaultShipping: false,
        setAsDefaultBilling: false
      });
    } catch (error) {
      console.error('Error fetching address:', error);
      toast.error('Failed to load address');
      navigate('/addresses');
    } finally {
      setLoading(false);
    }
  }, [addressId, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    } else if (formData.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Address line 1 must be at least 5 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z\s\-'.]+$/.test(formData.city.trim())) {
      newErrors.city = 'City contains invalid characters';
    }

    if (!formData.stateProvince.trim()) {
      newErrors.stateProvince = 'State/Province is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!validatePostalCode(formData.postalCode.trim(), formData.country)) {
      newErrors.postalCode = `Invalid postal code format for ${formData.country}`;
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    // Optional field validation
    if (formData.phoneNumber && !/^[+]?[1-9][\d\s\-()]{0,20}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const addressData = {
        fullName: formData.fullName.trim(),
        company: formData.company.trim() || undefined,
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || undefined,
        city: formData.city.trim(),
        stateProvince: formData.stateProvince.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        setAsDefaultShipping: formData.setAsDefaultShipping,
        setAsDefaultBilling: formData.setAsDefaultBilling
      };

      if (isEditMode) {
        await updateAddress(addressId, addressData);
        toast.success('Address updated successfully');
      } else {
        await addAddress(addressData);
        toast.success('Address added successfully');
      }

      navigate('/addresses');
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const supportedCountries = getSupportedCountries();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <FiMapPin className="text-blue-600 h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? 'Edit Address' : 'Add New Address'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Update your address details' : 'Add a new shipping or billing address'}
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-700 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                    My Account
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link to="/addresses" className="text-gray-700 hover:text-blue-600">
                    Address Book
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">
                    {isEditMode ? 'Edit Address' : 'Add Address'}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company (optional)
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Company Name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+44 20 7946 0958"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors.addressLine1 && (
                      <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (optional)
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="London"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="SW1A 1AA"
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {supportedCountries.map(country => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province *
                      </label>
                      {availableStates.length > 0 ? (
                        <select
                          id="stateProvince"
                          name="stateProvince"
                          value={formData.stateProvince}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.stateProvince ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select State/Province</option>
                          {availableStates.map(state => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          id="stateProvince"
                          name="stateProvince"
                          value={formData.stateProvince}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.stateProvince ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter State/Province"
                        />
                      )}
                      {errors.stateProvince && (
                        <p className="text-red-500 text-xs mt-1">{errors.stateProvince}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Address Options */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Address Options</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="setAsDefaultShipping"
                      checked={formData.setAsDefaultShipping}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Set as default shipping address
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="setAsDefaultBilling"
                      checked={formData.setAsDefaultBilling}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Set as default billing address
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/addresses')}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  <FiX />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-white transition duration-200 ${
                    saving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <FiSave />
                  {saving ? 'Saving...' : isEditMode ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressFormPage;