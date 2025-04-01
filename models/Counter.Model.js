const mongoose = require('mongoose');

try {
    'use strict';

    const CounterSchema  = new mongoose.Schema({
        _id: { type: String, required: true },
        sequence_value: { type: Number, default: 1 },

        createdAt : {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    });

    CounterSchema.pre('save', function (next) {
        this.updatedAt = Date.now();
        next();
    })

    const Counter = mongoose.model('Counter', CounterSchema );

    module.exports = Counter;

} catch (error) {
    console.error('Error creating the User schema:', error);
}
