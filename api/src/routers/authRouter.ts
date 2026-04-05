import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken, CustomRequest } from "../middleware/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login); // Saya tambahkan rute loginnya sekalian karena di atas sudah di-import

export default authRouter;
