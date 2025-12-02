import { Router } from "express";
import { createTeamController,getTeamsController,getTeamDetailController,
    joinTeamController  } from "../controllers/teams.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/", authMiddleware, createTeamController);
router.get("/", getTeamsController);
router.get("/:teamId", getTeamDetailController);
router.post("/:teamId/join", authMiddleware, joinTeamController);

export default router;