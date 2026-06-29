// ===== server/controllers/authController.js =====
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all required fields: name, email, password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await UserModel.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    // Create JWT
    const jwtSecret = process.env.JWT_SECRET || 'supersecretkey123';
    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email },
      jwtSecret,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        budgets: newUser.budgets || {},
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password' });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    // Create JWT
    const jwtSecret = process.env.JWT_SECRET || 'supersecretkey123';
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      jwtSecret,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        budgets: user.budgets || {},
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
}
