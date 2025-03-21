const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const logger = require("../config/logger")

// Protect routes - Authentication middleware
exports.protect = async (req, res, next) => {
  try {
    let token

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" })
      }

      // Add user to request object
      req.user = user
      next()
    } catch (error) {
      logger.error(`Token verification error: ${error.message}`)
      return res.status(401).json({ message: "Not authorized, token failed" })
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`)
    res.status(500).json({ message: "Server error" })
  }
}

// Admin only middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as an admin" })
  }
}

