const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all reviews for the authenticated customer
export const getCustomerReviews = async () => {
  const response = await fetch(`${API_URL}/customer/reviews`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch reviews');
  }

  return response.json();
};

// Update a review
export const updateCustomerReview = async (reviewId, reviewData) => {
  const response = await fetch(`${API_URL}/customer/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update review');
  }

  return response.json();
};

// Delete a review
export const deleteCustomerReview = async (reviewId) => {
  const response = await fetch(`${API_URL}/customer/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete review');
  }

  return response.json();
};