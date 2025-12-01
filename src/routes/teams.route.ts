import { Router } from "express";
import { createTeamController } from "../controllers/teams.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/", authMiddleware, createTeamController);

export default router;