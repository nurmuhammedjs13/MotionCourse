// src/utils/token.ts

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

export const tokenService = {
    // Сохранение токенов
    setTokens(access: string, refresh: string): void {
        if (typeof window !== "undefined") {
            localStorage.setItem(ACCESS_TOKEN_KEY, access);
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
        }
    },

    // Получение access токена
    getAccessToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem(ACCESS_TOKEN_KEY);
        }
        return null;
    },

    // Получение refresh токена
    getRefreshToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem(REFRESH_TOKEN_KEY);
        }
        return null;
    },

    // Удаление токенов
    clearTokens(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
    },

    // Сохранение информации о пользователе
    setUser(user: { username: string; email: string }): void {
        if (typeof window !== "undefined") {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    },

    // Получение информации о пользователе
    getUser(): { username: string; email: string } | null {
        if (typeof window !== "undefined") {
            const user = localStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        }
        return null;
    },

    // Проверка авторизации
    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },
};
