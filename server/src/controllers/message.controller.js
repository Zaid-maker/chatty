import User from '../models/user.model';
import Message from '../models/message.model';

import cloudinary from '../lib/cloudinary';

/**
 * Gets a list of all users except the currently logged in user.
 *
 * @function getUsersForSidebar
 * @param {ExpressRequest} req - The Express request object.
 * @param {ExpressResponse} res - The Express response object.
 * @returns {Promise<void>} A promise that resolves when the list of users has been sent as a JSON response.
 * @throws {Error} An error if there is a problem while retrieving the list of users.
 */
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error('Error in getUsersForSidebar: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Retrieves the chat history for the user with the given ID.
 *
 * @function getMessages
 * @param {ExpressRequest} req - The Express request object.
 * @param {ExpressResponse} res - The Express response object.
 * @returns {Promise<void>} A promise that resolves when the list of messages has been sent as a JSON response.
 * @throws {Error} An error if there is a problem while retrieving the list of messages.
 */
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Handles a user sending a message to another user.
 *
 * @function sendMessage
 * @param {ExpressRequest} req - The Express request object.
 * @param {ExpressResponse} res - The Express response object.
 * @returns {Promise<void>} A promise that resolves when the message has been sent as a JSON response.
 * @throws {Error} An error if there is a problem while sending the message.
 */
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // TODO: Add socket.io code

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('Error in sendMessage: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
