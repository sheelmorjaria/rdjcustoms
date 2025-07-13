import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiPower, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { getPromotions, deletePromotion, updatePromotionStatus } from '../services/adminService';

const AdminPromotionsListPage = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPromotions();
  }, [currentPage, searchTerm, filterType, filterStatus]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        type: filterType,
        status: filterStatus
      };

      const response = await getPromotions(params);
      setPromotions(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPromotions();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchPromotions();
  };

  const handleStatusToggle = async (promoId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updatePromotionStatus(promoId, newStatus);
      toast.success(`Promotion ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchPromotions();
    } catch (error) {
      console.error('Error updating promotion status:', error);
      toast.error('Failed to update promotion status');
    }
  };

  const handleDelete = async (promoId, promoName) => {
    if (window.confirm(`Are you sure you want to delete "${promoName}"?`)) {
      try {
        await deletePromotion(promoId);
        toast.success('Promotion deleted successfully');
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        toast.error('Failed to delete promotion');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-600'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeLabels = {
      percentage: 'Percentage',
      fixed_amount: 'Fixed Amount',
      free_shipping: 'Free Shipping'
    };

    return (
      <span className="text-sm font-medium">
        {typeLabels[type] || type}
      </span>
    );
  };

  const formatValue = (promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}%`;
      case 'fixed_amount':
        return `£${promotion.value.toFixed(2)}`;
      case 'free_shipping':
        return 'Free';
      default:
        return '-';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Promotions</h1>
        <Link
          to="/admin/promotions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
        >
          <FiPlus /> Add New Promotion
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              handleFilterChange();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
            <option value="free_shipping">Free Shipping</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              handleFilterChange();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name / Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No promotions found
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => (
                  <tr key={promotion._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{promotion.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(promotion.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatValue(promotion)}
                      </div>
                      {promotion.minimumOrderSubtotal > 0 && (
                        <div className="text-xs text-gray-500">
                          Min: £{promotion.minimumOrderSubtotal.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {promotion.timesUsed || 0} / {promotion.totalUsageLimit || '∞'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Per user: {promotion.perUserUsageLimit || 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(promotion.startDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        to {formatDate(promotion.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(promotion.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/promotions/${promotion._id}/edit`)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        {(promotion.status === 'active' || promotion.status === 'inactive') && (
                          <button
                            onClick={() => handleStatusToggle(promotion._id, promotion.status)}
                            className={`p-1 ${
                              promotion.status === 'active'
                                ? 'text-yellow-600 hover:text-yellow-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={promotion.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            <FiPower />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(promotion._id, promotion.name)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotionsListPage;