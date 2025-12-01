import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/jwt";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "토큰이 없습니다." });
    }

    // Bearer 붙어 있든 안붙어있든 되게 만들기<-예성님이 만든 auth.ts코드는 미들웨어가 강제로 Bearer를 붙여야 가능하게 했음
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;



    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        // req.user에 userId 저장
        req.user = { id: decoded.id };
        next();
    } catch (err) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
};
