// src/redux/api/auth/index.tsx
import { api } from "../index";
import type { ILoginRequest, ILoginResponse } from "./types";
import { setUser, clearUser } from "../../slices/userSlice";
import Cookies from "js-cookie";

export const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        // Простая проверка валидности токена
        validateToken: build.query<{ valid: boolean }, void>({
            query: () => ({
                url: "/student-profile/",
                method: "GET",
            }),
            providesTags: ["User"],
            transformResponse: () => {
                return { valid: true };
            },
        }),

        // Логин
        login: build.mutation<ILoginResponse, ILoginRequest>({
            query: (credentials) => ({
                url: "/login/",
                method: "POST",
                body: credentials,
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    console.log("🔄 [AUTH_API] Начало процесса логина...");

                    const { data } = await queryFulfilled;
                    console.log(
                        "✅ [AUTH_API] Данные от сервера получены:",
                        data
                    );

                    // Сохраняем токены в cookies
                    if (data.access && data.refresh) {
                        console.log(
                            "💾 [AUTH_API] Сохраняем токены в cookies..."
                        );

                        Cookies.remove("access_token");
                        Cookies.remove("refresh_token");

                        Cookies.set("access_token", data.access, {
                            expires: 1 / 24,
                            path: "/",
                            sameSite: "lax",
                        });

                        Cookies.set("refresh_token", data.refresh, {
                            expires: 7,
                            path: "/",
                            sameSite: "lax",
                        });

                        console.log("✅ [AUTH_API] Токены сохранены");
                    }

                    // Сохраняем пользователя в Redux
                    console.log(
                        "💾 [AUTH_API] Вызываем setUser для:",
                        data.user
                    );
                    dispatch(
                        setUser({
                            username: data.user.username,
                            email: data.user.email,
                        })
                    );
                } catch (error) {
                    console.log("❌ [AUTH_API] Ошибка при логине:", error);
                }
            },
            invalidatesTags: ["User"],
        }),

        // Обновление токена
        refreshToken: build.mutation<{ access: string }, { refresh: string }>({
            query: (body) => ({
                url: "/api/token/refresh",
                method: "POST",
                body,
            }),
        }),

        // Выход
        logout: build.mutation<void, void>({
            query: () => ({
                url: "/logout/",
                method: "POST",
            }),
            invalidatesTags: ["User"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    console.log("✅ [AUTH_API] Logout успешен");
                } catch (error) {
                    console.log("⚠️ [AUTH_API] Logout failed");
                } finally {
                    console.log("🧹 [AUTH_API] Очистка данных...");

                    dispatch(clearUser());
                    dispatch(api.util.resetApiState());

                    Cookies.remove("access_token", { path: "/" });
                    Cookies.remove("refresh_token", { path: "/" });

                    console.log("✅ [AUTH_API] Данные очищены");
                }
            },
        }),
    }),
});

export const {
    useValidateTokenQuery,
    useLoginMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
} = authApi;
