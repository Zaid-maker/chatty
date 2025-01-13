import { config } from 'dotenv';
import { connectDB, disconnectDB } from '../lib/db';
import User from '../models/user.model';

// Load environment variables from a .env file into process.env
config();

// Array of user objects to seed the database with
const seedUsers = [
  // Female Users
  {
    email: 'emma.thompson@example.com',
    fullName: 'Emma Thompson',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    email: 'olivia.miller@example.com',
    fullName: 'Olivia Miller',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    email: 'sophia.davis@example.com',
    fullName: 'Sophia Davis',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
  {
    email: 'ava.wilson@example.com',
    fullName: 'Ava Wilson',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    email: 'isabella.brown@example.com',
    fullName: 'Isabella Brown',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    email: 'mia.johnson@example.com',
    fullName: 'Mia Johnson',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
  {
    email: 'charlotte.williams@example.com',
    fullName: 'Charlotte Williams',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/women/7.jpg',
  },
  {
    email: 'amelia.garcia@example.com',
    fullName: 'Amelia Garcia',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/women/8.jpg',
  },

  // Male Users
  {
    email: 'james.anderson@example.com',
    fullName: 'James Anderson',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    email: 'william.clark@example.com',
    fullName: 'William Clark',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    email: 'benjamin.taylor@example.com',
    fullName: 'Benjamin Taylor',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    email: 'lucas.moore@example.com',
    fullName: 'Lucas Moore',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    email: 'henry.jackson@example.com',
    fullName: 'Henry Jackson',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
  {
    email: 'alexander.martin@example.com',
    fullName: 'Alexander Martin',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/men/6.jpg',
  },
  {
    email: 'daniel.rodriguez@example.com',
    fullName: 'Daniel Rodriguez',
    password: '123456',
    profilePic: 'https://randomuser.me/api/portraits/men/7.jpg',
  },
];

/**
 * Clears all existing data in the database.
 *
 * @function clearDatabase
 * @returns {Promise<void>} A promise that resolves when the database has been cleared successfully.
 * @throws {Error} An error if there is a problem while clearing the database.
 */
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

/**
 * Seeds the database with the given seedUsers array.
 *
 * @function seedDatabase
 * @returns {Promise<void>} A promise that resolves when the database has been seeded successfully.
 * @throws {Error} An error if there is a problem while seeding the database.
 */
const seedDatabase = async () => {
  try {
    // Check if we're in production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ Cannot seed the database in production');
    }

    console.log('🔌 Connecting to database...');
    await connectDB();

    // Clear existing data if --clear flag is passed
    if (process.argv.includes('--clear')) {
      await clearDatabase();
    }

    console.log('🌱 Seeding database...');
    const insertedUsers = await User.insertMany(seedUsers);

    console.log(`🌱 Database has been successfully seeded with ${insertedUsers.length} users`);
  } catch (error) {
    console.error('❌ Error while seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    console.log('🔌 Disconnecting from database...');
  }
};

// Run seeder if this file is run directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

// Call the seedDatabase function to seed the database
export { seedDatabase };
