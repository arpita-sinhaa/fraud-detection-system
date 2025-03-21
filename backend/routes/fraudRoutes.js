const express = require("express")
const router = express.Router()
const fraudController = require("../controllers/fraudController")
const { protect } = require("../middleware/auth")

// All fraud routes require authentication
router.use(protect)

// Fraud detection routes
router.post("/detect", fraudController.detectFraud)
router.post("/batch", fraudController.batchDetect)
router.get("/transactions", fraudController.getTransactions)
router.get("/transactions/:id", fraudController.getTransactionById)
router.get("/stats", fraudController.getStats)
router.get("/rules", fraudController.getRules)
router.post("/rules", fraudController.createRule)
router.put("/rules/:id", fraudController.updateRule)
router.delete("/rules/:id", fraudController.deleteRule)

module.exports = router

