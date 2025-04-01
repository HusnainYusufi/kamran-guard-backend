const express = require('express');
const router = express.Router();
const ProductService = require('../services/ProductService');
const logger = require('../modules/logger');

// Single product add route (kept for backward compatibility)
router.post('/add', async (req, res, next) => {
    try {
        const result = await ProductService.addProduct(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        logger.error('Error in ProductController - Add Product:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        next(error);
    }
});

// Bulk add route for multiple products
router.post('/bulkAdd', async (req, res, next) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ status: 400, message: "Expected an array of products" });
        }
        const products = [];
        // Process each product sequentially (you could also use Promise.all for parallel processing)
        for (const productData of req.body) {
            const result = await ProductService.addProduct(productData);
            products.push(result.data);
        }
        return res.status(201).json({ status: 201, message: "Products added successfully", data: products });
    } catch (error) {
        logger.error('Error in ProductController - Bulk Add Products:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        next(error);
    }
});
// Route to get all products with vendor and category populated
router.get('/', async (req, res, next) => {
    try {
      const result = await ProductService.getAllProducts();
      return res.status(result.status).json(result);
    } catch (error) {
      logger.error('Error in ProductController - Get All Products:', {
        message: error.message,
        stack: error.stack
      });
      next(error);
    }
  });
module.exports = router;
