const express = require('express');
const router = express.Router();
const Order = require('../../models/order/Order');
const auth = require('../../middleware/auth');
const Customer = require('../../models/customer/Customer');

// Debug middleware for tracking requests
router.use((req, res, next) => {
  console.log('Order route accessed:', {
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body
  });
  next();
});

// // Get all orders for the logged-in user - Remove items population
// router.get('/my-orders/:customerId', async (req, res) => {
//     try {
//         const { customerId } = req.params;
//         console.log('Fetching orders for customer:', customerId); // Debug log

//         if (!customerId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Customer ID is required'
//             });
//         }

//         const orders = await Order.find({ customerId })
//             // Remove .populate('items') since it doesn't exist
//             .sort({ createdAt: -1 });

//         console.log('Found orders:', orders.length); // Debug log
        
//         // Calculate stats from orders
//         const stats = {
//             active: orders.filter(order => order.status === 'pending').length,
//             transit: orders.filter(order => order.status === 'in-transit').length,
//             completed: orders.filter(order => order.status === 'delivered').length,
//             total: orders.length
//         };

//         res.json({
//             success: true,
//             data: orders,
//             stats
//         });
//     } catch (error) {
//         console.error('Error fetching orders:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Error fetching orders'
//         });
//     }
// });
// Get all orders for the logged-in user - Fetch addresses from Customer schema
router.get('/my-orders/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        console.log('Fetching orders for customer:', customerId); // Debug log

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: 'Customer ID is required'
            });
        }

        const orders = await Order.find({ customerId }).sort({ createdAt: -1 });

        console.log('Found orders:', orders.length); // Debug log

        // Fetch the customer details to get pickup and delivery addresses
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const updatedOrders = orders.map(order => {
            const pickupAddress = customer.pickupAddress._id.toString() === order.pickupAddress.toString()
                ? customer.pickupAddress
                : null;

            const shippingAddress = customer.deliveryAddresses.find(addr => addr._id.toString() === order.shippingAddress.toString()) || null;

            return {
                ...order.toObject(),
                pickupAddress,
                shippingAddress
            };
        });

        // Calculate stats from orders
        const stats = {
            active: updatedOrders.filter(order => order.status === 'pending').length,
            transit: updatedOrders.filter(order => order.status === 'in-transit').length,
            completed: updatedOrders.filter(order => order.status === 'delivered').length,
            total: updatedOrders.length
        };

        res.json({
            success: true,
            data: updatedOrders,
            stats
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching orders'
        });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const order = new Order({
            customerId: req.user.id,
            ...req.body
        });
        await order.save();
        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get order by ID - Remove items population
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customerId: req.user.id
        }); // Remove .populate('items')
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, customerId: req.user.id },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add tracking route
router.get('/track/:trackingNumber', async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const order = await Order.findOne({ trackingNumber });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Calculate current location and status based on delivery timeline
        const currentDate = new Date();
        const createdDate = new Date(order.createdAt);
        const estimatedDelivery = new Date(order.estimatedDeliveryDate);
        
        const progress = Math.min(
            ((currentDate - createdDate) / (estimatedDelivery - createdDate)) * 100,
            100
        );

        // Generate mock tracking history
        const history = [
            {
                status: 'Order Created',
                location: order.pickupAddress?.city || 'Pickup Location',
                timestamp: order.createdAt
            }
        ];

        if (progress > 25) {
            history.push({
                status: 'Package Picked Up',
                location: order.pickupAddress?.city || 'Pickup Location',
                timestamp: new Date(createdDate.getTime() + (estimatedDelivery - createdDate) * 0.25)
            });
        }

        if (progress > 50) {
            history.push({
                status: 'In Transit',
                location: 'Distribution Center',
                timestamp: new Date(createdDate.getTime() + (estimatedDelivery - createdDate) * 0.5)
            });
        }

        if (progress > 75) {
            history.push({
                status: 'Out for Delivery',
                location: order.shippingAddress?.city || 'Delivery Location',
                timestamp: new Date(createdDate.getTime() + (estimatedDelivery - createdDate) * 0.75)
            });
        }

        if (progress === 100) {
            history.push({
                status: 'Delivered',
                location: order.shippingAddress?.city || 'Delivery Location',
                timestamp: estimatedDelivery
            });
        }

        // Determine current status
        let currentStatus = 'Pending';
        if (progress >= 100) currentStatus = 'Delivered';
        else if (progress > 75) currentStatus = 'Out for Delivery';
        else if (progress > 25) currentStatus = 'In Transit';
        else if (progress > 0) currentStatus = 'Package Picked Up';

        res.json({
            success: true,
            tracking: {
                trackingNumber,
                status: currentStatus,
                currentLocation: history[history.length - 1].location,
                estimatedDelivery: order.estimatedDeliveryDate,
                history: history.reverse(),
                progress
            }
        });
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking order',
            error: error.message
        });
    }
});

module.exports = router;
