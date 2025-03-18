const Vehicle = require('../../models/vehicle');

// Error handler
const handleError = (res, error, message = 'Server error') => {
    console.error(message, error);
    res.status(500).json({ message, error });
};

// Update vehicle by ID
exports.updateVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
    } catch (error) {
        handleError(res, error, 'Error updating vehicle');
    }
};