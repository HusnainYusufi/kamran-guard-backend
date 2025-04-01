const express = require('express');
const router = express.Router();
const VendorService = require('../services/VendorService');
const logger = require('../modules/logger'); 

// Route to add a new vendor
router.post('/add', async (req, res, next) => {
    try {
        // If it's an array, handle bulk insertion
        if (Array.isArray(req.body)) {
            const result = await VendorService.bulkAddVendors(req.body);
            return res.status(result.status).json(result);
        } else {
            // Otherwise, assume it's a single vendor
            const result = await VendorService.addVendor(req.body);
            return res.status(result.status).json(result);
        }
    } catch (error) {
        logger.error('Error in VendorController - Add Vendor:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        next(error);
    }
});


// Route to fetch all vendors
router.get('/all', async (req, res, next) => {
    try {
        const result = await VendorService.getAllVendors();
        return res.status(result.status).json(result);
    } catch (error) {
        logger.error('Error in VendorController - Get All Vendors:', {
            message: error.message,
            stack: error.stack
        });
        next(error);
    }
});



module.exports = router;
