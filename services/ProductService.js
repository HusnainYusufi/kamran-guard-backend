const Product = require("../models/Product.model");
const InventoryService = require("./InventoryService");
const logger = require("../modules/logger");

class ProductService {
  static async addProduct(data) {
    try {
      // Destructure fields from data. Note: initialQuantity is used for inventory update
      const {
        initialQuantity, // optional initial inventory quantity
        name,
        partNumber,
        oemNumber,
        description,
        category,
        vendor,
        purchasePrice,
        salePrice,
        boxPurchasePrice,
        boxSalePrice,
        boxQuantity,
        effectiveDate,
        packagingDetails,
      } = data;

      if (!name) {
        return { status: 400, message: "Product name is required" };
      }
      if (!vendor) {
        return {
          status: 400,
          message: "Vendor is required for product creation",
        };
      }

      // Create and save the product record
      const product = new Product({
        name,
        partNumber,
        oemNumber,
        description,
        category,
        vendor,
        purchasePrice,
        salePrice,
        boxPurchasePrice,
        boxSalePrice,
        boxQuantity,
        effectiveDate,
        packagingDetails,
      });

      const savedProduct = await product.save();

      // Determine initial inventory quantity (default to 0 if not provided)
      const inventoryQty =
        typeof initialQuantity === "number" ? initialQuantity : 0;

      // Automatically update or create the inventory record for this product–vendor pair
      await InventoryService.updateInventory({
        product: savedProduct._id,
        vendor, // from the product data
        quantity: inventoryQty,
      });

      return {
        status: 201,
        message: "Product added and inventory updated successfully",
        data: savedProduct,
      };
    } catch (error) {
      logger.error("Error in ProductService - Add Product:", {
        message: error.message,
        stack: error.stack,
        data,
      });
      throw error;
    }
  }

  // New method to get all products
  static async getAllProducts() {
    try {
      // Fetch products and populate vendor and category references
      const products = await Product.find({})
        .populate("vendor")
        .populate("category");

      return {
        status: 200,
        message: "Products fetched successfully",
        data: products,
      };
    } catch (error) {
      logger.error("Error in ProductService - Get All Products:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = ProductService;
