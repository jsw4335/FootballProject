import { RowDataPacket } from "mysql2";

export interface RegionRow extends RowDataPacket {
    id: number;
    name: string;
}

export interface TeamRow extends RowDataPacket {
    id: number;
    team_name: string;
    region_id: number;
    activity_day: "월" | "화" | "수" | "목" | "금" | "토" | "일" | null;
    average_age: number | null;
    level: number | null;
    created_at: Date;
}

export interface TeamMemberRow extends RowDataPacket {
    id: number;
    team_id: number;
    user_id: number;
    role: number; // 0 = owner, 1 = member
    joined_at: Date;
}

export interface UserRow extends RowDataPacket {
    id: number;
    email: string;
    password: string;
    name: string;
    birth_date: Date;
    position: "FW" | "MF" | "DF" | "GK" | null;
    self_introduction: string | null;
    created_at: Date;
}