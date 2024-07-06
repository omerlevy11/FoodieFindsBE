import { Request, Response } from "express";
import { Model } from "mongoose";

export class BaseController<ModelType>{

    model: Model<ModelType>
    constructor(model: Model<ModelType>) {
        this.model = model;
    }

    async getAll(req: Request, res: Response) {
        console.log("getAll");
        try {
            if (req.query.name) {
                const objects = await this.model.find({ name: req.query.name });
                res.send(objects);
            } else {
                const users = await this.model.find();
                res.send(users);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getById(req: Request, res: Response) {
        console.log("getById:" + req.params.id);
        try {
            const obj = await this.model.findById(req.params.id);
            res.send(obj);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async post(req: Request, res: Response) {
        console.log("post:" + req.body);
        try {
            const obj = await this.model.create(req.body);
            res.status(201).send(obj);
        } catch (err) {
            console.log(err);
            res.status(500).send("error: " + err.message);
        }
    }
    async putById(req: Request, res: Response) {
        const filter = { _id: req.params.id };
        console.log("put by id: " +req.params.id);
        try {
            const updatedObj = await this.model.findOneAndUpdate(filter,req.body,{
                new : true
            });
            if(!updatedObj)
            {
                res.status(404).send("Not found, update failed");
            }
            else
            {
                 res.status(200).send(updatedObj);
            }
        }
        catch (err){
            console.log(err);
            res.status(500).send("Error: " + err.message);
        }
    }

    async deleteById(req: Request, res: Response) {
        console.log("Delete by id: " +req.params.id);
        try{
           const deletedCount = await this.model.deleteOne({_id: req.params.id});
           if(deletedCount["deletedCount"] == 0 )
           {
            res.status(404).send("Id not found, delete failed");
           }
           else
           {
            res.status(200).send("Deleted successfully");
           }
        }
        catch(err){
            console.log(err);
            res.status(500).send("Error: "+ err.message);
        }
    }


}

const createController = <ModelType>(model: Model<ModelType>) => {
    return new BaseController<ModelType>(model);
}

export default createController;