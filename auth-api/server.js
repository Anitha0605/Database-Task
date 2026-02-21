const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import User AFTER mongoose.connect
let User;
mongoose.connect('mongodb://localhost:27017/authdb')
  .then(async () => {
    console.log(' MongoDB Connected');
    const userModel = require('./models/User');
    User = userModel;
  })
  .catch(err => {
    console.log(' MongoDB Error:', err.message);
  });

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend 100% working!' });
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log(' Register data:', req.body);
    
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    console.log(' New user created:', username);

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(' Register Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(`Test`);
});
