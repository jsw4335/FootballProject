import { pool } from "../config/db.config";
import { CreateTeamDTO } from "../types/team.dto";
import {
    RegionRow,
    TeamRow,
    TeamMemberRow,
    UserRow,
} from "../types/db";
import { ResultSetHeader } from "mysql2";

export const createTeam = async (teamData: CreateTeamDTO, userId: number):Promise<void> => {
    const { teamName, region, activityDay, level } = teamData;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [regionResult] = await conn.query<RegionRow[]>(
            "SELECT id FROM region_codes WHERE name = ?",
            [region]
        );

        if (regionResult.length === 0) {
            throw new Error("지역을 선택해주세요.");
        }

        const regionId = regionResult[0].id;

        const [teamNameResult] = await conn.query<TeamRow[]>(
            "SELECT id FROM teams WHERE team_name = ?",
            [teamName]
        );
        if (teamNameResult.length !== 0) {
            throw new Error("이미 존재하는 팀이름입니다.");
        }

        const [teamResult] = await conn.query<ResultSetHeader>(
            "INSERT INTO teams (team_name, region_id, activity_day, level) VALUES (?, ?, ?, ?)",
            [teamName, regionId, activityDay, level]
        );

        const teamId = teamResult.insertId;

        await conn.query(
            "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)",
            [teamId, userId, 0]
        );

        await conn.commit();



    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

export const getTeams = async () => {
    const [rows] = await pool.query<(TeamRow & { region: string; member_count: number })[]>(`
        SELECT 
            t.id,
            t.team_name,
            r.name AS region,
            (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count
        FROM teams t
        JOIN region_codes r ON r.id = t.region_id
    `);

    return rows.map((row) => ({
        id: row.id,
        teamName: row.team_name,
        region: row.region,
        memberCount: row.member_count,
    }));
};

export const getTeamDetail = async (teamId: number) => {
    const [teamRows] = await pool.query<TeamRow[]>(`
        SELECT 
            t.id,
            t.team_name,
            r.name AS region,
            t.activity_day,
            t.level
        FROM teams t
        JOIN region_codes r ON r.id = t.region_id
        WHERE t.id = ?
    `, [teamId]);

    if (teamRows.length === 0) throw new Error("존재하지 않는 팀입니다.");
    const team = teamRows[0];    
    const [memberRows] = await pool.query<(TeamMemberRow & UserRow)[]>(`
        SELECT 
            u.id,
            u.name,
            u.position,
            u.self_introduction,
            tm.role
        FROM team_members tm
        JOIN users u ON u.id = tm.user_id
        WHERE tm.team_id = ?
        ORDER BY tm.role ASC
    `, [teamId]);

    const leader = memberRows.find((m) => m.role === 0)??null;

    return  {
        team: {
            id: team.id,
            teamName: team.team_name,
            region: team.region,
            activityDay: team.activity_day,
            level: team.level,
        },
        leader:
            leader && {
                id: leader.id,
                name: leader.name,
                position: leader.position,
                selfIntroduction: leader.self_introduction,
                role: leader.role,
                joinedAt: leader.joined_at,
            },
        members: memberRows.map((m) => ({
            id: m.id,
            name: m.name,
            position: m.position,
            selfIntroduction: m.self_introduction,
            role: m.role,
            joinedAt: m.joined_at,
        })),
    };
};

export const joinTeam = async (teamId: number, userId: number): Promise<void> => {

    const [teamRows] = await pool.query<TeamRow[]>("SELECT id FROM teams WHERE id = ?", [teamId]);
    if (teamRows.length === 0) throw new Error("존재하지 않는 팀입니다.");

    const [existsRows] = await pool.query<TeamMemberRow[]>(
        "SELECT id FROM team_members WHERE team_id = ? AND user_id = ?",
        [teamId, userId]
    );
    if (existsRows.length > 0) throw new Error("이미 가입한 팀입니다.");

    await pool.query(
        "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)",
        [teamId, userId, 1]
    );
};