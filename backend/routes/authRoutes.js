const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { protect } = require("../middleware/auth")

// Auth routes
router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/me", protect, authController.getMe)
router.post("/logout", authController.logout)
router.post("/refresh-token", authController.refreshToken)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password", authController.resetPassword)

module.exports = router

