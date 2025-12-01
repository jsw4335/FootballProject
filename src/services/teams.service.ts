import { pool } from "../config/db";
import { CreateTeamDTO } from "../types/team.dto";

export const createTeam = async (teamData: CreateTeamDTO, userId: number) => {
    const { teamName, region, activityDay, level } = teamData;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1) region 이름 → id 조회
        const [regionResult] = await conn.query(
            "SELECT id FROM region_codes WHERE name = ?",
            [region]
        );

        if ((regionResult as any).length === 0) {
            throw new Error("지역을 선택해주세요.");
        }

        const regionId = (regionResult as any)[0].id;

        // 2) 팀 이름 중복 체크
        const [teamNameResult] = await conn.query(
            "SELECT id FROM teams WHERE team_name = ?",
            [teamName]
        );
        if ((teamNameResult as any).length !== 0) {
            throw new Error("이미 존재하는 팀이름입니다.");
        }

        // 3) teams 테이블에 팀 생성
        const [teamResult] = await conn.query(
            "INSERT INTO teams (team_name, region_id, activity_day, level) VALUES (?, ?, ?, ?)",
            [teamName, regionId, activityDay, level]
        );

        const teamId = (teamResult as any).insertId;

        // 4) 팀 리더(member)로 user 추가 (role = 0)
        await conn.query(
            "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)",
            [teamId, userId, 0]
        );

        await conn.commit();

        return;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};
