const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const logger = require("../config/logger")

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed in the model's pre-save hook
      companyName,
      role: "user",
    })

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
    })
  } catch (error) {
    logger.error(`Registration error: ${error.message}`)
    res.status(500).json({ message: "Server error" })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
    })
  } catch (error) {
    logger.error(`Login error: ${error.message}`)
    res.status(500).json({ message: "Server error" })
  }
}

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
    })
  } catch (error) {
    logger.error(`Get user error: ${error.message}`)
    res.status(500).json({ message: "Server error" })
  }
}

// Logout user (client-side only in this implementation)
exports.logout = (req, res) => {
  res.json({ message: "Logged out successfully" })
}

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: "Token is required" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user exists
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate new token
    const newToken = generateToken(user._id)

    res.json({ token: newToken })
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`)
    res.status(401).json({ message: "Invalid or expired token" })
  }
}

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex")

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    // Set expire time (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000

    await user.save()

    // In a real app, you would send an email with the reset token
    // For demo purposes, we'll just return it
    res.json({
      message: "Password reset token generated",
      resetToken,
    })
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`)
    res.status(500).json({ message: "Server error" })
  }
}

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    // Hash token
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user by token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    // Set new password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    // Generate new token
    const newToken = generateToken(user._id)

    res.json({
      message: "Password reset successful",
      token: newToken,
    })
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`)
    res.status(500).json({ message: "Server error" })
  }
}

