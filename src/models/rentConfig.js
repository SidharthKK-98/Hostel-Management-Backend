const mongoose = require("mongoose");

const rentConfig = new mongoose.Schema({
  rent: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Rent", rentConfig);