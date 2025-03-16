const express = require('express');

const { storeVehicle } = require('../controllers/vehicle/storeVehicle');

const router = express.Router();

router.post('/store-vehicle', storeVehicle);

module.exports = router;