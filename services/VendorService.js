const Vendor = require("../models/Vendor.model");
const logger = require("../modules/logger");

class VendorService {
  static async addVendor(data) {
    try {
      // Create a new Vendor using the provided data
      const vendor = new Vendor(data);
      const savedVendor = await vendor.save();
      return {
        status: 201,
        message: "Vendor added successfully",
        data: savedVendor,
      };
    } catch (error) {
      logger.error("Error in VendorService - Add Vendor:", {
        message: error.message,
        stack: error.stack,
        data,
      });
      throw error;
    }
  }

  static async getAllVendors() {
    try {
      const vendors = await Vendor.find({}).exec();
      return {
        status: 200,
        message: "Vendors fetched successfully",
        data: vendors,
      };
    } catch (error) {
      logger.error("Error in VendorService - Get All Vendors:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  static async bulkAddVendors(vendorDataArray) {
    try {
      let savedVendors = [];

      // Loop over each vendor object
      for (const data of vendorDataArray) {
        const vendor = new Vendor(data);
        const savedVendor = await vendor.save();
        savedVendors.push(savedVendor);
      }

      return {
        status: 201,
        message: "Vendors added successfully",
        data: savedVendors,
      };
    } catch (error) {
      logger.error("Error in VendorService - Bulk Add Vendors:", {
        message: error.message,
        stack: error.stack,
        vendorDataArray,
      });
      throw error;
    }
  }
}

module.exports = VendorService;
