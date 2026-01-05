export interface ILoginRequest {
    username: string;
    password: string;
}

export interface IUser {
    username: string;
    email: string;
}

export interface ILoginResponse {
    user: IUser;
    access: string;
    refresh: string;
}

export interface IRefreshRequest {
    refresh: string;
}

export interface IRefreshResponse {
    access: string;
}
