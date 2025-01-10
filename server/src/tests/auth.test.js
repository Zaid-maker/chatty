import { describe, expect, it, beforeAll, afterAll } from "bun:test"
import { app } from "../server.js"
import { default as request } from "supertest"
import mongoose from "mongoose"

describe("Auth endpoints", () => {
  let server

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/chatty_test")
    server = app.listen(0) // Random port
  })

  afterAll(async () => {
    // Cleanup
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    server.close()
  })

  it("should return 401 for invalid login", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "wrongpassword",
      })

    expect(response.status).toBe(401)
  })
})
