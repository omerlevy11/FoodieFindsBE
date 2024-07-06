import request from "supertest";
import initApp from "../";
import mongoose from "mongoose";
import { Express } from "express";
import UserModel from "../models/user.model";
import { User } from "../types";

let app: Express;
let accessToken: string;
let user_id
const user: User = {
  "username": "username123",
  "password": "123456",
  "email": "bob@gmail.com",
  "firstName": "Bob",
  "lastName": "Jhonson"
}


beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
});
beforeEach(async () => {
  console.log("beforeach");
  UserModel.deleteMany({ 'email': user.email });
  await request(app).post("/auth/register").send(user);
  const response = await request(app).post("/auth/login").send(user);
  accessToken = response.body.accessToken;
  user_id = (await request(app).get("/user").set("Authorization", "JWT " + accessToken)).body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});


describe("User tests", () => {
  test("Test get user with token", async () => {
    const response = await request(app).get("/user").set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(user_id);
  });

  test("Test get user by id", async () => {
    const response = await request(app).get(`/user/${user_id}`).set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(user_id);
  });


  test("Test PUT /user/:id", async () => {
    const updatedUser = { ...user, firstName: 'updatedbob' };
    const response = await request(app)
      .put(`/user/${user_id}`).set("Authorization", "JWT " + accessToken)
      .send(updatedUser);
    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(updatedUser.firstName);
  });

  test("Test get all users", async () => {
    const response = await request(app).get(`/user/allUsers/${user_id}`).set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Test filter user by first name and last name", async () => {
    const response = await request(app).get(`/user/filter/B`).set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
  });


  test("Test DELETE /user/:id", async () => {
    const response = await request(app).delete(`/user`).set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
  });
});