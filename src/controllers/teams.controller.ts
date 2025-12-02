import { Request, Response } from "express";
import * as teamsService from "../services/teams.service";

export const createTeamController = async (req: Request, res: Response) => {
    const teamData = req.body;
    const userId = req.user?.id;

    try {
        if (!userId) {
            return res.status(401).json({ message: "유저 정보가 없습니다." });
        }
        await teamsService.createTeam(teamData, userId);
        return res.status(201).json({ message: "팀 생성 성공"});
    } catch (err: any) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
};

export const getTeamsController = async (req: Request, res: Response) => {
    try {
        const teams = await teamsService.getTeams();
        return res.status(200).json(teams);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};

export const getTeamDetailController = async (req: Request, res: Response) => {
    try {
        const teamId = Number(req.params.teamId);
        const detail = await teamsService.getTeamDetail(teamId);
        return res.status(200).json(detail);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};

export const joinTeamController = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const teamId = Number(req.params.teamId);

        await teamsService.joinTeam(teamId, userId);
        return res.status(201).json({ message: "팀 가입 완료" });

    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};