const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API response
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
};

// Get all addresses for the authenticated user
export const getAddresses = async () => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/user/addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get addresses error:', error);
    throw error;
  }
};

// Get a specific address by ID
export const getAddressById = async (addressId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/user/addresses/${addressId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get address by ID error:', error);
    throw error;
  }
};

// Add a new address
export const addAddress = async (addressData) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/user/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Add address error:', error);
    throw error;
  }
};

// Update an existing address
export const updateAddress = async (addressId, addressData) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/user/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Update address error:', error);
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (addressId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/user/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Delete address error:', error);
    throw error;
  }
};

// Set default address (shipping or billing)
export const setDefaultAddress = async (addressId, type) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/user/addresses/${addressId}/default`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type })
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Set default address error:', error);
    throw error;
  }
};

// Clear default address (shipping or billing)
export const clearDefaultAddress = async (type) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/user/addresses/default`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type })
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Clear default address error:', error);
    throw error;
  }
};

// Legacy compatibility functions
export const getUserAddresses = getAddresses;
export const addUserAddress = addAddress;
export const updateUserAddress = updateAddress;
export const deleteUserAddress = deleteAddress;

// Get supported countries for shipping
export const getSupportedCountries = () => {
  return [
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
};

// Get states/provinces for a given country (basic implementation)
export const getStatesProvinces = (country) => {
  const stateData = {
    'United States': [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming'
    ],
    'Canada': [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
      'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
      'Quebec', 'Saskatchewan', 'Yukon'
    ],
    'Australia': [
      'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia',
      'Tasmania', 'Australian Capital Territory', 'Northern Territory'
    ],
    'United Kingdom': [
      'England', 'Scotland', 'Wales', 'Northern Ireland'
    ]
  };
  
  return stateData[country] || [];
};

// Validate postal code based on country
export const validatePostalCode = (postalCode, country) => {
  const patterns = {
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
  
  const pattern = patterns[country];
  return pattern ? pattern.test(postalCode) : true;
};