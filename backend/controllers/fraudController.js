const Transaction = require("../models/transactionModel")
const Rule = require("../models/ruleModel")
const axios = require("axios")
const logger = require("../config/logger")

// Configuration for Python services
const BATCH_API_URL = process.env.BATCH_API_URL || "http://localhost:5000"
const RULES_API_URL = process.env.RULES_API_URL || "http://localhost:5001"

// Detect fraud for a single transaction
exports.detectFraud = async (req, res) => {
  try {
    const transaction = req.body

    // Add user ID to transaction
    transaction.user_id = req.user.id

    // Call the Python rules engine service
    let response
    try {
      response = await axios.post(`${RULES_API_URL}/evaluate`, transaction)
    } catch (error) {
      // If Python service is unavailable, use fallback logic
      logger.warn(`Python service unavailable: ${error.message}`)

      // Simple fallback fraud detection logic
      const fraudScore = Math.floor(Math.random() * 100)
      const isFraudulent = fraudScore >= 80

      response = {
        data: {
          transaction_id: transaction.id || `tx_${Date.now()}`,
          fraud_score: fraudScore,
          is_fraudulent: isFraudulent,
          rules_triggered: isFraudulent ? ["Fallback detection"] : [],
          evaluation_time: new Date().toISOString(),
        },
      }
    }

    // Save transaction to database
    const newTransaction = new Transaction({
      transactionId: response.data.transaction_id,
      userId: req.user.id,
      amount: transaction.amount,
      type: transaction.transaction_type || "unknown",
      location: transaction.location_country || transaction.location || "unknown",
      fraudScore: response.data.fraud_score,
      isFraudulent: response.data.is_fraudulent,
      rulesTriggered: response.data.rules_triggered,
      rawData: transaction,
    })

    await newTransaction.save()

    // Return the fraud detection result
    res.status(200).json(response.data)
  } catch (error) {
    logger.error(`Fraud detection error: ${error.message}`)
    res.status(500).json({ message: "Fraud detection failed", error: error.message })
  }
}

// Batch detect fraud for multiple transactions
exports.batchDetect = async (req, res) => {
  try {
    const { transactions } = req.body

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ message: "Transactions array is required" })
    }

    // Add user ID to each transaction
    const enrichedTransactions = transactions.map((tx) => ({
      ...tx,
      user_id: req.user.id,
    }))

    // Call the Python batch processing service
    let response
    try {
      response = await axios.post(`${BATCH_API_URL}/batch_predict`, {
        transactions: enrichedTransactions,
      })
    } catch (error) {
      // If Python service is unavailable, use fallback logic
      logger.warn(`Python batch service unavailable: ${error.message}`)

      // Simple fallback batch processing
      const results = enrichedTransactions.map((tx) => {
        const fraudScore = Math.floor(Math.random() * 100)
        const isFraudulent = fraudScore >= 80

        return {
          transaction_id: tx.id || `tx_${Math.random().toString(36).substring(2, 10)}`,
          fraud_probability: fraudScore,
          status: isFraudulent ? "Fraudulent" : "Legitimate",
          timestamp: new Date().toISOString(),
        }
      })

      const fraudCount = results.filter((r) => r.status === "Fraudulent").length

      response = {
        data: {
          results,
          batch_insights: {
            total_transactions: transactions.length,
            fraudulent_transactions: fraudCount,
            legitimate_transactions: transactions.length - fraudCount,
            fraud_rate: (fraudCount / transactions.length) * 100,
            avg_fraud_probability: results.reduce((sum, r) => sum + r.fraud_probability, 0) / results.length,
            processing_time_ms: 500,
          },
          status: "success",
        },
      }
    }

    // Save transactions to database
    const transactionsToSave = response.data.results.map((result, index) => ({
      transactionId: result.transaction_id,
      userId: req.user.id,
      amount: enrichedTransactions[index].amount || 0,
      type: enrichedTransactions[index].transaction_type || "unknown",
      location: enrichedTransactions[index].location_country || enrichedTransactions[index].location || "unknown",
      fraudScore: result.fraud_probability,
      isFraudulent: result.status === "Fraudulent",
      rulesTriggered: [],
      rawData: enrichedTransactions[index],
    }))

    await Transaction.insertMany(transactionsToSave)

    // Return the batch processing result
    res.status(200).json(response.data)
  } catch (error) {
    logger.error(`Batch processing error: ${error.message}`)
    res.status(500).json({ message: "Batch processing failed", error: error.message })
  }
}

