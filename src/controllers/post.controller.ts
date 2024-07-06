import UserPostModel from "../models/post.model";
import { UserPost } from "../types";
import { BaseController } from "./base.controller";
import { Response } from "express";
import { AuthResquest } from "../middlewares/authentication.middleware";

class UserPostController extends BaseController<UserPost> {
    constructor() {
        super(UserPostModel)
    }

    async post(req: AuthResquest, res: Response) {
        const _id = req.user._id;
        req.body.owner = _id;
        super.post(req, res);
    }

    async addComment(req: AuthResquest, res: Response) {
        //post id not comment id 
        const responder_id = req.user._id;
        const post_id = req.params.id
        try {
            await UserPostModel.updateOne(
                { _id: post_id },
                {
                    $push: {
                        comments: {
                            responder_id: responder_id, content: req.body.content,
                            userImgUrl: req.body.userImgUrl, username: req.body.username
                        }
                    }
                }
            );
            const commentAdded = req.body
            res.status(201).send(commentAdded);
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }


    }


    async putById(req: AuthResquest, res: Response) {
        const user_id = req.user._id;
        try {

            const userPost = await UserPostModel.findById(req.params.id);
            if (userPost == null) {
                res.status(404).send("Post doesnt exist");
            }
            else if (userPost.owner != user_id) {
                res.status(403).send("Cant update posts of other users");
            }
            else {
                super.putById(req, res);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });

        }

    }

    async getPostsByOwner(req: AuthResquest, res: Response) {
        try {
            if (req.params.id) {
                const objects = await this.model.find({ owner: req.params.id });
                res.send(objects);
            } else {
                res.status(404).send("User not found");
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async deleteById(req: AuthResquest, res: Response) {
        const user_id = req.user._id;
        const userPost = await UserPostModel.findById(req.params.id);
        if (userPost == null) {
            res.status(404).send("Post doesnt exist");
        }
        else if (userPost.owner != user_id) {
            res.status(403).send("Cant delete posts of other users");
        }
        else {
            super.deleteById(req, res);
        }

    }

}

export default new UserPostController();