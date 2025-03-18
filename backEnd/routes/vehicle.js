const express = require('express');

const { storeVehicle } = require('../controllers/vehicle/storeVehicle');
const { listVehicles, getVehicleById } = require('../controllers/vehicle/getVehicle');
const { updateVehicleById } = require('../controllers/vehicle/updateVehicle'); 
const { deleteVehicleById } = require('../controllers/vehicle/deleteVehicle'); 

const router = express.Router();

router.post('/store-vehicle', storeVehicle);
router.get('/:id', getVehicleById);
router.get('/', listVehicles);
router.put('/:id', updateVehicleById); 
router.delete('/:id', deleteVehicleById);

module.exports = router;