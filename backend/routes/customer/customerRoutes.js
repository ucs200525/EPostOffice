const express = require('express');
const router = express.Router();
const Customer = require('../../models/customer/Customer');
const Transaction = require('../../models/customer/Transaction');
const axios = require('axios');
const { getCoordinates } = require('../../utils/geocoding');

router.post('/register-staff', async (req, res) => {
  try {
    // Verify that the requestor is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to register staff' });
    }

    const { name, email, password, phone, address, staffId, department } = req.body;

    // Check if staff with same email or staffId already exists
    const existingStaff = await User.findOne({ 
      $or: [{ email }, { staffId }]
    });

    if (existingStaff) {
      return res.status(400).json({ 
        message: 'Staff member with this email or ID already exists' 
      });
    }

    // Create new staff member
    const staff = new User({
      name,
      email,
      password,
      phone,
      address,
      staffId,
      department,
      role: 'staff'
    });

    await staff.save();

    res.status(201).json({
      success: true,
      message: 'Staff member registered successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error registering staff member', 
      error: error.message 
    });
  }
});

// Get all staff members
router.get('/staff-list', async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view staff list' });
    }

    // Fetch all users with role 'staff'
    const staffList = await User.find({ role: 'staff' })
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      staffList
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error fetching staff list',
      error: error.message
    });
  }
});

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
router.get('/addresses', async (req, res) => {
  try {
    // Get userId from query params or auth token
    const userId = req.query.userId || (req.user && req.user.id);

    if (!userId) {
      console.log('No userId provided');
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    console.log('Looking for customer with ID:', userId);

    const customer = await Customer.findById(userId);
    
    if (!customer) {
      console.log('Customer not found for ID:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    console.log('Found customer:', customer.name);
    console.log('Addresses:', customer.addresses);

    res.json({ 
      success: true, 
      addresses: customer.addresses || [] 
    });
  } catch (error) {
    console.error('Error in /addresses route:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: 'Error fetching addresses'
    });
  }
});

// Add new address with improved geocoding
router.post('/addresses', async (req, res) => {
  try {
    const { label, streetAddress, city, state, postalCode, country } = req.body;
    const userId = req.query.userId;

    // Validate required fields
    if (!userId || !label || !streetAddress || !city || !state || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        receivedFields: { label, streetAddress, city, state, postalCode, country }
      });
    }

    const customer = await Customer.findById(userId);
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
      isDefault: customer.addresses.length === 0
    };

    customer.addresses.push(newAddress);
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
router.put('/addresses/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.query.userId;
    const { label, streetAddress, city, state, postalCode, country, isDefault } = req.body;

    console.log('Update address request:', { addressId, userId, body: req.body });

    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Find the address in the customer's addresses array
    const addressIndex = customer.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Format address for geocoding
    const fullAddress = `${streetAddress}, ${city}, ${state}, ${postalCode}, ${country}`;
    const coordinates = await getCoordinates(fullAddress);
    console.log('Received coordinates:', coordinates);

    // Update the address
    const updatedAddress = {
      label,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      coordinates: coordinates || customer.addresses[addressIndex].coordinates,
      isDefault: isDefault || customer.addresses[addressIndex].isDefault
    };

    // If this address is being set as default, remove default from other addresses
    if (isDefault) {
      customer.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update the address in the array
    customer.addresses[addressIndex] = {
      ...customer.addresses[addressIndex].toObject(),
      ...updatedAddress
    };

    await customer.save();
    console.log('Address updated successfully');

    res.json({
      success: true,
      message: 'Address updated successfully',
      address: customer.addresses[addressIndex]
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      details: 'Error updating address'
    });
  }
});

// Delete address
router.delete('/addresses/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.query.userId;

    console.log('Delete address request:', { addressId, userId });

    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Find the address in the customer's addresses array
    const addressIndex = customer.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove the address from the array
    customer.addresses.splice(addressIndex, 1);

    await customer.save();
    console.log('Address deleted successfully');

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      details: 'Error deleting address'
    });
  }
});

module.exports = router;
