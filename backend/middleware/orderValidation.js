const PACKAGE_PRICING = {
  domestic: {
    basic_letter: { base: 50, maxWeight: 0.1 },
    standard_parcel: { base: 150, maxWeight: 1 },
    express_parcel: { base: 300, maxWeight: 5 },
    premium_parcel: { base: 600, maxWeight: 10 },
    bulk_shipment: { base: 1200, maxWeight: 20 }
  },
  international: {
    basic_intl: { base: 250, maxWeight: 0.1 },
    standard_intl: { base: 800, maxWeight: 1 },
    express_intl: { base: 2000, maxWeight: 5 },
    premium_intl: { base: 4000, maxWeight: 10 },
    bulk_intl: { base: 9000, maxWeight: 20 }
  }
};

const validatePackageDetails = (req, res, next) => {
  try {
    const { packageType, weight, dimensions, customsDeclaration } = req.body;
    
    // Check if package type exists
    const orderType = packageType.includes('_intl') ? 'international' : 'domestic';
    const pricing = PACKAGE_PRICING[orderType]?.[packageType];

    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package type'
      });
    }

    // Validate weight
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid weight value'
      });
    }

    if (weightNum > pricing.maxWeight) {
      return res.status(400).json({
        success: false,
        message: `Maximum weight for ${packageType} is ${pricing.maxWeight}kg`
      });
    }

    // Calculate pricing
    const basePrice = pricing.base;
    const weightCharge = weightNum * (orderType === 'international' ? 300 : 80);
    const volume = dimensions ? (dimensions.length * dimensions.width * dimensions.height) / 5000 : 0;
    const volumeCharge = volume * (orderType === 'international' ? 400 : 100);
    const insuranceCharge = customsDeclaration ? customsDeclaration.value * 0.01 : 0;
    const internationalCharge = orderType === 'international' ? basePrice * 0.15 : 0;
    const totalAmount = Number((basePrice + weightCharge + volumeCharge + insuranceCharge + internationalCharge).toFixed(2));

    // Add validated values and calculated prices to request
    req.packagePricing = {
      ...pricing,
      calculatedCosts: {
        basePrice,
        weightCharge,
        volumeCharge,
        insuranceCharge,
        internationalCharge,
        total: totalAmount
      }
    };
    req.orderType = orderType;
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid package details',
      error: error.message
    });
  }
};

module.exports = {
  validatePackageDetails,
  PACKAGE_PRICING
};