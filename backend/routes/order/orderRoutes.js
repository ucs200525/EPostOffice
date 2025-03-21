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

// Update the route from '/' to '/create' to match frontend request
router.post('/create/:customerId', async (req, res) => {
  try {
    console.log('Creating new order:', req.body);
    const { customerId } = req.params;

    // Ensure numeric values
    const weight = parseFloat(req.body.packageDetails.weight) || 0;
    const basePrice = Number((50 * 83).toFixed(2));
    const weightCharge = Number((weight * 10 * 83).toFixed(2));
    const insuranceCharge = req.body.customsDeclaration?.value 
      ? Number((parseFloat(req.body.customsDeclaration.value) * 83 * 0.01).toFixed(2))
      : 0;
    const totalAmount = Number((basePrice + weightCharge + insuranceCharge).toFixed(2));

    const order = new Order({
      customerId,
      trackingNumber: `EP${Math.random().toString().substring(2, 15)}`,
      pickupAddress: req.body.pickupAddress,
      shippingAddress: req.body.deliveryAddress,
      packageDetails: {
        type: req.body.packageDetails.type,
        weight: weight,
        dimensions: {
          length: parseFloat(req.body.packageDetails.dimensions.length) || 0,
          width: parseFloat(req.body.packageDetails.dimensions.width) || 0,
          height: parseFloat(req.body.packageDetails.dimensions.height) || 0
        },
        specialInstructions: req.body.packageDetails.specialInstructions
      },
      status: 'pending',
      orderType: req.body.orderType,
      totalAmount: totalAmount,
      cost: {
        basePrice: basePrice,
        weightCharge: weightCharge,
        insuranceCharge: insuranceCharge,
        total: totalAmount
      },
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    const savedOrder = await order.save();
    console.log('Saved order:', savedOrder);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder,
      trackingNumber: savedOrder.trackingNumber,
      orderId: savedOrder._id
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
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

// Update order status by tracking number
router.put('/status/:trackingNumber', async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const { status } = req.body;
        
        console.log('Updating order status:', { trackingNumber, status }); // Debug log

        const order = await Order.findOneAndUpdate(
            { trackingNumber },
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
        console.error('Status update error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/track/:trackingNumber', async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const order = await Order.findOne({ trackingNumber })
            .populate({
                path: 'customerId',
                select: 'pickupAddress deliveryAddresses'
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get addresses
        const pickupAddress = order.customerId.pickupAddress;
        const deliveryAddress = order.customerId.deliveryAddresses.find(
            addr => addr._id.toString() === order.shippingAddress.toString()
        );

        const currentDate = new Date();
        const createdDate = new Date(order.createdAt);
        const estimatedDelivery = new Date(order.estimatedDeliveryDate);
        
        // Initialize history array
        const history = [];

        // Add events based on order.status instead of progress
        history.push({
            status: 'Order Created',
            location: `${pickupAddress.city}, ${pickupAddress.state}`,
            timestamp: order.createdAt,
            address: {
                street: pickupAddress.streetAddress,
                city: pickupAddress.city,
                state: pickupAddress.state,
                pincode: pickupAddress.postalCode
            }
        });

        if (order.status === 'package_picked_up' || order.status === 'in_transit' || 
            order.status === 'out_for_delivery' || order.status === 'delivered') {
            history.push({
                status: 'Package Picked Up',
                location: `${pickupAddress.city}, ${pickupAddress.state}`,
                timestamp: new Date(createdDate.getTime() + 86400000), // +1 day
                address: {
                    street: pickupAddress.streetAddress,
                    city: pickupAddress.city,
                    state: pickupAddress.state,
                    pincode: pickupAddress.postalCode
                }
            });
        }

        if (order.status === 'in_transit' || order.status === 'out_for_delivery' || 
            order.status === 'delivered') {
            history.push({
                status: 'In Transit',
                location: `Distribution Center, ${pickupAddress.state}`,
                timestamp: new Date(createdDate.getTime() + 172800000), // +2 days
                address: {
                    street: 'Distribution Hub',
                    city: pickupAddress.city,
                    state: pickupAddress.state,
                    pincode: pickupAddress.postalCode
                }
            });
        }

        if (order.status === 'out_for_delivery' || order.status === 'delivered') {
            history.push({
                status: 'Out for Delivery',
                location: `${deliveryAddress.city}, ${deliveryAddress.state}`,
                timestamp: new Date(createdDate.getTime() + 259200000), // +3 days
                address: {
                    street: deliveryAddress.streetAddress,
                    city: deliveryAddress.city,
                    state: deliveryAddress.state,
                    pincode: deliveryAddress.postalCode
                }
            });
        }

        if (order.status === 'delivered') {
            history.push({
                status: 'Delivered',
                location: `${deliveryAddress.city}, ${deliveryAddress.state}`,
                timestamp: estimatedDelivery,
                address: {
                    street: deliveryAddress.streetAddress,
                    city: deliveryAddress.city,
                    state: deliveryAddress.state,
                    pincode: deliveryAddress.postalCode
                }
            });
        }

        // Calculate progress based on status
        let progress = 0;
        switch (order.status) {
            case 'package_picked_up':
                progress = 25;
                break;
            case 'in_transit':
                progress = 50;
                break;
            case 'out_for_delivery':
                progress = 75;
                break;
            case 'delivered':
                progress = 100;
                break;
            default:
                progress = 0;
        }

        res.json({
            success: true,
            tracking: {
                trackingNumber,
                status: order.status,
                currentLocation: history[history.length - 1].location,
                estimatedDelivery: order.estimatedDeliveryDate,
                history: history.reverse(),
                progress,
                packageDetails: order.packageDetails,
                addresses: {
                    pickup: {
                        label: pickupAddress.label,
                        street: pickupAddress.streetAddress,
                        city: pickupAddress.city,
                        state: pickupAddress.state,
                        pincode: pickupAddress.postalCode,
                        country: pickupAddress.country
                    },
                    delivery: {
                        label: deliveryAddress.label,
                        street: deliveryAddress.streetAddress,
                        city: deliveryAddress.city,
                        state: deliveryAddress.state,
                        pincode: deliveryAddress.postalCode,
                        country: deliveryAddress.country
                    }
                },
                orderDetails: {
                    createdAt: order.createdAt,
                    orderType: order.orderType,
                    cost: order.cost,
                    totalAmount: order.totalAmount
                }
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

// Get all orders for staff - Move this route before other specific routes to avoid conflicts
router.get('/staff/all', async (req, res) => {
    console.log('Fetching all orders for staff');  // Debug log
    try {
        // Get all orders without populate first to debug
        const orders = await Order.find().sort({ createdAt: -1 });
        console.log('Found orders:', orders.length);  // Debug log

        if (!orders.length) {
            return res.json({
                success: true,
                orders: [],
                stats: {
                    total: 0,
                    pending: 0,
                    inTransit: 0,
                    delivered: 0
                }
            });
        }

        // Transform orders with basic information first
        const transformedOrders = orders.map(order => ({
            _id: order._id,
            trackingNumber: order.trackingNumber,
            customerId: order.customerId,
            orderType: order.orderType,
            status: order.status,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            estimatedDeliveryDate: order.estimatedDeliveryDate
        }));

        res.json({
            success: true,
            orders: transformedOrders,
            stats: {
                total: orders.length,
                pending: orders.filter(o => o.status === 'pending').length,
                inTransit: orders.filter(o => o.status === 'in_transit').length,
                delivered: orders.filter(o => o.status === 'delivered').length
            }
        });
    } catch (error) {
        console.error('Error fetching staff orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// Add this new route before module.exports
router.get('/verify/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const order = await Order.findOne({ trackingNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate status and progress
    const currentDate = new Date();
    const createdDate = new Date(order.createdAt);
    const estimatedDelivery = new Date(order.estimatedDeliveryDate);
    
    const progress = Math.min(
      ((currentDate - createdDate) / (estimatedDelivery - createdDate)) * 100,
      100
    );

    res.json({
      success: true,
      order: {
        ...order.toObject(),
        progress,
        currentStatus: order.status,
        estimatedDeliveryDate: order.estimatedDeliveryDate
      }
    });
  } catch (error) {
    console.error('Order verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying order',
      error: error.message
    });
  }
});

module.exports = router;
