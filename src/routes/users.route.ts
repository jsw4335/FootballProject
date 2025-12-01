import { Router } from "express";
import { signup, login, getMyProfile, updateMyProfile, } from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/auth"; // auth import 추가
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
//마이페이지
router.get("/me", authMiddleware, getMyProfile);
router.patch("/me", authMiddleware, updateMyProfile);

export default router;
