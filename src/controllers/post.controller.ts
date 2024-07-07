import { Response } from "express";
import { AuthResquest } from "../middlewares/authentication.middleware";
import UserPostModel from "../models/post.model";
import { UserPost } from "../types";
import { BaseController } from "./base.controller";

class UserPostController extends BaseController<UserPost> {
  constructor() {
    super(UserPostModel);
  }

  async post(req: AuthResquest, res: Response) {
    const id = req.user._id;
    req.body.owner = id;
    super.post(req, res);
  }

  async addComment(req: AuthResquest, res: Response) {
    //post id not comment id
    const responderId = req.user._id;
    const postId = req.params.id;

    try {
      await UserPostModel.updateOne(
        { _id: postId },
        {
          $push: {
            comments: {
              responder_id: responderId,
              content: req.body.content,
              userImgUrl: req.body.userImgUrl,
              username: req.body.username,
            },
          },
        }
      );
      const commentAdded = req.body;
      res.status(201).send(commentAdded);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async putById(req: AuthResquest, res: Response) {
    const userId = req.user._id;

    try {
      const userPost = await UserPostModel.findById(req.params.id);

      if (userPost == null) {
        res.status(404).send("Post doesnt exist");
      } else if (userPost.owner != userId) {
        res.status(403).send("Cant update posts of other users");
      } else {
        super.putById(req, res);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getPostsByOwner(req: AuthResquest, res: Response) {
    try {
      if (!req.params.id) {
        res.status(404).send("User not found");
      }

      const posts: UserPost[] = await this.model.find({ owner: req.params.id });
      res.send(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async deleteById(req: AuthResquest, res: Response) {
    const userId = req.user._id;
    const post: UserPost = await UserPostModel.findById(req.params.id);

    if (post == null) {
      res.status(404).send("Post doesnt exist");
    } else if (post.owner != userId) {
      res.status(403).send("Cant delete posts of other users");
    } else {
      super.deleteById(req, res);
    }
  }
}

export default new UserPostController();
