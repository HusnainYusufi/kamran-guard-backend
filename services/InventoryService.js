const Inventory = require("../models/Inventory.model");
const logger = require("../modules/logger");

class InventoryService {
  static async updateInventory(data) {
    try {
      const { product, vendor, quantity } = data;
      if (!product) {
        return {
          status: 400,
          message: "Product ID is required for inventory update",
        };
      }
      if (!vendor) {
        return {
          status: 400,
          message: "Vendor is required for inventory update",
        };
      }
      if (typeof quantity !== "number") {
        return {
          status: 400,
          message: "Quantity must be a number for inventory update",
        };
      }

      // Look for an existing inventory record for the product–vendor pair
      let inventoryRecord = await Inventory.findOne({ product, vendor });

      if (inventoryRecord) {
        // Update: add the new quantity to the existing quantity
        inventoryRecord.quantity += quantity;
      } else {
        // Create new inventory record with the provided quantity
        inventoryRecord = new Inventory({
          product,
          vendor,
          quantity,
        });
      }

      const savedInventory = await inventoryRecord.save();
      return {
        status: 200,
        message: "Inventory updated successfully",
        data: savedInventory,
      };
    } catch (error) {
      logger.error("Error in InventoryService - Update Inventory:", {
        message: error.message,
        stack: error.stack,
        data,
      });
      throw error;
    }
  }

  // New method to fetch all inventory records with populated details
  // New method to fetch all inventory records with populated product (with category) and vendor details
  static async getAllInventory() {
    try {
      const inventories = await Inventory.find({})
        .populate({
          path: "product",
          populate: { path: "category" }, // Populates the category field inside product
        })
        .populate("vendor");

      return {
        status: 200,
        message: "Inventory fetched successfully",
        data: inventories,
      };
    } catch (error) {
      logger.error("Error in InventoryService - Get All Inventory:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = InventoryService;
