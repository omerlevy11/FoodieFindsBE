import { PostComment } from "./post-comment.type";

export type UserPost = {
    content: string;
    imgUrl: string
    owner?: string;
    username: string;
    userImgUrl: string
    comments?: PostComment[];
}
