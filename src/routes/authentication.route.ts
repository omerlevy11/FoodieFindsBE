import express from "express";
import authController from "../controllers/authentication.controller";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: The access token for accessing protected resources.
 *         refreshToken:
 *           type: string
 *           description: The refresh token for obtaining new access tokens.
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
 *     UserLogin:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The user username
 *         password:
 *           type: string
 *           description: The user password
 *       example:
 *         username: 'username123'
 *         password: '123456'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     userRegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           description: The user username
 *         password:
 *           type: string
 *           description: The user password
 *         email:
 *           type: string
 *           description: The user email
 *         firstName:
 *           type: string
 *           description: The user first name
 *         lastName:
 *           type: string
 *           description: The user last name
 *       example:
 *         username: 'username123'
 *         password: '123456'
 *         email : bob@gmail.com
 *         firstName: Bob
 *         lastName: Jhonson
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     userRegisterResponse:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           description: The user username
 *         email:
 *           type: string
 *           description: The user email
 *         firstName:
 *           type: string
 *           description: The user first name
 *         lastName:
 *           type: string
 *           description: The user last name
 *       example:
 *         username: 'username123'
 *         email : bob@gmail.com
 *         firstName: Bob
 *         lastName: Jhonson
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userRegisterRequest'
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/userRegisterResponse'
 *       400:
 *         description: Bad Request - Invalid request body or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Invalid request body or missing required fields"
 *       409:
 *         description: Conflict - The resource already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Conflict - One of the values already exist within other user"
 */
router.post("/register", authController.register);
router.post("/google", authController.googleSignIn);

/**
 * @swagger
 * components:
 *   schemas:
 *     Tokens:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: The JWT access token
 *         refreshToken:
 *           type: string
 *           description: The JWT refresh token
 *       example:
 *         accessToken: '123cd123x1xx1'
 *         refreshToken: '134r2134cr1x3c'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: The acess & refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Missing username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Missing username or password"
 *       401:
 *         description: Username or password incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Username or password incorrect"
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout a user
 *     tags: [Auth]
 *     description: need to provide the refresh token in the auth header
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Logout succeeded"
 *       401:
 *         description: Unauthorized - Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Invalid token"
 */
router.get("/logout", authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh the access token after expired
 *     tags: [Auth]
 *     description: Need to provide the refresh token in the auth header
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success, returns new tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Unauthorized - Refresh token invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Refresh token invalid"
 */
router.get("/refresh", authController.refresh);

export default router;
