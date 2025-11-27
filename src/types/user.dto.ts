export interface SignupDTO {
    name: string;
    email: string;
    password: string;
    birth_date: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}
