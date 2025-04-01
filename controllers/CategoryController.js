const express = require('express');
const router = express.Router();
const CategoryService = require('../services/CategoryService');
const logger = require('../modules/logger'); 

// Bulk add route for categories
router.post('/bulkAdd', async (req, res, next) => {
    try {
      // req.body should be an array of category objects, e.g. [{ name: "AIR FILTER" }, ...]
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ status: 400, message: "Expected an array of categories" });
      }
      let results = [];
      for (const cat of req.body) {
        // Assume CategoryService.addCategory returns an object with status and message
        const result = await CategoryService.addCategory(cat);
        results.push(result);
      }
      return res.status(200).json({ status: 200, message: "Categories uploaded successfully", data: results });
    } catch (error) {
      logger.error('Error in CategoryController - Bulk Add Category:', {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
      next(error);
    }
  });
  

// Route to fetch all categories
router.get('/all', async (req, res, next) => {
    try {
        const result = await CategoryService.getAllCategories();
        return res.status(result.status).json(result);
    } catch (error) {
        logger.error('Error in CategoryController - Get All Categories:', {
            message: error.message,
            stack: error.stack
        });
        next(error);
    }
});

module.exports = router;
