import { Request, Response } from 'express';
import { generateToken } from '../lib/utils';
import cloudinary from '../lib/cloudinary';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
}
import User from '../models/user.model';
import bcrypt from 'bcryptjs';

/**
 * Handles a user signing up.
 *
 * @function signup
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    const user = await User.findOne({ email });

    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate JWT token
      generateToken(newUser._id.toString(), res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: 'Failed to create user' });
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
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: 'User does not exist' });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // generate JWT token
    generateToken(user._id.toString(), res);

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
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
export const logout = (req: Request, res: Response): void => {
  try {
    res.cookie('jwt', '', { maxAge: 0 }); // Immediately expire the cookie
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.log('Error in logout controller: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { profilePic } = req.body;
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const userId = req.user._id;

    if (!profilePic) {
      res.status(400).json({ message: 'Profile picture is required' });
      return;
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log('Error in updateProfile controller: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkAuth = (req: AuthRequest, res: Response): void => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log('Error in checkAuth controller', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
