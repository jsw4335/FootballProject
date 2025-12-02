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

// 팀 목록 조회
export const getTeams = async () => {
    const [rows] = await pool.query(`
        SELECT 
            t.id,
            t.team_name,
            r.name AS region,
            (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count
        FROM teams t
        JOIN region_codes r ON r.id = t.region_id
    `);

    return rows;
};

// 팀 상세 조회 -> 팀 목록에 나오는 팀을 눌렀을 때 팀의 상세 페이지를 보고 가입신청할 수 있습니다.
export const getTeamDetail = async (teamId: number) => {
    // 팀 정보 가져오기
    const [team] = await pool.query(`
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

    if ((team as any).length === 0) throw new Error("존재하지 않는 팀입니다.");

    // 멤버 목록
    const [members] = await pool.query(`
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

    const leader = (members as any).find((m: any) => m.role === 0);

    return {
        team: (team as any)[0],
        leader,
        members
    };
};

// 팀 가입->지금은 요청하면 바로 가입되게 해요
export const joinTeam = async (teamId: number, userId: number) => {
    // 팀 존재 확인
    const [team] = await pool.query("SELECT id FROM teams WHERE id = ?", [teamId]);
    if ((team as any).length === 0) throw new Error("존재하지 않는 팀입니다.");

    // 중복 가입 방지->이미 가입한 사람을 가입하지 않게 해요
    const [exists] = await pool.query(
        "SELECT id FROM team_members WHERE team_id = ? AND user_id = ?",
        [teamId, userId]
    );
    if ((exists as any).length > 0) throw new Error("이미 가입한 팀입니다.");

    // 가입 처리
    await pool.query(
        "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)",
        [teamId, userId, 1]
    );
};