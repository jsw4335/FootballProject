import { Router } from "express";
import { signup, login, getMyProfile, updateMyProfile, } from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/auth";
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, getMyProfile);
router.patch("/me", authMiddleware, updateMyProfile);

export default router;
