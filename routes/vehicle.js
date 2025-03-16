const express = require('express');

const { storeVehicle } = require('../controllers/vehicle/storeVehicle');
const { listVehicles, getVehicleById } = require('../controllers/vehicle/getVehicle');

const router = express.Router();

router.post('/store-vehicle', storeVehicle);
router.get('/:id', getVehicleById);
router.get('/', listVehicles);

module.exports = router;