import express from "express";
import userPostController from "../controllers/post.controller";
import authMiddleware from "../middlewares/authentication.middleware";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UserPost
 *   description: The User Post Api
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     userPost:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           description: The post text
 *         imgUrl:
 *           type: string
 *           description: Posts image url
 *         userImgUrl:
 *           type: string
 *           description: The user image url
 *         username:
 *           type: string
 *           description: The post owner username
 *       example:
 *         username: 'username123'
 *         imgUrl: 'url/url'
 *         userImgUrl: 'url/url'
 *         content: 'post content'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           description: The post text
 *         userImgUrl:
 *           type: string
 *           description: The user image url
 *         username:
 *           type: string
 *           description: The post owner username
 *       example:
 *         username: 'username123'
 *         userImgUrl: 'url/url'
 *         content: 'post content'
 */

/**
 * @swagger
 * /userPost:
 *   get:
 *     tags: [UserPost]
 *     summary: Get all posts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/userPost'
 *       401:
 *         description: Unauthorized - Invalid token or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Invalid token or token expired"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Internal server error
 */
router.get(
  "/",
  authMiddleware,
  userPostController.getAll.bind(userPostController)
);

/**
 * @swagger
 * /userPost/{id}:
 *   get:
 *     tags: [UserPost]
 *     summary: Get post by its id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the post to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The new user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/userPost'
 *       401:
 *         description: Unauthorized - Invalid token or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Invalid token or token expired"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Internal server error
 */
router.get(
  "/:id",
  authMiddleware,
  userPostController.getById.bind(userPostController)
);

/**
 * @swagger
 * /userPost:
 *   post:
 *     summary: Create post
 *     tags: [UserPost]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userPost'
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/userPost'
 *       401:
 *         description: Unauthorized - Invalid token or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Invalid token or token expired"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal server error"
 */
router.post(
  "/",
  authMiddleware,
  userPostController.post.bind(userPostController)
);

/**
 * @swagger
 * /userPost/user/allPosts/{id}:
 *   get:
 *     tags: [UserPost]
 *     summary: Get all posts of a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/userPost'
 *       401:
 *         description: Unauthorized - Invalid token or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Invalid token or token expired"
 *       404:
 *         description: Post doesnt exist
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Post doesnt exist"
 */
router.get(
  "/user/allPosts/:id",
  authMiddleware,
  userPostController.getPostsByOwner.bind(userPostController)
);

/**
 * @swagger
 * /userPost/{id}:
 *   put:
 *     summary: Update user post by ID
 *     tags: [UserPost]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userPost'
 *     responses:
 *       200:
 *         description: Success. User post updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/userPost'
 *       401:
 *         description: Unauthorized - Invalid token or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Invalid token or token expired"
 *       403:
 *         description: Cant update other users posts
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Cant update other users posts"
 *       404:
 *         description: Post doesnt exist
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Post doesnt exist"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal server error"
 */
router.put(
  "/:id",
  authMiddleware,
  userPostController.putById.bind(userPostController)
);

/**
 * @swagger
 * /userPost/addComment/{id}:
 *   put:
 *     summary: Add comment to post
 *     tags: [UserPost]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Success. Comment added.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized - Invalid token or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Invalid token or token expired"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal server error"
 */
router.put(
  "/addComment/:id",
  authMiddleware,
  userPostController.addComment.bind(userPostController)
);

/**
 * @swagger
 * /userPost/{id}:
 *   delete:
 *     summary: Delete user post
 *     tags: [UserPost]
 *     description: Delete own user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: Deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid token or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Invalid token or token expired"
 *       403:
 *         description: Cant update other users posts
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Cant update other users posts"
 *       404:
 *         description: Id not found, delete failed
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Id not found, delete failed"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal server error"
 */
router.delete(
  "/:id",
  authMiddleware,
  userPostController.deleteById.bind(userPostController)
);

export default router;
