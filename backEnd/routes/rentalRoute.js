const express = require('express');
const { createRental, getRentalById, updateRentalById, deleteRentalById } = require('../controllers/rental');
const { verifyToken } = require('../controllers/authentication/token');

const router = express.Router();

router.post('/create-rental', verifyToken, createRental);
router.get('/get-rental/:id', verifyToken, getRentalById);
router.put('/update-rental/:id', verifyToken, updateRentalById);
router.delete('/delete-rental/:id', verifyToken, deleteRentalById);

module.exports = router; 