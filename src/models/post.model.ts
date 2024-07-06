import mongoose from "mongoose";
import { PostComment, UserPost } from '../types'





const PostComment = new mongoose.Schema<PostComment>({
    content: {
        type: String,
        reuired: true
    },

    responder_id: {
        type: String,
        required: true
    },
    userImgUrl: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
})


const userPostSchema = new mongoose.Schema<UserPost>({
    content: {
        type: String,
        required: true,
    },
    imgUrl: {
        type: String,
        required: false,
    },
    owner: {
        type: String,
        required: true,
    },
    comments: {
        type: [PostComment],
        required: false,
    },
    userImgUrl: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    }
});

export default mongoose.model<UserPost>("UserPost", userPostSchema);