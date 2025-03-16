const Vehicle = require('../../models/vehicle');

// Error handler
const handleError = (res, error, message = 'Server error') => {
    console.error(message, error);
    res.status(500).json({ message, error });
  };

// List all vehicles
exports.listVehicles = async (req, res) => {
    try {
        const { type, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
        const query = {};
        if (type) query.vehicleType = type;
        if (minPrice) query.price = { $gte: minPrice };
        if (maxPrice) query.price = { ...query.price, $lte: maxPrice };

        const vehicles = await Vehicle.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.status(200).json(vehicles);
    } catch (error) {
        handleError(res, error, 'Error listing vehicles');
    }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        handleError(res, error, 'Error getting vehicle by ID');
    }
};
