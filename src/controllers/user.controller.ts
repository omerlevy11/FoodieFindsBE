import UserModel from "../models/user.model";
import { BaseController } from "./base.controller";
import { Request, Response } from "express";
import { AuthResquest } from "../middlewares/authentication.middleware";
import bcrypt from "bcrypt";
import { User } from '../types';

class UserController extends BaseController<User> {
    constructor() {
        super(UserModel)
    }

    async putById(req: AuthResquest, res: Response) {
        let checkUserConflict;
        if (req.body.username || req.body.email) {
            checkUserConflict = await UserModel.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });
        }
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        if (req.user._id != req.params.id) {
            res.status(403).send("Cant update other users");
        }
        else if (checkUserConflict != null && checkUserConflict.id != req.user._id) {
            res.status(409).send("Email or username already exists");
        }
        else {
            super.putById(req, res);
        }

    }
    async getByToken(req: AuthResquest, res: Response) {
        req.params.id = req.user._id;
        super.getById(req, res);
    }


    //using contains and not match 
    async getUserByName(req: Request, res: Response) {

        //splits the first space from the string incase someone has last name with spaces
        const [first_name, last_name] = req.params.fullName.replace(/\s+/, '\x01').split('\x01');
        let users = [];
        if (!last_name) {
            users = await UserModel.find({ firstName: { $regex: first_name, $options: 'i' } });
        }
        else {
            users = await UserModel.find({
                $and: [{
                    firstName: { $regex: first_name, $options: 'i' }
                }, {
                    lastName: { $regex: last_name, $options: 'i' }
                }]
            });
        }
        if (!users) {
            res.status(404).send("Couldnt find by name and last name");
        }
        else {
            res.status(200).send(users);
        }
    }
    async getAllUsers(req: AuthResquest, res: Response) {
        try {
            const users = await UserModel.find({ _id: { $ne: req.params.id } }).select([
                "email",
                "username",
                "imgUrl",
                "_id",
            ]);
            return res.json(users);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async deleteById(req: AuthResquest, res: Response) {
        req.params.id = req.user["_id"];
        super.deleteById(req, res);
    }


}


export default new UserController