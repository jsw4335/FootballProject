import { Request, Response } from "express";
import * as usersService from "../services/users.service";

export const signup = async (req: Request, res: Response) => {
    try {
        const result = await usersService.signup(req.body);
        return res.status(201).json({ message: "회원가입 성공", data: result });
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const token = await usersService.login(req.body);
        return res.status(200).json({ token });
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};
