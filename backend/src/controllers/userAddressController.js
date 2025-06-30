import User from '../models/User.js';
import { validatePostalCodeByCountry } from '../validators/addressValidators.js';
import logger from '../utils/logger.js';

// Get all addresses for the authenticated user
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const activeAddresses = user.getActiveAddresses();

    res.json({
      success: true,
      data: {
        addresses: activeAddresses,
        defaultShippingAddressId: user.defaultShippingAddressId,
        defaultBillingAddressId: user.defaultBillingAddressId
      }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses'
    });
  }
};

// Get a specific address by ID
export const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const address = user.getAddressById(addressId);
    
    if (!address || address.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Get address by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch address'
    });
  }
};

// Add a new address
export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      company,
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      postalCode,
      country,
      phoneNumber,
      setAsDefaultShipping,
      setAsDefaultBilling
    } = req.body;

    // Additional validation for postal code based on country
    if (!validatePostalCodeByCountry(postalCode, country)) {
      return res.status(400).json({
        success: false,
        error: `Invalid postal code format for ${country}`
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create new address
    const addressData = {
      fullName,
      company,
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      postalCode,
      country,
      phoneNumber
    };

    const newAddress = user.addAddress(addressData);

    // Set as default addresses if requested
    if (setAsDefaultShipping) {
      user.defaultShippingAddressId = newAddress._id;
    }

    if (setAsDefaultBilling) {
      user.defaultBillingAddressId = newAddress._id;
    }

    await user.save();

    // Log the action
    logger.info('Address added', {
      userId: user._id,
      addressId: newAddress._id,
      action: 'add_address'
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: {
        address: newAddress,
        defaultShippingAddressId: user.defaultShippingAddressId,
        defaultBillingAddressId: user.defaultBillingAddressId
      }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add address'
    });
  }
};

// Update an existing address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const {
      fullName,
      company,
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      postalCode,
      country,
      phoneNumber,
      setAsDefaultShipping,
      setAsDefaultBilling
    } = req.body;

    // Additional validation for postal code based on country
    if (postalCode && country && !validatePostalCodeByCountry(postalCode, country)) {
      return res.status(400).json({
        success: false,
        error: `Invalid postal code format for ${country}`
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (company !== undefined) updateData.company = company;
    if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
    if (city !== undefined) updateData.city = city;
    if (stateProvince !== undefined) updateData.stateProvince = stateProvince;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    try {
      const updatedAddress = user.updateAddress(addressId, updateData);

      // Set as default addresses if requested
      if (setAsDefaultShipping) {
        user.defaultShippingAddressId = addressId;
      }

      if (setAsDefaultBilling) {
        user.defaultBillingAddressId = addressId;
      }

      await user.save();

      // Log the action
      logger.info('Address updated', {
        userId: user._id,
        addressId: addressId,
        action: 'update_address'
      });

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: {
          address: updatedAddress,
          defaultShippingAddressId: user.defaultShippingAddressId,
          defaultBillingAddressId: user.defaultBillingAddressId
        }
      });
    } catch (userError) {
      return res.status(404).json({
        success: false,
        error: userError.message
      });
    }
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update address'
    });
  }
};

// Delete an address (soft delete)
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    try {
      const deletedAddress = user.deleteAddress(addressId);
      await user.save();

      // Log the action
      logger.info('Address deleted', {
        userId: user._id,
        addressId: addressId,
        action: 'delete_address'
      });

      res.json({
        success: true,
        message: 'Address deleted successfully',
        data: {
          defaultShippingAddressId: user.defaultShippingAddressId,
          defaultBillingAddressId: user.defaultBillingAddressId
        }
      });
    } catch (userError) {
      return res.status(404).json({
        success: false,
        error: userError.message
      });
    }
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete address'
    });
  }
};

// Set default address (shipping or billing)
export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { type } = req.body; // 'shipping' or 'billing'

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    try {
      if (type === 'shipping') {
        user.setDefaultShippingAddress(addressId);
      } else if (type === 'billing') {
        user.setDefaultBillingAddress(addressId);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid address type. Must be "shipping" or "billing"'
        });
      }

      await user.save();

      // Log the action
      logger.info('Default address set', {
        userId: user._id,
        addressId: addressId,
        type: type,
        action: 'set_default_address'
      });

      res.json({
        success: true,
        message: `Default ${type} address set successfully`,
        data: {
          defaultShippingAddressId: user.defaultShippingAddressId,
          defaultBillingAddressId: user.defaultBillingAddressId
        }
      });
    } catch (userError) {
      return res.status(404).json({
        success: false,
        error: userError.message
      });
    }
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set default address'
    });
  }
};

// Clear default address (shipping or billing)
export const clearDefaultAddress = async (req, res) => {
  try {
    const { type } = req.body; // 'shipping' or 'billing'

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (type === 'shipping') {
      user.defaultShippingAddressId = null;
    } else if (type === 'billing') {
      user.defaultBillingAddressId = null;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid address type. Must be "shipping" or "billing"'
      });
    }

    await user.save();

    // Log the action
    logger.info('Default address cleared', {
      userId: user._id,
      type: type,
      action: 'clear_default_address'
    });

    res.json({
      success: true,
      message: `Default ${type} address cleared successfully`,
      data: {
        defaultShippingAddressId: user.defaultShippingAddressId,
        defaultBillingAddressId: user.defaultBillingAddressId
      }
    });
  } catch (error) {
    console.error('Clear default address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear default address'
    });
  }
};

// Legacy compatibility functions (for backward compatibility with existing code)
export const getUserAddresses = getAddresses;
export const addUserAddress = addAddress;
export const updateUserAddress = updateAddress;
export const deleteUserAddress = deleteAddress;