const express = require('express');
const router = express.Router();
const Customer = require('../../models/customer/Customer');
const Order = require('../../models/order/Order');
const { getCoordinates } = require('../../utils/geocoding');

// Get customer profile
router.get('/profile', async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id)
            .select('-password')
            .populate('orders');
        
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
            message: error.message
        });
    }
});

// Update customer profile
router.put('/profile', async (req, res) => {
    try {
        const { name, phone } = req.body;
        const customer = await Customer.findByIdAndUpdate(
            req.user.id,
            { name, phone },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get addresses by type
router.get('/addresses/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const addresses = type === 'pickup' 
            ? { address: customer.pickupAddress }
            : { addresses: customer.deliveryAddresses };

        res.json({
            success: true,
            ...addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add new address
router.post('/addresses', async (req, res) => {
    try {
        const { label, streetAddress, city, state, postalCode, country, type } = req.body;
        const customer = await Customer.findById(req.user.id);

        const coordinates = await getCoordinates(
            `${streetAddress}, ${city}, ${state}, ${postalCode}, ${country}`
        );

        const newAddress = {
            label,
            streetAddress,
            city,
            state,
            postalCode,
            country,
            coordinates,
            type
        };

        if (type === 'pickup') {
            customer.pickupAddress = newAddress;
        } else {
            newAddress.isDefault = !customer.deliveryAddresses.length;
            customer.deliveryAddresses.push(newAddress);
        }

        await customer.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address: newAddress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update address
router.put('/addresses/:addressId', async (req, res) => {
    try {
        const { addressId } = req.params;
        const { label, streetAddress, city, state, postalCode, country, isDefault, type } = req.body;
        const customer = await Customer.findById(req.user.id);

        const coordinates = await getCoordinates(
            `${streetAddress}, ${city}, ${state}, ${postalCode}, ${country}`
        );

        if (type === 'pickup') {
            customer.pickupAddress = {
                label, streetAddress, city, state, postalCode, country, coordinates, type
            };
        } else {
            const addressIndex = customer.deliveryAddresses.findIndex(
                addr => addr._id.toString() === addressId
            );

            if (addressIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Address not found'
                });
            }

            if (isDefault) {
                customer.deliveryAddresses.forEach(addr => addr.isDefault = false);
            }

            customer.deliveryAddresses[addressIndex] = {
                ...customer.deliveryAddresses[addressIndex].toObject(),
                label, streetAddress, city, state, postalCode, country, coordinates, isDefault, type
            };
        }

        await customer.save();

        res.json({
            success: true,
            message: 'Address updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete address
router.delete('/addresses/:type/:addressId', async (req, res) => {
    try {
        const { type, addressId } = req.params;
        const customer = await Customer.findById(req.user.id);

        if (type === 'pickup') {
            customer.pickupAddress = null;
        } else {
            customer.deliveryAddresses = customer.deliveryAddresses.filter(
                addr => addr._id.toString() !== addressId
            );
        }

        await customer.save();

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get wallet balance
router.get('/wallet', async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id).select('walletBalance');
        res.json({
            success: true,
            balance: customer.walletBalance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Top up wallet
router.post('/wallet/topup', async (req, res) => {
    try {
        const { amount } = req.body;
        const customer = await Customer.findById(req.user.id);
        await customer.updateWalletBalance(amount);

        res.json({
            success: true,
            message: 'Wallet topped up successfully',
            newBalance: customer.walletBalance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
