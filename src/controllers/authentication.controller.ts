import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import UserModel from "../models/user.model";
import { User } from "../types";
const client = new OAuth2Client();
const googleSignIn = async (req: Request, res: Response) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (email != null) {
      let user = await UserModel.findOne({ email: email });

      if (user == null) {
        user = await UserModel.create({
          username: email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          email: email,
          password: "0",
          imgUrl: payload?.picture,
        });
      }

      const tokens = await generateTokens(user);
      return res.status(200).send({
        email: user.email,
        _id: user._id,
        imgUrl: user.imgUrl,
        username: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        ...tokens,
      });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

const register = async (req: Request, res: Response) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const imgUrl = req.body.imgUrl;

  if (!email || !password || !username || !firstName || !lastName) {
    return res.status(400).send("One required argument missing");
  }

  try {
    const rs = await UserModel.findOne({ $or: [{ email }, { username }] });

    if (rs != null) {
      return res.status(409).send("Email or username already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    const rs2 = await UserModel.create({
      email,
      username,
      password: encryptedPassword,
      firstName,
      lastName,
      imgUrl,
    });

    const tokens = await generateTokens(rs2);
    res.status(201).send({
      email: rs2.email,
      username: rs2.username,
      firstName: rs2.firstName,
      lastName: rs2.lastName,
      _id: rs2._id,
      imgUrl: rs2.imgUrl,
      ...tokens,
    });
  } catch (err) {
    return res.status(400).send("Error missing email or password or username");
  }
};

const generateTokens = async (user: Document & User) => {
  const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET
  );

  if (user.refreshTokens == null) {
    user.refreshTokens = [refreshToken];
  } else {
    user.refreshTokens.push(refreshToken);
  }

  await user.save();

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const login = async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).send("Missing username or password");
  }
  try {
    const user = await UserModel.findOne({ username });

    if (user == null) {
      return res.status(401).send("Username or password incorrect");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).send("Username or password incorrect");
    }

    const tokens = await generateTokens(user);
    return res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    return res.status(400).send("Error missing email or password");
  }
};

const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (refreshToken == null) return res.sendStatus(401);

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, user: { _id: string }) => {
      console.log(err);
      if (err) return res.sendStatus(401);

      try {
        const userDb = await UserModel.findOne({ _id: user._id });

        if (
          !userDb.refreshTokens ||
          !userDb.refreshTokens.includes(refreshToken)
        ) {
          userDb.refreshTokens = [];
          await userDb.save();
          return res.sendStatus(401);
        } else {
          userDb.refreshTokens = userDb.refreshTokens.filter(
            (t) => t !== refreshToken
          );
          await userDb.save();
          return res.status(200).send("Logout succeeded");
        }
      } catch (err) {
        res.sendStatus(401).send(err.message);
      }
    }
  );
};

const refresh = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (refreshToken == null) return res.sendStatus(401);

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, user: { _id: string }) => {
      if (err) {
        console.log(err);
        return res.status(401).send("Refresh token invalid");
      }
      try {
        const userDb = await UserModel.findOne({ _id: user._id });

        if (
          !userDb.refreshTokens ||
          !userDb.refreshTokens.includes(refreshToken)
        ) {
          userDb.refreshTokens = [];
          await userDb.save();
          return res.status(401).send("Refresh token invalid");
        }
        const accessToken = jwt.sign(
          { _id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRATION }
        );
        const newRefreshToken = jwt.sign(
          { _id: user._id },
          process.env.JWT_REFRESH_SECRET
        );
        userDb.refreshTokens = userDb.refreshTokens.filter(
          (t) => t !== refreshToken
        );
        userDb.refreshTokens.push(newRefreshToken);
        await userDb.save();
        return res.status(200).send({
          accessToken: accessToken,
          refreshToken: newRefreshToken,
        });
      } catch (err) {
        res.sendStatus(401).send(err.message);
      }
    }
  );
};

export default {
  googleSignIn,
  register,
  login,
  logout,
  refresh,
};
