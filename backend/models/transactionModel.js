const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  fraudScore: {
    type: Number,
    required: true,
  },
  isFraudulent: {
    type: Boolean,
    default: false,
  },
  rulesTriggered: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["Legitimate", "Fraudulent", "Under Review"],
    default: function () {
      if (this.isFraudulent) return "Fraudulent"
      if (this.fraudScore > 50 && this.fraudScore < 80) return "Under Review"
      return "Legitimate"
    },
  },
  rawData: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 })
transactionSchema.index({ transactionId: 1 })

module.exports = mongoose.model("Transaction", transactionSchema)

