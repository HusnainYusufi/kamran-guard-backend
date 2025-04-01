const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    partNumber: {          // For part identification
        type: String,
        trim: true
    },
    oemNumber: {           // OEM or original equipment manufacturer number
        type: String,
        trim: true
    },
    description: {         // Additional descriptive text
        type: String,
        trim: true
    },
    category: {            // Reference to a category
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    vendor: {              // Reference to a vendor (default or primary vendor)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
    purchasePrice: Number,
    salePrice: Number,
    boxPurchasePrice: Number,
    boxSalePrice: Number,
    boxQuantity: Number,
    effectiveDate: {       // Date from which these prices become effective
        type: Date
    },
    packagingDetails: {    // Additional packaging details (e.g., "500 ml bottle")
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

ProductSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', ProductSchema);
