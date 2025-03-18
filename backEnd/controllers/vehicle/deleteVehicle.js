const Vehicle = require('../../models/vehicle');

// Error handler
const handleError = (res, error, message = 'Server error') => {
    console.error(message, error);
    res.status(500).json({ message, error });
};

// Delete vehicle by ID
exports.deleteVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVehicle = await Vehicle.findByIdAndDelete(id);
        if (!deletedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json({ message: 'Vehicle deleted successfully', vehicle: deletedVehicle });
    } catch (error) {
        handleError(res, error, 'Error deleting vehicle');
    }
};