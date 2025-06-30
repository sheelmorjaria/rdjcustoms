const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const productsService = {
  async getProducts(params = {}) {
    // Filter out undefined, null, and empty string values
    const filteredParams = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    // Transform sort parameter to sortBy and sortOrder
    if (filteredParams.sort) {
      const sortMap = {
        'newest': { sortBy: 'createdAt', sortOrder: 'desc' },
        'price-low': { sortBy: 'price', sortOrder: 'asc' },
        'price-high': { sortBy: 'price', sortOrder: 'desc' },
        'name-asc': { sortBy: 'name', sortOrder: 'asc' }
      };

      const sortConfig = sortMap[filteredParams.sort];
      if (sortConfig) {
        filteredParams.sortBy = sortConfig.sortBy;
        filteredParams.sortOrder = sortConfig.sortOrder;
      }
      
      // Remove the original sort parameter
      delete filteredParams.sort;
    }

    // Build query string
    const queryString = new URLSearchParams(filteredParams).toString();
    const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for CORS
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Products API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          errorText: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch products:', {
        error: error.message,
        url: url,
        apiBaseUrl: API_BASE_URL
      });
      throw error;
    }
  }
};

export default productsService;