import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiMapPin, FiTruck, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAddresses, deleteAddress, setDefaultAddress } from '../services/addressService';

const CustomerAddressBookPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultShippingId, setDefaultShippingId] = useState(null);
  const [defaultBillingId, setDefaultBillingId] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await getAddresses();
      setAddresses(response.data.addresses);
      setDefaultShippingId(response.data.defaultShippingAddressId);
      setDefaultBillingId(response.data.defaultBillingAddressId);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId, addressName) => {
    if (window.confirm(`Are you sure you want to delete this address?\n\n${addressName}`)) {
      try {
        await deleteAddress(addressId);
        toast.success('Address deleted successfully');
        fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (addressId, type) => {
    try {
      await setDefaultAddress(addressId, type);
      toast.success(`Default ${type} address updated successfully`);
      fetchAddresses();
    } catch (error) {
      console.error(`Error setting default ${type} address:`, error);
      toast.error(`Failed to set default ${type} address`);
    }
  };

  const formatAddress = (address) => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.stateProvince,
      address.postalCode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const AddressCard = ({ address }) => {
    const isDefaultShipping = defaultShippingId === address._id;
    const isDefaultBilling = defaultBillingId === address._id;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FiMapPin className="text-gray-400" />
              <h3 className="font-semibold text-lg text-gray-900">{address.fullName}</h3>
            </div>
            
            {address.company && (
              <p className="text-sm text-gray-600 mb-1">{address.company}</p>
            )}
            
            <p className="text-gray-700 text-sm mb-2">
              {formatAddress(address)}
            </p>
            
            {address.phoneNumber && (
              <p className="text-sm text-gray-600">Phone: {address.phoneNumber}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={() => navigate(`/addresses/edit/${address._id}`)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit address"
            >
              <FiEdit2 />
            </button>
            <button
              onClick={() => handleDelete(address._id, address.fullName)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              title="Delete address"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        {/* Default address indicators */}
        <div className="flex flex-wrap gap-2 mb-4">
          {isDefaultShipping && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              <FiTruck className="w-3 h-3" />
              Default Shipping
            </span>
          )}
          {isDefaultBilling && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              <FiCreditCard className="w-3 h-3" />
              Default Billing
            </span>
          )}
        </div>

        {/* Set as default buttons */}
        <div className="flex flex-wrap gap-2">
          {!isDefaultShipping && (
            <button
              onClick={() => handleSetDefault(address._id, 'shipping')}
              className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
            >
              <FiTruck className="w-3 h-3" />
              Set as Default Shipping
            </button>
          )}
          {!isDefaultBilling && (
            <button
              onClick={() => handleSetDefault(address._id, 'billing')}
              className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
            >
              <FiCreditCard className="w-3 h-3" />
              Set as Default Billing
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Address Book</h1>
            <p className="text-gray-600">Manage your shipping and billing addresses</p>
          </div>
          
          <Link
            to="/addresses/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            <FiPlus />
            Add New Address
          </Link>
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
                <span className="text-gray-500">Address Book</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Addresses Grid */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiMapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
            <p className="text-gray-500 mb-6">
              Add your first address to make checkout faster and easier.
            </p>
            <Link
              to="/addresses/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <FiPlus />
              Add Your First Address
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((address) => (
              <AddressCard key={address._id} address={address} />
            ))}
          </div>
        )}

        {/* Help Text */}
        {addresses.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiStar className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Default Address Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Set default shipping and billing addresses to speed up checkout. 
                    These will be automatically selected when you place orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAddressBookPage;