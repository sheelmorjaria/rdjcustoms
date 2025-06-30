import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCalendar, FiPercent, FiDollarSign, FiTruck, FiRefreshCw } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  createPromotion, 
  updatePromotion, 
  getPromotionById, 
  checkPromotionCode,
  getProducts,
  getCategories 
} from '../services/adminService';

const AdminPromotionFormPage = () => {
  const navigate = useNavigate();
  const { promoId } = useParams();
  const isEditMode = !!promoId;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minimumOrderSubtotal: '',
    applicableProducts: [],
    applicableCategories: [],
    totalUsageLimit: '',
    perUserUsageLimit: '1',
    startDate: '',
    endDate: '',
    status: 'draft'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProductsAndCategories();
    if (isEditMode) {
      fetchPromotion();
    }
  }, [promoId]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (formData.code && formData.code.length >= 3) {
        checkCodeAvailability();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [formData.code]);

  const fetchProductsAndCategories = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts({ limit: 100, isActive: true }),
        getCategories({ limit: 100 })
      ]);
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching products/categories:', error);
    }
  };

  const fetchPromotion = async () => {
    try {
      const promotion = await getPromotionById(promoId);
      setFormData({
        ...promotion,
        startDate: new Date(promotion.startDate).toISOString().split('T')[0],
        endDate: new Date(promotion.endDate).toISOString().split('T')[0],
        minimumOrderSubtotal: promotion.minimumOrderSubtotal || '',
        totalUsageLimit: promotion.totalUsageLimit || '',
        perUserUsageLimit: promotion.perUserUsageLimit || '1',
        applicableProducts: promotion.applicableProducts?.map(p => p._id) || [],
        applicableCategories: promotion.applicableCategories?.map(c => c._id) || []
      });
    } catch (error) {
      console.error('Error fetching promotion:', error);
      toast.error('Failed to load promotion');
      navigate('/admin/promotions');
    } finally {
      setLoading(false);
    }
  };

  const checkCodeAvailability = async () => {
    try {
      setCheckingCode(true);
      const response = await checkPromotionCode(formData.code, promoId);
      setCodeAvailable(response.isAvailable);
    } catch (error) {
      console.error('Error checking code:', error);
    } finally {
      setCheckingCode(false);
    }
  };

  const generateCode = () => {
    const randomCode = `PROMO${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setFormData({ ...formData, code: randomCode });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelectChange = (e, field) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      [field]: selectedOptions
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Promotion name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Promotion code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    } else if (!codeAvailable) {
      newErrors.code = 'This code is already taken';
    }

    if (formData.type !== 'free_shipping' && !formData.value) {
      newErrors.value = 'Value is required for this promotion type';
    } else if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
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

      const promotionData = {
        ...formData,
        value: formData.type === 'free_shipping' ? undefined : parseFloat(formData.value),
        minimumOrderSubtotal: formData.minimumOrderSubtotal ? parseFloat(formData.minimumOrderSubtotal) : 0,
        totalUsageLimit: formData.totalUsageLimit ? parseInt(formData.totalUsageLimit) : undefined,
        perUserUsageLimit: parseInt(formData.perUserUsageLimit) || 1,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      if (isEditMode) {
        await updatePromotion(promoId, promotionData);
        toast.success('Promotion updated successfully');
      } else {
        await createPromotion(promotionData);
        toast.success('Promotion created successfully');
      }

      navigate('/admin/promotions');
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error(error.response?.data?.error || 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {isEditMode ? 'Edit Promotion' : 'Create New Promotion'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promotion Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Summer Sale"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promotion Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange({
                      target: {
                        name: 'code',
                        value: e.target.value.toUpperCase()
                      }
                    })}
                    className={`w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., SUMMER20"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                    title="Generate code"
                  >
                    <FiRefreshCw />
                  </button>
                </div>
                {checkingCode && (
                  <p className="text-gray-500 text-xs mt-1">Checking availability...</p>
                )}
                {!checkingCode && formData.code && (
                  <p className={`text-xs mt-1 ${codeAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {codeAvailable ? 'Code is available' : 'Code is already taken'}
                  </p>
                )}
                {errors.code && (
                  <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional description for internal use"
              />
            </div>
          </div>

          {/* Discount Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Discount Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'percentage' })}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-colors ${
                      formData.type === 'percentage'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FiPercent className="mb-1" />
                    <span className="text-xs">Percentage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'fixed_amount' })}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-colors ${
                      formData.type === 'fixed_amount'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FiDollarSign className="mb-1" />
                    <span className="text-xs">Fixed Amount</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'free_shipping' })}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-colors ${
                      formData.type === 'free_shipping'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FiTruck className="mb-1" />
                    <span className="text-xs">Free Shipping</span>
                  </button>
                </div>
              </div>

              {formData.type !== 'free_shipping' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formData.type === 'percentage' ? '%' : '£'}
                    </span>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      max={formData.type === 'percentage' ? '100' : undefined}
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.value ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                  </div>
                  {errors.value && (
                    <p className="text-red-500 text-xs mt-1">{errors.value}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Subtotal
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="number"
                  name="minimumOrderSubtotal"
                  value={formData.minimumOrderSubtotal}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Leave empty for no minimum order requirement
              </p>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Conditions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applicable Products
                </label>
                <select
                  multiple
                  value={formData.applicableProducts}
                  onChange={(e) => handleMultiSelectChange(e, 'applicableProducts')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  size="5"
                >
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="text-gray-500 text-xs mt-1">
                  Hold Ctrl/Cmd to select multiple. Leave empty for all products.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applicable Categories
                </label>
                <select
                  multiple
                  value={formData.applicableCategories}
                  onChange={(e) => handleMultiSelectChange(e, 'applicableCategories')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  size="5"
                >
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-gray-500 text-xs mt-1">
                  Hold Ctrl/Cmd to select multiple. Leave empty for all categories.
                </p>
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Usage Limits</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  name="totalUsageLimit"
                  value={formData.totalUsageLimit}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Unlimited"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Leave empty for unlimited usage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Per User Usage Limit
                </label>
                <input
                  type="number"
                  name="perUserUsageLimit"
                  value={formData.perUserUsageLimit}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Dates and Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Dates & Status</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/promotions')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !codeAvailable}
              className={`px-6 py-2 rounded-lg text-white transition duration-200 ${
                saving || !codeAvailable
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Promotion' : 'Create Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPromotionFormPage;