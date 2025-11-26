import { pool } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (userData: any) => {
    const { name, email, password } = userData;

    const [existUser]: any = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
    );
    if (existUser.length > 0) {
        throw new Error("이미 등록된 이메일입니다.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
        "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        [email, hashedPassword, name]
    );

    return { id: result.insertId, email, name };
};

export const login = async (userData: any) => {
    const { email, password } = userData;

    const [rows]: any = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (rows.length === 0) throw new Error("존재하지 않는 이메일입니다.");

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("비밀번호가 틀렸습니다.");

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    return token;
};
