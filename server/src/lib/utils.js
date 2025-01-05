import jwt from "jsonwebtoken";

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 *
 * @function generateToken
 * @param {string} userId - The unique identifier of the user.
 * @param {Object} res - The Express response object.
 * @returns {void}
 */

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS in a week (7 days)
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks
    secure: process.env.NODE_ENV !== "development", // cookie only works in https
  });

  return token;
};
