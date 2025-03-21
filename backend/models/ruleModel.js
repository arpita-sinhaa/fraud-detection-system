const mongoose = require("mongoose")

const ruleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  type: {
    type: String,
    enum: ["velocity", "geo", "amount", "time", "category", "device", "custom"],
    default: "custom",
  },
  config: {
    type: Object,
    default: {},
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Rule", ruleSchema)

