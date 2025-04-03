const express = require('express');
const router = express.Router();
const Customer = require('../../models/customer/Customer');
const Transaction = require('../../models/customer/Transaction');
const axios = require('axios');
const { getCoordinates } = require('../../utils/geocoding');
const { auth } = require('../../middleware/auth');

// Get Wallet Balance for Customer
router.get('/:customerId/wallet', async (req, res) => {
    try {
        const { customerId } = req.params;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({
            success: true,
            customerId,
            balance: customer.walletBalance
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
        const { customerId, transactionType, amount, description } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const newTransaction = new Transaction({
            customerId,
            transactionType,
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
router.post('/wallet/topup', async (req, res) => {
    try {
        const { customerId, amount, paymentMethod } = req.body;

        if (!customerId || !amount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Create transaction record
        const transaction = new Transaction({
            customerId,
            transactionType: 'CREDIT',
            amount: parseFloat(amount),
            description: `Wallet top-up via ${paymentMethod.replace('_', ' ')}`,
            paymentMethod,
            status: 'completed'
        });

        await transaction.save();

        // Update wallet balance
        const newBalance = customer.walletBalance + parseFloat(amount);
        await Customer.findByIdAndUpdate(customerId, { walletBalance: newBalance });

        res.status(200).json({
            success: true,
            message: 'Wallet topped up successfully',
            newBalance,
            transaction
        });
    } catch (error) {
        console.error('Top-up error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing top-up',
            error: error.message
        });
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

        // Update wallet balance
        customer.walletBalance -= amount;

        // Create and save transaction
        const newTransaction = new Transaction({
            customerId,
            transactionType: 'DEBIT',
            amount,
            description: `Payment for order ${orderId}`
        });
        await newTransaction.save();

        // Add notification with all required fields
        const notification = {
            message: `Payment of ₹${amount} processed for order ${orderId}`,
            type: 'system',
            isRead: false,
            createdAt: new Date()
        };

        customer.notifications.push(notification);
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Payment successful',
            newBalance: customer.walletBalance
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            message: 'Error processing payment',
            error: error.message
        });
    }
});

// Get customer profile
router.get('/:customerId', auth, async (req, res) => {
    try {
        const { customerId } = req.params;
        const customer = await Customer.findById(customerId)
            .select('-password -__v'); // Exclude sensitive fields

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error('Error fetching customer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// Get profile
router.get('/profile/:customerId', auth, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId)
            .select('name email phone');
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// Update profile
router.put('/profile/:customerId', auth, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const customer = await Customer.findByIdAndUpdate(
            req.params.customerId,
            { name, email, phone },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: customer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

// Get notifications 
router.get('/notifications/:customerId', auth, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId)
            .select('notificationSettings');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: customer.notificationSettings || {
                emailNotifications: true,
                smsNotifications: true,
                orderUpdates: true,
                promotionalEmails: false
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
});

// Update notifications
router.put('/notifications/:customerId', auth, async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.customerId,
            { notificationSettings: req.body },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Notification preferences updated successfully',
            data: customer.notificationSettings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating notifications',
            error: error.message
        });
    }
});

// Update password
router.put('/password/:customerId', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const customer = await Customer.findById(req.params.customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Direct password comparison
        if (customer.password !== currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update only the password field using findByIdAndUpdate
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.customerId,
            { password: newPassword },
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!updatedCustomer) {
            throw new Error('Failed to update password');
        }

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password',
            error: error.message
        });
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
            isDefault: type === 'pickup' ? true : false // Pickup address is always default
        };

        // Handle pickup address
        if (type === 'pickup') {
            customer.pickupAddress = {
                ...newAddress,
                isDefault: true // Ensure pickup address is always default
            };
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
        const { addressId, label, streetAddress, city, state, postalCode, country, isDefault, type } = req.body;

        console.log('Update address request:', { customerId, addressId, addressType, body: req.body });

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
            coordinates,
            isDefault: addressType === 'pickup' ? true : !!isDefault, // Pickup is always default
            type: addressType // Use the addressType from params instead of body
        };

        let updatedAddressData;

        if (addressType === 'pickup') {
            // Update pickup address
            customer.pickupAddress = {
                ...updatedAddress,
                _id: customer.pickupAddress?._id || addressId,
                type: 'pickup', // Explicitly set type for pickup address
                isDefault: true // Ensure pickup address is always default
            };
            updatedAddressData = customer.pickupAddress;
        } else if (addressType === 'delivery') {
            // Find and update delivery address
            const addressIndex = customer.deliveryAddresses.findIndex(
                addr => addr._id.toString() === addressId
            );

            if (addressIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Delivery address not found',
                    debug: { addressId, availableIds: customer.deliveryAddresses.map(addr => addr._id.toString()) }
                });
            }

            // Handle default address setting
            if (isDefault) {
                customer.deliveryAddresses.forEach(addr => {
                    addr.isDefault = false;
                });
            }

            // Update the specific delivery address
            customer.deliveryAddresses[addressIndex] = {
                ...customer.deliveryAddresses[addressIndex].toObject(),
                ...updatedAddress,
                _id: customer.deliveryAddresses[addressIndex]._id,
                type: 'delivery' // Explicitly set type for delivery address
            };
            
            updatedAddressData = customer.deliveryAddresses[addressIndex];
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid address type'
            });
        }

        await customer.save();

        res.json({
            success: true,
            message: 'Address updated successfully',
            data: updatedAddressData
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