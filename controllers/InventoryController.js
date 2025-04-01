const express = require("express");
const router = express.Router();
const InventoryService = require("../services/InventoryService");
const logger = require("../modules/logger");

// Although inventory is updated automatically when a product is added,
// you may still want endpoints to update inventory based on later transactions.
router.post("/update", async (req, res, next) => {
  try {
    const result = await InventoryService.updateInventory(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    logger.error("Error in InventoryController - Update Inventory:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    next(error);
  }
});

// Route to get all inventory records
// Route to get all inventory records
router.get("/all", async (req, res, next) => {
  try {
    const result = await InventoryService.getAllInventory();
    return res.status(result.status).json(result);
  } catch (error) {
    logger.error("Error in InventoryController - Get All Inventory:", {
      message: error.message,
      stack: error.stack,
      ipAddress: req.ip || req.connection.remoteAddress,
    });
    next(error);
  }
});

module.exports = router;
