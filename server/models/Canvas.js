const mongoose = require("mongoose");

const canvasSchema = new mongoose.Schema({
  name: { type: String, default: "shared-canvas" },
  data: { type: [[String]], required: true }, 
});

module.exports = mongoose.model("Canvas", canvasSchema);
