import { Request, Response } from "express";
import * as teamsService from "../services/teams.service";

export const createTeamController = async (req: Request, res: Response) => {
    const teamData = req.body;
    const userId = req.user?.id;

    try {
        if (!userId) {
            return res.status(401).json({ message: "유저 정보가 없습니다." });
        }
        const result = await teamsService.createTeam(teamData, userId);
        return res.status(201).json({ message: "팀 생성 성공"});
    } catch (err: any) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
};
