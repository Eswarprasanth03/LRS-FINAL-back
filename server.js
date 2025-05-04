const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const sellerRouter = require('./routes/sellerRouter');
const buyerRouter = require('./routes/buyerRouter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/sellerRouter', sellerRouter);
app.use('/buyerRouter', buyerRouter);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/land_registry', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 