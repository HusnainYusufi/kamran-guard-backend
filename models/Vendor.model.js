const mongoose = require('mongoose');

try {
    'use strict';

    const VendorSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
        },
        phoneNumber: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        image: {
            type: String,
            trim: true
        },
        description: {
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

    VendorSchema.pre('save', function(next) {
        this.updatedAt = Date.now();
        next();
    });

    const Vendor = mongoose.model('Vendor', VendorSchema);

    module.exports = Vendor;

} catch (error) {
    console.error('Error creating the Vendor schema:', error);
}
