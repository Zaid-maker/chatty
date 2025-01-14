import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';
import User from '../models/user.model.js';
import bycrypt from 'bcryptjs';

/**
 * Handles a user signing up.
 *
 * @function signup
 * @param {ExpressRequest} req - The Express request object.
 * @param {ExpressResponse} res - The Express response object.
 */
export const signup = async (req, res) => {
  console.log('📝 New signup request received');
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      console.log(`❌ Signup failed: Email ${email} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      console.log(`✅ User created successfully: ${email}`);
      // generate JWT totken
      generateToken(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: 'Failed to create user' });
    }
  } catch (error) {
    console.log('Error in signup controller: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Handles a user logging in.
 *
 * @function login
 * @param {ExpressRequest} req - The Express request object.
 * @param {ExpressResponse} res - The Express response object.
 */
export const login = async (req, res) => {
  console.log('🔑 New login attempt');
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ Login failed: No user found with email ${email}`);
      return res.status(400).json({ message: 'User does not exist' });
    }

    const isPasswordCorrect = await bycrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      console.log(`❌ Login failed: Invalid password for ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`✅ User logged in successfully: ${email}`);
    // generate JWT token
    generateToken(user._id, res);

    res.status(200).json({
      message: 'User logged in successfully',
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log('Error in login controller: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Handles a user logging out.
 *
 * @function logout
 * @param {ExpressRequest} req - The Express request object.
 * @param {ExpressResponse} res - The Express response object.
 */

export const logout = (req, res) => {
  try {
    console.log('👋 User logout request');
    res.cookie('jwt', '', { maxAge: 0 }); // Imediately expire the cookie
    console.log('✅ User logged out successfully');
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.log('Error in logout controller: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Handles a user updating their profile picture.
 *
 * @function updateProfile
 * @param {ExpressRequest} req - The Express request object.
 * @param {ExpressResponse} res - The Express response object.
 */

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: 'Profile pic is required' });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log('error in update profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Checks if a user is authenticated by verifying the JWT token sent in the request cookies.
 * If token is invalid, not found, or user is not found, returns a 401/404 JSON response accordingly.
 * If token is valid and user is found, returns the user object as a JSON response.
 * @param {ExpressRequest} req - The Express request object.
 * @param {ExpressResponse} res - The Express response object.
 */
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log('Error in checkAuth controller', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
