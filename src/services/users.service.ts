import { pool } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SignupDTO, LoginDTO } from "../types/user.dto";
import { RowDataPacket } from "mysql2";

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  birth_date: string;
  position?: "FW" | "MF" | "DF" | "GK" | null;
  self_introduction?: string | null;
  created_at: string;
}


export const signup = async (userData: SignupDTO) => {
    const { name, email, password, birthDate } = userData;

    const [existUser]: any = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
    );
    if (existUser.length > 0) {
        throw new Error("이미 등록된 이메일입니다.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [_result]: any = await pool.query(
        "INSERT INTO users (email, password, name, birth_date) VALUES (?, ?, ?, ?)",
        [email, hashedPassword, name, birthDate]
    );
};

export const login = async (userData: LoginDTO) => {
    const { email, password } = userData;

    const [rows]: any = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (rows.length === 0)
        throw new Error("아이디 또는 비밀번호가 잘못되었습니다.");

    const user = rows[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
        throw new Error("아이디 또는 비밀번호가 잘못되었습니다.");

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    return token;
};

export const findUserProfile = async (userId: number) => {
    const [rows] = await pool.query<(User&RowDataPacket)[]>(
        `SELECT id, email, name, birth_date, position, self_introduction
         FROM users WHERE id = ?`,
        [userId]
    );

    if (rows.length === 0) throw new Error("사용자를 찾을 수 없습니다.");
    return rows[0];
};

export const updateUserProfile = async (
    userId: number,
    data: { position?: string; self_introduction?: string }
) => {
    const { position, self_introduction } = data;

    const [result] = await pool.query(
        `
        UPDATE users 
        SET position = ?, self_introduction = ?
        WHERE id = ?
        `,
        [position, self_introduction, userId]
    );

    return result;
};
