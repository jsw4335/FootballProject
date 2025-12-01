export interface SignupDTO {
    name: string;
    email: string;
    password: string;
    birthDate: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface UpdateProfileDTO {
    position?: "FW" | "MF" | "DF" | "GK";
    self_introduction?: string;
}