// src/redux/api/index.ts

import {
    BaseQueryFn,
    createApi,
    fetchBaseQuery,
    FetchArgs,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { tokenService } from "@/utils/token";

const baseQuery = fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_MOTIONCOURSE_API}/`,
    prepareHeaders: (headers) => {
        const token = tokenService.getAccessToken();

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

    // Если получили 401 ошибку, пробуем обновить токен
    if (result.error && result.error.status === 401) {
        const refreshToken = tokenService.getRefreshToken();

        if (refreshToken) {
            // Пытаемся обновить токен
            const refreshResult = await baseQuery(
                {
                    url: "refresh/",
                    method: "POST",
                    body: { refresh: refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                // Сохраняем новый access токен
                const newAccessToken = (
                    refreshResult.data as { access: string }
                ).access;
                tokenService.setTokens(newAccessToken, refreshToken);

                // Повторяем оригинальный запрос с новым токеном
                result = await baseQuery(args, api, extraOptions);
            } else {
                // Refresh токен невалидный, разлогиниваем пользователя
                tokenService.clearTokens();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
            }
        } else {
            // Нет refresh токена, перенаправляем на логин
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
    refetchOnFocus: true,
    refetchOnReconnect: true,
    tagTypes: ["course", "login", "student-profile"],
    endpoints: () => ({}),
});