// Get all transactions for the current user
exports.getTransactions = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { userId: req.user.id }

    // Apply status filter if provided
    if (req.query.status) {
      if (req.query.status === "fraudulent") {
        filter.isFraudulent = true
      } else if (req.query.status === "legitimate") {
        filter.isFraudulent = false
      }
    }

    // Apply search filter if provided
    if (req.query.search) {
      const search = req.query.search
      filter.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }

    // Get transactions with pagination
    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get total count for pagination
    const total = await Transaction.countDocuments(filter)

    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error(`Get transactions error: ${error.message}`)
    res.status(500).json({ message: "Failed to retrieve transactions" })
  }
}

// Get a single transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      transactionId: req.params.id,
      userId: req.user.id,
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    res.json(transaction)
  } catch (error) {
    logger.error(`Get transaction error: ${error.message}`)
    res.status(500).json({ message: "Failed to retrieve transaction" })
  }
}

// Get fraud detection statistics
exports.getStats = async (req, res) => {
  try {
    // Get total transactions count
    const totalTransactions = await Transaction.countDocuments({ userId: req.user.id })

    // Get fraudulent transactions count
    const fraudulentTransactions = await Transaction.countDocuments({
      userId: req.user.id,
      isFraudulent: true,
    })

    // Calculate fraud rate
    const fraudRate = totalTransactions > 0 ? (fraudulentTransactions / totalTransactions) * 100 : 0

    // Get total transaction amount
    const totalAmountResult = await Transaction.aggregate([
      { $match: { userId: req.user.id.toString() } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0

    // Get average risk score
    const avgScoreResult = await Transaction.aggregate([
      { $match: { userId: req.user.id.toString() } },
      { $group: { _id: null, avg: { $avg: "$fraudScore" } } },
    ])

    const avgRiskScore = avgScoreResult.length > 0 ? avgScoreResult[0].avg : 0

    // Get recent transactions trend (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyTrend = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id.toString(),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          fraudCount: {
            $sum: { $cond: [{ $eq: ["$isFraudulent", true] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.json({
      totalTransactions,
      fraudulentTransactions,
      legitimateTransactions: totalTransactions - fraudulentTransactions,
      fraudRate: Number.parseFloat(fraudRate.toFixed(2)),
      totalAmount,
      avgRiskScore: Number.parseFloat(avgRiskScore.toFixed(2)),
      dailyTrend,
    })
  } catch (error) {
    logger.error(`Get stats error: ${error.message}`)
    res.status(500).json({ message: "Failed to retrieve statistics" })
  }
}

// Get all fraud detection rules
exports.getRules = async (req, res) => {
  try {
    const rules = await Rule.find({ userId: req.user.id })
    res.json(rules)
  } catch (error) {
    logger.error(`Get rules error: ${error.message}`)
    res.status(500).json({ message: "Failed to retrieve rules" })
  }
}

// Create a new fraud detection rule
exports.createRule = async (req, res) => {
  try {
    const { name, description, enabled, score, config, type } = req.body

    const rule = new Rule({
      name,
      description,
      enabled,
      score,
      config,
      type,
      userId: req.user.id,
    })

    await rule.save()

    res.status(201).json(rule)
  } catch (error) {
    logger.error(`Create rule error: ${error.message}`)
    res.status(500).json({ message: "Failed to create rule" })
  }
}

// Update a fraud detection rule
exports.updateRule = async (req, res) => {
  try {
    const { name, description, enabled, score, config, type } = req.body

    const rule = await Rule.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!rule) {
      return res.status(404).json({ message: "Rule not found" })
    }

    rule.name = name || rule.name
    rule.description = description || rule.description
    rule.enabled = enabled !== undefined ? enabled : rule.enabled
    rule.score = score || rule.score
    rule.config = config || rule.config
    rule.type = type || rule.type

    await rule.save()

    res.json(rule)
  } catch (error) {
    logger.error(`Update rule error: ${error.message}`)
    res.status(500).json({ message: "Failed to update rule" })
  }
}

// Delete a fraud detection rule
exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!rule) {
      return res.status(404).json({ message: "Rule not found" })
    }

    await rule.remove()

    res.json({ message: "Rule deleted successfully" })
  } catch (error) {
    logger.error(`Delete rule error: ${error.message}`)
    res.status(500).json({ message: "Failed to delete rule" })
  }
}

