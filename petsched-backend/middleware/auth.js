const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid token', 
      message: 'Token is not valid' 
    });
  }
};

// Role-based authorization
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      clinic_id: user.clinic_id 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      type: 'refresh' 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// User registration
const registerUser = async (userData) => {
  const { email, password, name, role = 'client', clinic_id = null } = userData;
  
  // Check if user already exists
  const existingUser = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUser.length > 0) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create user
  const userId = uuidv4();
  await db.run(
    `INSERT INTO users (id, email, password, name, role, clinic_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [userId, email, hashedPassword, name, role, clinic_id]
  );

  // Return user without password
  const user = await db.query(
    'SELECT id, email, name, role, clinic_id, created_at FROM users WHERE id = ?',
    [userId]
  );

  return user[0];
};

// User login
const loginUser = async (email, password) => {
  // Find user
  const users = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = users[0];

  // Check password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Generate tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  await db.run(
    'UPDATE users SET refresh_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [refreshToken, user.id]
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinic_id: user.clinic_id
    },
    token,
    refreshToken
  };
};

// Refresh token
const refreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Find user
    const users = await db.query(
      'SELECT * FROM users WHERE id = ? AND refresh_token = ?',
      [decoded.id, refreshToken]
    );

    if (users.length === 0) {
      throw new Error('Invalid refresh token');
    }

    const user = users[0];

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token
    await db.run(
      'UPDATE users SET refresh_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newRefreshToken, user.id]
    );

    return {
      token: newToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Logout
const logoutUser = async (userId) => {
  await db.run(
    'UPDATE users SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [userId]
  );
};

module.exports = {
  authenticateToken,
  authorizeRole,
  generateToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  registerUser,
  loginUser,
  refreshToken,
  logoutUser
}; 