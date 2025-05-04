const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const buyerModel = require("../model/buyerModel");
const buyerRoute = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new buyer
buyerRoute.post(
  "/create-user",
  upload.single("governmentIdImage"),
  async (req, res) => {
    try {
      const { name, email, password, phoneNumber, location, governmentId } =
        req.body;

      // Validate required fields
      if (
        !name ||
        !email ||
        !password ||
        !phoneNumber ||
        !location ||
        !governmentId ||
        !req.file
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Create a new buyer
      const newBuyer = new buyerModel({
        name,
        email,
        password, // Store plain password for now
        phoneNumber,
        location,
        governmentId,
        isVerified: false, // Set default verification status
        governmentIdImage: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
      });

      // Save the buyer to the database
      const savedBuyer = await newBuyer.save();
      res.status(201).json(savedBuyer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get all buyers
buyerRoute.get("/", async (req, res) => {
  try {
    const buyers = await buyerModel.find();

    // Convert image buffer to base64 for each buyer
    const buyersWithBase64 = buyers.map((buyer) => {
      const buyerObj = buyer.toObject();
      if (buyerObj.governmentIdImage && buyerObj.governmentIdImage.data) {
        buyerObj.governmentIdImage = {
          data: buyerObj.governmentIdImage.data.toString("base64"),
          contentType: buyerObj.governmentIdImage.contentType,
        };
      } else {
        buyerObj.governmentIdImage = null;
      }
      return buyerObj;
    });

    res.status(200).json(buyersWithBase64);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a buyer by ID
buyerRoute.get("/get-user/:id", async (req, res) => {
  try {
    const buyer = await buyerModel
      .findById(req.params.id)
      .select("+isVerified");

    // Check if buyer exists
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // Convert image buffer to base64
    const buyerObj = buyer.toObject();
    if (buyerObj.governmentIdImage && buyerObj.governmentIdImage.data) {
      buyerObj.governmentIdImage = {
        data: buyerObj.governmentIdImage.data.toString("base64"),
        contentType: buyerObj.governmentIdImage.contentType,
      };
    } else {
      buyerObj.governmentIdImage = null;
    }

    res.status(200).json({
      ...buyerObj,
      isVerified: buyerObj.isVerified || false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login for buyers
buyerRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the buyer by email and password
    const buyer = await buyerModel
      .findOne({ email, password })
      .select("+isVerified");

    if (buyer) {
      res.status(200).json({
        message: "Login successful",
        userId: buyer._id, // Send userId in the response
        isVerified: buyer.isVerified || false,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add verification status endpoint
buyerRoute.get("/verification-status/:id", async (req, res) => {
  try {
    const buyer = await buyerModel
      .findById(req.params.id)
      .select("+isVerified");
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }
    res.status(200).json({
      isVerified: buyer.isVerified || false,
      message: buyer.isVerified
        ? "Your account is verified"
        : "Your account is pending verification",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update password endpoint
buyerRoute.post("/update-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const buyer = await buyerModel.findById(userId);
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // Compare current password directly since it's stored as plain text
    if (currentPassword !== buyer.password) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password (still as plain text for now)
    buyer.password = newPassword;
    await buyer.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = buyerRoute;
