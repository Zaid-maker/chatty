import User from '../models/user.model.js';

/**
 * Protects a route by verifying the JWT token sent in the request cookies.
 * If token is invalid, not found, or user is not found, returns a 401/404 JSON response accordingly.
 * If token is valid and user is found, assigns the user object to req.user and calls next() to continue the middleware chain.
 * @param {ExpressRequest} req - The Express request object.
 * @param {ExpressResponse} res - The Express response object.
 * @param {Function} next - The next middleware function to call.
 */
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No Token Provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log('Error in protectRoute middleware: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
