export interface CreateTeamDTO {
  teamName: string;
  region: string;
  activityDay?: "월" | "화" | "수" | "목" | "금" | "토" | "일" | null;
  level?: number | null;
}