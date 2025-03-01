const express = require('express');
const router = express.Router();
const Address = require('../../models/Address');
const auth = require('../../middleware/auth');
const { getCoordinates } = require('../../utils/geocoding');

// Get all addresses for a customer
router.get('/', async (req, res) => {
    try {
        console.log('Fetching addresses for user:', req.user.id);
        const addresses = await Address.find({ userId: req.user.id });
        console.log('Found addresses:', addresses);
        res.json({
            success: true,
            addresses: addresses
        });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching addresses' 
        });
    }
});

// Add a new address
router.post('/', async (req, res) => {
    try {
        const { street, city, state, postalCode, country, isPickupAddress } = req.body;

        // Get coordinates
        const fullAddress = `${street}, ${city}, ${state}, ${postalCode}, ${country}`;
        const coordinates = await getCoordinates(fullAddress);

        const newAddress = new Address({
            userId: req.user.id,
            street,
            city,
            state,
            postalCode,
            country,
            isPickupAddress,
            coordinates
        });

        const savedAddress = await newAddress.save();
        res.status(201).json({
            success: true,
            address: savedAddress
        });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error adding address' 
        });
    }
});

// Update an address
router.put('/:id', async (req, res) => {
    try {
        const { street, city, state, zipCode, country, type } = req.body;
        const address = await Address.findOne({ _id: req.params.id, userId: req.user.id });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        address.street = street;
        address.city = city;
        address.state = state;
        address.zipCode = zipCode;
        address.country = country;
        address.type = type;

        const updatedAddress = await address.save();
        res.json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Error updating address' });
    }
});

// Delete an address
router.delete('/:id', async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Error deleting address' });
    }
});

module.exports = router;