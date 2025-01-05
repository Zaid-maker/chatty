# Chatty

A real-time chat app built with React, Vite, and Socket.io

## Backend

- login route (POST): `/api/auth/login` ✔
- signup route (POST): `/api/auth/signup` ✔
- logout route (POST): `/api/auth/logout` ✔
- update profile route (PUT): `/api/auth/update-profile` ✔
- check auth route (GET): `/api/auth/check` ✔

- send message route (POST): `/api/messages/send/:id` ✔

- get users route (GET): `/api/users` ✔
- get user route (GET): `/api/users/:id` ✔

- get health status route (GET): `/api/health` ✔

## Backend Env Setup

Copy the .env.example file and rename it to .env, then update the values with your own.

Use this command to create the .env file:

```shell
cd server
cp .env.example .env
```
