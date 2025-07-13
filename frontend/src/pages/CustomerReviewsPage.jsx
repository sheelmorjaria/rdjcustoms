import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomerReviews, deleteCustomerReview } from '../services/reviewService';
import LoadingSpinner from '../components/LoadingSpinner';

const CustomerReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getCustomerReviews();
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      setDeletingReviewId(reviewToDelete._id);
      await deleteCustomerReview(reviewToDelete._id);
      setReviews(reviews.filter(r => r._id !== reviewToDelete._id));
      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 text-sm rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Reviews</h1>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Product Info */}
                <div className="flex-shrink-0">
                  {review.product?.image ? (
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {review.product?.name || 'Product Unavailable'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">{review.formattedDate}</span>
                      </div>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>

                  <h4 className="font-medium text-gray-900 mt-3">{review.title}</h4>
                  <p className="text-gray-700 mt-2 line-clamp-3">{review.content}</p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {review.product && (
                      <Link
                        to={`/products/${review.product.slug}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Product
                      </Link>
                    )}
                    <button
                      onClick={() => navigate(`/account/reviews/${review._id}/edit`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(review)}
                      disabled={deletingReviewId === review._id}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      {deletingReviewId === review._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Review</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your review for "{reviewToDelete?.product?.name || 'this product'}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReviewsPage;