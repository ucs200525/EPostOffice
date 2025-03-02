const express = require('express');
const router = express.Router();
const Customer = require('../../models/customer/Customer');
const Transaction = require('../../models/customer/Transaction');
const axios = require('axios');
const { getCoordinates } = require('../../utils/geocoding');

// Get Wallet Balance for Customer
router.get('/:customerId/wallet', async (req, res) => {
    try {
        const { customerId } = req.params;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({
            customerId,
            balance :  customer.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wallet balance', error: error.message });
    }
});

// Get transaction history for a customer
router.get('/:customerId/transactions', async (req, res) => {
    try {
        const { customerId } = req.params;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const transactions = await Transaction.find({ customerId });

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found' });
        }

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a transaction (credit or debit)
router.post('/add-transaction', async (req, res) => {
    try {
        const { customerId, type, amount, description } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const newTransaction = new Transaction({
            customerId,
            type,
            amount,
            description
        });

        await newTransaction.save();

        res.status(201).json({
            success: true,
            message: 'Transaction added successfully',
            transaction: newTransaction
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Top Up Wallet
router.post('/topup', async (req, res) => {
    try {
        const { customerId, amount, paymentDetails } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const newTransaction = new Transaction({
            customerId,
            type: 'credit',
            amount,
            description: 'Wallet top-up'
        });

        await newTransaction.save();
        await customer.updateWalletBalance(amount);

        res.status(200).json({
            message: 'Wallet topped up successfully',
            newBalance: customer.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing top-up', error: error.message });
    }
});

// Pay for Order
router.post('/payForOrder', async (req, res) => {
    try {
        const { customerId, orderId, amount } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        if (customer.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const newTransaction = new Transaction({
            customerId,
            type: 'debit',
            amount,
            description: `Payment for order ${orderId}`
        });

        await newTransaction.save();
        await customer.updateWalletBalance(-amount);

        res.status(200).json({
            message: 'Payment successful',
            newBalance: customer.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
});

// Get addresses - Updated with better error handling and logging
router.get('/addresses/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: {
        pickup: customer.pickupAddress || null,
        delivery: customer.deliveryAddresses || []
      }
    });
  } catch (error) {
    console.error('Error in /addresses route:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching addresses'
    });
  }
});

// Add new address with improved geocoding
router.post('/addresses/:customerId', async (req, res) => {
  try {
    const { label, streetAddress, city, state, postalCode, country, type } = req.body;
    const { customerId } = req.params;

    // Validate required fields
    if (!customerId || !label || !streetAddress || !city || !state || !postalCode || !country || !type) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        receivedFields: { label, streetAddress, city, state, postalCode, country, type }
      });
    }

    // Validate address type
    if (!['pickup', 'delivery'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Address type must be either "pickup" or "delivery"'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Get coordinates with properly formatted address data
    const fullAddress = `${streetAddress}, ${city}, ${state}, ${postalCode}, ${country}`;
    const coordinates = await getCoordinates(fullAddress);

    console.log('Geocoding result:', coordinates);

    const newAddress = {
      label,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      coordinates,
      type,
      isDefault: false
    };

    // Handle pickup address
    if (type === 'pickup') {
      customer.pickupAddress = newAddress;
    } else {
      // Handle delivery address
      if (!customer.deliveryAddresses) {
        customer.deliveryAddresses = [];
      }
      newAddress.isDefault = customer.deliveryAddresses.length === 0;
      customer.deliveryAddresses.push(newAddress);
    }

    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: newAddress,
      geocodingDetails: {
        isApproximate: coordinates.isApproximate,
        source: coordinates.source,
        displayName: coordinates.displayName
      }
    });
  } catch (error) {
    console.error('Address creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.stack
    });
  }
});

// Update address
router.put('/addresses/:customerId/:addressType', async (req, res) => {
  try {
    const { customerId, addressType } = req.params;
    // const { addressId } = req.query;
    const { label, streetAddress, city, state, postalCode, country, isDefault, type, addressId } = req.body;

    console.log('Update address request:', { customerId, addressId, body: req.body });

    if (!addressType) {
      return res.status(400).json({
        success: false,
        message: "Address type is required ('pickup' or 'delivery')"
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Format address for geocoding
    const fullAddress = `${streetAddress}, ${city}, ${state}, ${postalCode}, ${country}`;
    const coordinates = await getCoordinates(fullAddress);

    // Create updated address object
    const updatedAddress = {
      label,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      addressType,
      coordinates,
      isDefault: !!isDefault
    };

    if (addressType === 'pickup') {
      // Update pickup address
      customer.pickupAddress = {
        ...updatedAddress,
        _id: customer.pickupAddress?._id || new mongoose.Types.ObjectId()
      };
    } else {
      // Find and update delivery address
      const addressIndex = customer.deliveryAddresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Delivery address not found'
        });
      }

      // Handle default address setting
      if (isDefault) {
        customer.deliveryAddresses.forEach((addr, idx) => {
          addr.isDefault = (idx === addressIndex);
        });
      }

      // Update the specific delivery address while preserving its _id
      customer.deliveryAddresses[addressIndex] = {
        ...customer.deliveryAddresses[addressIndex].toObject(),
        ...updatedAddress
      };
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: {
        address: addressType === 'pickup' ? customer.pickupAddress : customer.deliveryAddresses.find(addr => addr._id.toString() === addressId)
      }
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating address',
      details: error.message
    });
  }
});
// Delete address
router.delete('/addresses/:customerId/:addressType', async (req, res) => {
  try {
    const { customerId, addressType } = req.params;
    const { addressId } = req.query;

    console.log('Delete address request:', { customerId, addressId, addressType });

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    if (addressType === 'pickup') {
      customer.pickupAddress = null;
    } else if (addressType === 'delivery') {
      // Safely find the address index
      const addressIndex = customer.deliveryAddresses.findIndex(
        addr => addr._id.toString() === addressId
      );

      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Delivery address not found'
        });
      }

      // Safely handle default address reassignment
      const deletingAddress = customer.deliveryAddresses[addressIndex];
      if (deletingAddress && deletingAddress.isDefault && customer.deliveryAddresses.length > 1) {
        const newDefaultIndex = addressIndex === 0 ? 1 : 0;
        customer.deliveryAddresses[newDefaultIndex].isDefault = true;
      }

      // Remove the address
      customer.deliveryAddresses.splice(addressIndex, 1);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid address type'
      });
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting address',
      details: error.message
    });
  }
});

module.exports = router;