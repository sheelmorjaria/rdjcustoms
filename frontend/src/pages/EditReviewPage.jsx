import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerReviews, updateCustomerReview } from '../services/reviewService';
import LoadingSpinner from '../components/LoadingSpinner';

const EditReviewPage = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReview();
  }, [reviewId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReview = async () => {
    try {
      setLoading(true);
      const data = await getCustomerReviews();
      const foundReview = data.reviews?.find(r => r._id === reviewId);
      
      if (!foundReview) {
        setError('Review not found');
        return;
      }

      setReview(foundReview);
      setFormData({
        rating: foundReview.rating,
        title: foundReview.title,
        content: foundReview.content
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Review content is required');
      return;
    }

    try {
      setSubmitting(true);
      await updateCustomerReview(reviewId, formData);
      navigate('/account/reviews');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setFormData({ ...formData, rating: newRating });
  };

  const renderStarInput = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="focus:outline-none"
          >
            <svg
              className={`w-8 h-8 cursor-pointer transition-colors ${
                star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  if (error && !review) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/account/reviews')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to My Reviews
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Review</h1>

      {review && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-4">
            {review.product?.image && (
              <img
                src={review.product.image}
                alt={review.product.name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-semibold">{review.product?.name || 'Product'}</h3>
              {review.product?.price && (
                <p className="text-gray-600">£{review.product.price.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          {renderStarInput()}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Summarize your experience"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            maxLength={1000}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your experience with this product"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.content.length}/1000 characters
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {review?.status === 'approved' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            <p className="text-sm">
              Note: Your review is currently approved. After editing, it will need to be reviewed again before appearing publicly.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/account/reviews')}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReviewPage;