import { Express } from "express";
import request from "supertest";
import initApp from "../";
import mongoose from "mongoose";
import UserPostModel from "../models/post.model";
import UserModel from "../models/user.model";
import { User, UserPost, PostComment } from "../types";
let app: Express;
const user: User = {
  email: "test@student.post.test",
  password: "1234567890",
  firstName: "name",
  lastName: "lastname",
  username: "username"
}
const post1: UserPost = {
  username: "string",
  imgUrl: "string",
  userImgUrl: "string",
  content: "string"
};

const comment: PostComment = {
  username: "username123test",
  userImgUrl: "url/url",
  content: "post content"
}
let accessToken: string = "";
let tempPost;

beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await UserPostModel.deleteMany();

  await UserModel.deleteMany({ 'email': user.email });
  const response = await request(app).post("/auth/register").send(user);
  user._id = response.body._id;
  const response2 = await request(app).post("/auth/login").send(user);
  accessToken = response2.body.accessToken;
  tempPost = await request(app).post("/userPost").set("Authorization", "JWT " + accessToken).send(post1);
});

afterAll(async () => {
  UserPostModel.deleteMany();
  await mongoose.connection.close();
});


describe("User post tests", () => {
  const addStudentPost = async (post: UserPost) => {
    const response = await request(app)
      .post("/userPost")
      .set("Authorization", "JWT " + accessToken)
      .send(post);
    expect(response.statusCode).toBe(201);
    expect(response.body.owner).toBe(user._id);
  };

  test("Test Post Student post", async () => {
    addStudentPost(post1);
  });

  test("Test get all User posts in DB", async () => {
    const response = await request(app).get("/userPost").set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
  });

  test("Test get post by id", async () => {
    const response = await request(app).get(`/userPost/${tempPost.body._id}`).set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.owner).toBe(user._id);
  });

  test("Test get post by id", async () => {
    const response = await request(app).get(`/userPost/${tempPost.body._id}`).set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.owner).toBe(user._id);
  });

  test("Test get all post by owner id", async () => {
    const response = await request(app).get(`/userPost/user/allPosts/${user._id}`).set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body[0].owner).toBe(user._id);
  });

  test("Test delete post by id", async () => {
    const postToDelete = await request(app).post("/userPost").set("Authorization", "JWT " + accessToken).send(post1);
    const response = await request(app).delete(`/userPost/${postToDelete.body._id}`).set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
  });

  test("Test create post", async () => {
    const response = (await request(app).post(`/userPost/`).send(post1).set("Authorization", "JWT " + accessToken));
    expect(response.statusCode).toBe(201);
    expect(response.body.imgUrl).toBe(post1.imgUrl);
    expect(response.body.userImgUrl).toBe(post1.userImgUrl);
    expect(response.body.username).toBe(post1.username);
    expect(response.body.content).toBe(post1.content);
    expect(response.body.owner).toBe(user._id);
  });

  test("Test update post", async () => {
    const tempCreatedPost = (await request(app).post(`/userPost/`).send(post1).set("Authorization", "JWT " + accessToken));
    const updatedContent = { content: "changed" };
    const updatedPostResponse = (await request(app).put(`/userPost/${tempCreatedPost.body._id}`).send(updatedContent).set("Authorization", "JWT " + accessToken));
    expect(updatedPostResponse.statusCode).toBe(200);
    expect(updatedPostResponse.body.content).toBe(updatedContent.content);

  });
  test("Test add comment to post", async () => {

    const tempCreatedPost = (await request(app).put(`/userPost/addComment/${tempPost.body._id}`).send(comment).set("Authorization", "JWT " + accessToken));
    expect(tempCreatedPost.statusCode).toBe(201);
  });
});