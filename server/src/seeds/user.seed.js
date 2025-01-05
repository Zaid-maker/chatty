import { config } from 'dotenv'
import { connectDB } from '../lib/db'
import User from '../models/user.model'

// Load environment variables from a .env file into process.env
config()

// Array of user objects to seed the database with
const seedUsers = [
    // Female users
    {
        email: "emma.thompson@example.com",
        fullName: "Emma Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
        email: "olivia.thompson@example.com",
        fullName: "Olivia Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
        email: "ava.thompson@example.com",
        fullName: "Ava Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
        email: "isabella.thompson@example.com",
        fullName: "Isabella Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    {
        email: "emily.thompson@example.com",
        fullName: "Emily Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
    },
    // Male users
    {
        email: "james.thompson@example.com",
        fullName: "James Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
        email: "jake.thompson@example.com",
        fullName: "Jake Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
        email: "john.thompson@example.com",
        fullName: "John Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
        email: "mike.thompson@example.com",
        fullName: "Mike Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    {
        email: "matt.thompson@example.com",
        fullName: "Matt Thompson",
        password: "123456",
        profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
    },
]

/**
 * Seeds the database with the given seedUsers array.
 *
 * @function seedDatabase
 * @returns {Promise<void>} A promise that resolves when the database has been seeded successfully.
 * @throws {Error} An error if there is a problem while seeding the database.
 */
const seedDatabase = async () => {
    try {
        await connectDB()

        await User.insertMany(seedUsers)

        console.log('🌱 Database has been seeded successfully')
    } catch (error) {
        console.error('❌ Error while seeding database:', error)
    }
}

// Call the seedDatabase function to seed the database
seedDatabase()