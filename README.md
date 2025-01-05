# Chatty 💬

A real-time chat app built with React, Vite, and Socket.io

## ✨ Features

- 🚀 Real-time messaging using Socket.io
- 🔐 User authentication and authorization
- 👤 Profile customization
- 🟢 Online/offline user status
- 📜 Message history
- 📱 Responsive design

## 🛠️ Technology Stack

- 🎨 Frontend:
  - React + Vite
  - TailwindCSS
  - Daisy UI
- 🖥️ Backend:
  - Node.js + Express
  - Bun runtime
- ⚡ Real-time:
  - Socket.io
- 🗄️ Database:
  - MongoDB
- 🔑 Authentication:
  - JWT

## 📥 Installation

### 📋 Prerequisites

- Install Bun: `curl -fsSL https://bun.sh/install | bash`

### 🔧 Backend Setup

1. Navigate to server directory:
```shell
cd server
```

2. Install dependencies:
```shell
bun install
```

3. Set up environment variables:
```shell
cp .env.example .env
```

4. Update .env with your values:
```
MONGODB_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development

# Cloudinary Config (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Start the server:
```shell
bun run dev
```

### 🎨 Frontend Setup

1. Navigate to client directory:
```shell
cd client
```

2. Install dependencies:
```shell
bun install
```

3. Start the development server:
```shell
bun run dev
```

## 📚 API Documentation

### 🔐 Authentication Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/update-profile` - Update user profile
- `GET /api/auth/check` - Check authentication status

### 💬 Message Routes
- `POST /api/messages/send/:id` - Send message to user
- `GET /api/messages/:id` - Get chat history

### 👥 User Routes
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user

### 🔍 System Routes
- `GET /api/health` - Check system health

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License
