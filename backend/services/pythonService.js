const axios = require("axios")
const logger = require("../config/logger")

// Configuration for Python services
const BATCH_API_URL = process.env.BATCH_API_URL || "http://localhost:5000"
const RULES_API_URL = process.env.RULES_API_URL || "http://localhost:5001"

// Evaluate a single transaction using the Python rules engine
exports.evaluateTransaction = async (transaction) => {
  try {
    const response = await axios.post(`${RULES_API_URL}/evaluate`, transaction, {
      timeout: 5000, // 5 second timeout
    })
    return response.data
  } catch (error) {
    logger.error(`Python rules engine error: ${error.message}`)
    throw new Error("Failed to evaluate transaction with rules engine")
  }
}

// Process a batch of transactions using the Python batch API
exports.processBatch = async (transactions) => {
  try {
    const response = await axios.post(
      `${BATCH_API_URL}/batch_predict`,
      {
        transactions,
      },
      {
        timeout: 10000, // 10 second timeout
      },
    )
    return response.data
  } catch (error) {
    logger.error(`Python batch API error: ${error.message}`)
    throw new Error("Failed to process batch with Python service")
  }
}

// Health check for Python services
exports.checkHealth = async () => {
  try {
    const results = {
      rulesEngine: false,
      batchApi: false,
    }

    try {
      await axios.get(`${RULES_API_URL}/health`, { timeout: 2000 })
      results.rulesEngine = true
    } catch (error) {
      logger.warn(`Rules engine health check failed: ${error.message}`)
    }

    try {
      await axios.get(`${BATCH_API_URL}/health`, { timeout: 2000 })
      results.batchApi = true
    } catch (error) {
      logger.warn(`Batch API health check failed: ${error.message}`)
    }

    return results
  } catch (error) {
    logger.error(`Health check error: ${error.message}`)
    return {
      rulesEngine: false,
      batchApi: false,
    }
  }
}

