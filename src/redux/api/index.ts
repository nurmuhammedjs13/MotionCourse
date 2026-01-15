// src/redux/api/index.ts
import {
    createApi,
    fetchBaseQuery,
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

// Интерфейс для ответа refresh token
interface RefreshTokenResponse {
    access: string;
}

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_MOTIONCOURSE_API,
    prepareHeaders: (headers) => {
        // Добавляем access token из cookies в каждый запрос
        const token = Cookies.get("access_token");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    // Получаем URL запроса
    const url = typeof args === "string" ? args : args.url;

    // Проверяем, это НЕ запрос логина
    const isLoginRequest = url.includes("/login");

    // Если получили 401 ошибку И это НЕ логин - пробуем обновить токен
    if (result.error && result.error.status === 401 && !isLoginRequest) {
        const refreshToken = Cookies.get("refresh_token");

        if (refreshToken) {
            // Пытаемся обновить access token
            const refreshResult = await baseQuery(
                {
                    url: "/api/token/refresh",
                    method: "POST",
                    body: { refresh: refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                // Успешно обновили токен - сохраняем новый access token
                const data = refreshResult.data as RefreshTokenResponse;
                const newAccessToken = data.access;

                Cookies.set("access_token", newAccessToken, {
                    expires: 1 / 24, // 1 час
                    path: "/",
                });

                // Повторяем оригинальный запрос с новым токеном
                result = await baseQuery(args, api, extraOptions);
            } else {
                // Не удалось обновить токен - удаляем все токены и редиректим
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");

                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
            }
        } else {
            // Нет refresh token - редиректим на логин
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
    }

    return result;
};

export const api = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User", "course", "video"],
    endpoints: () => ({}),
});
