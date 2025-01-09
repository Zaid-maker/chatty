import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    /**
     * Checks if a user is authenticated by sending a GET request to the /auth/check route.
     * If the user is authenticated, sets the authUser state to the user object from the response
     * and calls the connectSocket function to connect to the socket.io server.
     * If the user is not authenticated, sets the authUser state to null.
     * Finally, sets the isCheckingAuth state to false.
     * @function
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
     * Signs up a user by sending a POST request to the /auth/signup route with the
     * provided data. If the data is valid, sets the authUser state to the user object
     * from the response and calls the connectSocket function to connect to the
     * socket.io server. If the data is invalid, sets the authUser state to null.
     * @function signUp
     * @memberof useAuthStore
     * @instance
     * @param {Object} data - The user's data, containing a fullName, email, and password.
     * @returns {Promise<void>} A promise that resolves when the user has been signed up.
     */
    signup: async (data) => {
        set({ isSigningUp: true }); 
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            
        } finally {
            set({ isSigningUp: false });
        }
    },

    /**
     * Logs the user in by sending a POST request to the /auth/login route with the
     * provided credentials. If the credentials are valid, sets the authUser state to the
     * user object from the response and calls the connectSocket function to connect
     * to the socket.io server. If the credentials are invalid, sets the authUser state
     * to null.
     * @function logIn
     * @memberof useAuthStore
     * @instance
     * @param {Object} data - The user's credentials, containing a username and password.
     * @returns {Promise<void>} A promise that resolves when the user has been logged in.
     */
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            
        } finally {
            set({ isLoggingIn: false });
        }
    },

    /**
     * Logs the user out of the application by sending a request to the
     * server to destroy the user's session.
     *
     * @function logOut
     * @memberof useAuthStore
     * @instance
     * @returns {Promise<void>} A promise that resolves when the user has been logged out.
     */
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
        } catch (error) {

        }
    },

    /**
     * Updates the user's profile by sending a request to the server to
     * update the user's profile.
     *
     * @function updateProfile
     * @memberof useAuthStore
     * @instance
     * @param {Object} data The data to update the user's profile with.
     * @returns {Promise<void>} A promise that resolves when the user's profile has been updated.
     */
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
        } catch (error) {
            
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    /**
     * Connects to the socket.io server and sets up the socket event listeners.
     * Listens for the "getOnlineUsers" event and updates the onlineUsers state
     * when a new list of online user IDs is received.
     * @function
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
     * Disconnects from the socket.io server.
     * @function
     */
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }
}));