const Vehicle = require('../../models/vehicle');

exports.storeVehicle = async (req, res) => {
    try {
        const { name, vehicleType, images, features, price } = req.body;
        const newVehicle = new Vehicle({ name, vehicleType, images, features, price });
        await newVehicle.save();
        res.status(201).json({ message: 'Vehicle stored successfully', vehicle: newVehicle });
    } catch (error) {
        res.status(500).json({ message: 'Error storing vehicle', error });
    }
};
