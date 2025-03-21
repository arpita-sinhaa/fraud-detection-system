const { spawn } = require("child_process")
const path = require("path")
const logger = require("../config/logger")

// Path to Python scripts
const BATCH_API_PATH = path.join(__dirname, "../../python/batch_fraud_detection_api.py")
const RULES_ENGINE_PATH = path.join(__dirname, "../../python/advanced_fraud_rules.py")

// Start the batch API service
const startBatchApi = () => {
  logger.info("Starting Python Batch API service...")

  const batchApi = spawn("python", [BATCH_API_PATH])

  batchApi.stdout.on("data", (data) => {
    logger.info(`Batch API: ${data}`)
  })

  batchApi.stderr.on("data", (data) => {
    logger.error(`Batch API Error: ${data}`)
  })

  batchApi.on("close", (code) => {
    logger.warn(`Batch API process exited with code ${code}`)

    // Restart the service if it crashes
    if (code !== 0) {
      logger.info("Restarting Batch API service...")
      setTimeout(startBatchApi, 5000)
    }
  })

  return batchApi
}

// Start the rules engine service
const startRulesEngine = () => {
  logger.info("Starting Python Rules Engine service...")

  const rulesEngine = spawn("python", [RULES_ENGINE_PATH])

  rulesEngine.stdout.on("data", (data) => {
    logger.info(`Rules Engine: ${data}`)
  })

  rulesEngine.stderr.on("data", (data) => {
    logger.error(`Rules Engine Error: ${data}`)
  })

  rulesEngine.on("close", (code) => {
    logger.warn(`Rules Engine process exited with code ${code}`)

    // Restart the service if it crashes
    if (code !== 0) {
      logger.info("Restarting Rules Engine service...")
      setTimeout(startRulesEngine, 5000)
    }
  })

  return rulesEngine
}

// Start both services
const startPythonServices = () => {
  const batchApi = startBatchApi()
  const rulesEngine = startRulesEngine()

  // Handle process termination
  process.on("SIGINT", () => {
    logger.info("Stopping Python services...")
    batchApi.kill()
    rulesEngine.kill()
    process.exit()
  })
}

// Export the function
module.exports = startPythonServices

// If this script is run directly, start the services
if (require.main === module) {
  startPythonServices()
}

