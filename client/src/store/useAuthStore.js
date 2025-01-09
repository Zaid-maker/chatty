import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  /**
   * Checks if the user is authenticated by making a GET request to /auth/check.
   * If the user is authenticated, stores the user data in state and connects the socket.
   * If the user is not authenticated, sets the user data to null and disconnects the socket.
   * Sets isCheckingAuth to false when the operation is complete.
   */
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  /**
   * Signs up a user and logs them in. If the operation is successful, sets the user data in state and connects the socket.
   * If the operation fails, displays an error message using toast.
   * Sets isSigningUp to true until the operation is complete.
   * @param {Object} data - The data to send in the request body.
   * @param {string} data.fullName - The user's full name.
   * @param {string} data.email - The user's email address.
   * @param {string} data.password - The user's password.
   */
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  /**
   * Logs a user in. If the operation is successful, sets the user data in state and connects the socket.
   * If the operation fails, displays an error message using toast.
   * Sets isLoggingIn to true until the operation is complete.
   * @param {Object} data - The data to send in the request body.
   * @param {string} data.email - The user's email address.
   * @param {string} data.password - The user's password.
   */
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  /**
   * Logs a user out by making a POST request to /auth/logout.
   * If the operation is successful, clears the user data from state and disconnects the socket.
   * If the operation fails, displays an error message using toast.
   */

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  /**
   * Updates the user's profile with the provided data by making a PUT request to /auth/update-profile.
   * If the operation is successful, updates the user data in state and displays a success message.
   * If the operation fails, logs the error and displays an error message using toast.
   * Sets isUpdatingProfile to true until the operation is complete.
   * @param {Object} data - The data to send in the request body.
   */

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  /**
   * Connects the socket to the server by making a connection to the WebSocket endpoint
   * at /socket.io. If the user is not authenticated or the socket is already connected,
   * does nothing.
   * Sets the socket instance in state and listens for the "getOnlineUsers" event.
   * When the event is received, updates the onlineUsers state with the received array
   * of user IDs.
   */
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  /**
   * Disconnects the socket connection if it is currently connected.
   * This method checks the current socket state and performs the disconnect operation.
   */

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
