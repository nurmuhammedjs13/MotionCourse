// src/redux/api/auth/index.ts

import { api } from "../index";
import type {
    ILoginRequest,
    ILoginResponse,
    IRefreshRequest,
    IRefreshResponse,
} from "./types";
import { tokenService } from "@/utils/token";

export const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        // Логин
        login: build.mutation<ILoginResponse, ILoginRequest>({
            query: (credentials) => ({
                url: "login/",
                method: "POST",
                body: credentials,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    tokenService.setTokens(data.access, data.refresh);
                    tokenService.setUser(data.user);
                } catch (error) {
                    console.error("Login failed:", error);
                }
            },
            invalidatesTags: ["login"],
        }),

        // Обновление access токена
        refreshToken: build.mutation<IRefreshResponse, IRefreshRequest>({
            query: (body) => ({
                url: "refresh/",
                method: "POST",
                body,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const refreshToken = tokenService.getRefreshToken();
                    if (refreshToken) {
                        tokenService.setTokens(data.access, refreshToken);
                    }
                } catch (error) {
                    tokenService.clearTokens();
                    if (typeof window !== "undefined") {
                        window.location.href = "/login";
                    }
                }
            },
        }),

        // Логаут — ИСПРАВЛЕН
        logout: build.mutation<null, void>({
            queryFn: async () => {
                try {
                    tokenService.clearTokens();
                    return { data: null };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: "Logout failed",
                        },
                    };
                }
            },
            invalidatesTags: ["login"],
        }),
    }),
});

export const { useLoginMutation, useRefreshTokenMutation, useLogoutMutation } =
    authApi;
