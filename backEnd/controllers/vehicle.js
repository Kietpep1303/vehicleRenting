const Vehicle = require('../models/vehicle');
const { errorHandler } = require('../utils/errorHandler');
const cloudinary = require('../utils/cloudinary');

// Validate vehicle data
function validateVehicleData(vehicleType, images) {
    const validTypes = ['car', 'motorcycle'];
    if (!validTypes.includes(vehicleType)) {
        return 'Invalid vehicle type';
    }
    if (!images.imageFront || !images.imageEnd || !images.imageRearRight || !images.imageRearLeft) {
        return 'Missing one or more required images information';
    }
    return null;
}

// Upload the images to Cloudinary
const uploadImage = async (fileField) => {
    if (req.files[fileField] && req.files[fileField][0]) {
        const file = req.files[fileField][0];
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url;
    }
    return null;
};

// Utility function to check user permissions
function hasPermission(userEmail, vehicleOwnerEmail) {
    return userEmail === vehicleOwnerEmail;
}

// Store a new vehicle
exports.storeVehicle = async (req, res) => {
    try {
        const { accountOwner, title, vehicleType, features, price } = req.body;

        // Validate vehicle data
        const validationError = validateVehicleData(vehicleType, images);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // Upload images to Cloudinary
        const uploadedImages = {
            imageFront: await uploadImage('imageFront'),
            imageEnd: await uploadImage('imageEnd'),
            imageRearRight: await uploadImage('imageRearRight'),
            imageRearLeft: await uploadImage('imageRearLeft'),
            imagePic1: req.files.imagePic1 ? await uploadImage('imagePic1') : null,
            imagePic2: req.files.imagePic2 ? await uploadImage('imagePic2') : null,
        };

        // Create and store the vehicle
        const vehicle = new Vehicle(accountOwner, title, vehicleType, uploadedImages, features, price);
        const storedVehicle = await vehicle.createVehicle();

        res.status(201).json({
            message: 'Vehicle stored successfully',
            data: storedVehicle,
        });
    } catch (error) {
        return errorHandler(res, error, 'Error storing vehicle');
    }
};

// Edit an existing vehicle
exports.editVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicleType, images, features, price } = req.body;

        // Fetch the vehicle
        const vehicle = await Vehicle.getVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Check user permissions
        if (!hasPermission(req.user.email, vehicle.accountOwner)) {
            return res.status(403).json({ message: 'You are not authorized to edit this vehicle' });
        }

        // Validate vehicle data
        const validationError = validateVehicleData(vehicleType, images);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // Update the vehicle
        const updatedVehicle = await Vehicle.updateVehicleById(id, vehicleType, images, features, price);
        res.status(200).json({
            message: 'Vehicle updated successfully',
            data: updatedVehicle,
        });
    } catch (error) {
        return errorHandler(res, error, 'Error updating vehicle');
    }
};

// Get vehicle by ID
exports.getVehicleId = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the vehicle
        const vehicle = await Vehicle.getVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.status(200).json({
            message: 'Vehicle fetched successfully',
            data: vehicle,
        });
    } catch (error) {
        return errorHandler(res, error, 'Error fetching vehicle');
    }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch the vehicle
        const vehicle = await Vehicle.getVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Check user permissions
        if (!hasPermission(req.user.email, vehicle.accountOwner)) {
            return res.status(403).json({ message: 'You are not authorized to delete this vehicle' });
        }

        // Delete the vehicle
        const deletedVehicle = await Vehicle.deleteVehicleById(id);
        if (!deletedVehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.status(200).json({
            message: 'Vehicle deleted successfully',
            data: deletedVehicle,
        });
    } catch (error) {
        return errorHandler(res, error, 'Error deleting vehicle');
    }
};