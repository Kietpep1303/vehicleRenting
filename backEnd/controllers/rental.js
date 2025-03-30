const Rental = require('../models/rental');
const Vehicle = require('../models/vehicle');

const{ errorHandler } = require('../utils/errorHandler');

// Create a new rental
exports.createRental = async (req, res) => {
    try {
        const rentedBy = req.user.email; 
        const { vehicleId, startDate, endDate } = req.body;

        const rental = new Rental(vehicleId, rentedBy, startDate, endDate);
        
        // Check start and end date validity
        if (typeof rental === 'string') {
            return res.status(400).json({ message: rental });
        }
        // Create a new rental
        const newRental = await rental.createRental();
        if (typeof newRental === 'string') {
            return res.status(400).json({ message: newRental });
        }
        
        res.status(201).json({ message: 'Rental created successfully', newRental });
    } catch (error) {
        return errorHandler(res, error, 'Error creating rental');
    }
};

// Get rental by ID
exports.getRentalById = async (req, res) => {
    try {
        const { id } = req.params;
        const rental = await Rental.getRentalById(id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        res.status(200).json({ message: 'Rental fetched successfully', rental });
    } catch (error) {
        return errorHandler(res, error, 'Error fetching rental');
    }
};

// Update rental by ID
exports.updateRentalById = async (req, res) => {
    try {
        const { id } = req.params;
        const rentedBy = req.user.email;
        const { vehicleId, startDate, endDate } = req.body;

        // Check if the rental exists
        const existingRental = await Rental.getRentalById(id);
        if (!existingRental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Check user permissions
        if (existingRental.rentedBy !== req.user.email) {
            return res.status(403).json({ message: 'You are not authorized to edit this rental' });
        }

        const rental = new Rental(vehicleId, rentedBy, startDate, endDate);
        


        if (!updatedRental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        res.status(200).json({ message: 'Rental updated successfully', updatedRental });
    } catch (error) {
        return errorHandler(res, error, 'Error updating rental');
    }
};

// Delete rental by ID
exports.deleteRentalById = async (req, res) => {
    try {
        const { id } = req.params;

         // Check if the rental exists
         const existingRental = await Rental.getRentalById(id);
         if (!existingRental) {
             return res.status(404).json({ message: 'Rental not found' });
         }
 
         // Check user permissions
         if (existingRental.rented_by !== req.user.email) {
             return res.status(403).json({ message: 'You are not authorized to delete this rental' });
         }

        const deletedRental = await Rental.deleteRentalById(id);

        if (!deletedRental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        res.status(200).json({ message: 'Rental deleted successfully', deletedRental });
    } catch (error) {
        return errorHandler(res, error, 'Error deleting rental');
    }
};