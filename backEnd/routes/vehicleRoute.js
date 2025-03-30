const express = require('express');
const multer = require('multer');
const { storeVehicle, editVehicle, getVehicleId, deleteVehicle } = require('../controllers/vehicle');
const { verifyToken } = require('../controllers/authentication/token');

// Temporary storage for images
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/store-vehicle', verifyToken, upload.fields([
    { name: 'imageFront', maxCount: 1 },
    { name: 'imageEnd', maxCount: 1 },
    { name: 'imageRearRight', maxCount: 1 },
    { name: 'imageRearLeft', maxCount: 1 },
    { name: 'imagePic1', maxCount: 1 }, // optional
    { name: 'imagePic2', maxCount: 1 }  // optional
]), storeVehicle);

router.get('/get-vehicle-id/:id', verifyToken, getVehicleId);
router.put('/edit-vehicle/:id', verifyToken, editVehicle);
router.delete('/delete-vehicle/:id', verifyToken, deleteVehicle); 

module.exports = router;