"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const unitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    allowedUser: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        }]
});
exports.Unit = mongoose.model('Unit', unitSchema);
