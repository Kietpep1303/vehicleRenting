const e = require('express');
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['car', 'motorcycle'],
        required: true
    },
    images: {
        front: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        },
        rearRight: {
            type: String,
            required: true
        },
        rearLeft: {
            type: String,
            required: true
        },
        pic1: String,
        pic2: String
    },
    features: {
        engine: String,
        transmission: String,
        fuelType: String,
        color: String,
        seatingCapacity: Number,
        airConditioning: Boolean,
        gps: Boolean,
        bluetooth: Boolean
    },
    price: {
        type: Number,
        required: true
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;