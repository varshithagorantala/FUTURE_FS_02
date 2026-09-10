const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    source: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["New", "Contacted", "Converted"],
        default: "New"
    },

    notes: {
        type: String,
        default: ""
    },

    followUp: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("Lead", leadSchema);