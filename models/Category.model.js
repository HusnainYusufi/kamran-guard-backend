const mongoose = require('mongoose');

try {
    'use strict';

    const CategorySchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            minlength: 3,
            maxlength: 30
        },
        createdAt : {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    });

    CategorySchema.pre('save', function (next) {
        this.updatedAt = Date.now();
        next();
    })

    const Category = mongoose.model('Category', CategorySchema);

    module.exports = Category;

} catch (error) {
    console.error('Error creating the User schema:', error);
}
