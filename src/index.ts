import env from "dotenv";
env.config();
import express, { Express } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import authRoute from "./routes/authentication.route";
import fileRoute from "./routes/file.route";
import userRoute from "./routes/user.route";
import userPostRoute from "./routes/posts.route"


const initApp = (): Promise<Express> => {
    const promise = new Promise<Express>((resolve) => {
        const db = mongoose.connection;
        db.once("open", () => console.log("Connected to Database"));
        db.on("error", (error) => console.error(error));
        const url = process.env.DB_URL;
        mongoose.connect(url!).then(() => {
            const app = express();
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use((req, res, next) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Methods", "*");
                res.header("Access-Control-Allow-Headers", "*");
                res.header("Access-Control-Allow-Credentials", "true");
                next();
            })
            app.use("/user", userRoute);
            app.use("/userPost", userPostRoute)
            app.use("/auth", authRoute);
            app.use("/public", express.static("public"));
            app.use("/file", fileRoute);
            resolve(app);
        });
    });
    return promise;
};

export default initApp;