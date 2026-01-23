// src/redux/api/index.ts
import {
    createApi,
    fetchBaseQuery,
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    BaseQueryApi,
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

interface RefreshTokenResponse {
    access: string;
}

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_MOTIONCOURSE_API,
    prepareHeaders: (headers) => {
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
> = async (
    args: string | FetchArgs,
    api: BaseQueryApi,
    extraOptions: object
) => {
    let result = await baseQuery(args, api, extraOptions);

    const url = typeof args === "string" ? args : args.url;
    const isLoginRequest = url.includes("/login");
    const isRefreshRequest = url.includes("/token/refresh");

    // Если получили 401 ошибку И это НЕ логин И НЕ refresh
    if (result.error && result.error.status === 401 && !isLoginRequest && !isRefreshRequest) {
        console.log("🔄 [API] Got 401, attempting token refresh");
        const refreshToken = Cookies.get("refresh_token");

        if (refreshToken) {
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
                const data = refreshResult.data as RefreshTokenResponse;
                const newAccessToken = data.access;

                Cookies.set("access_token", newAccessToken, {
                    expires: 1 / 24,
                    path: "/",
                });

                console.log("✅ [API] Token refreshed successfully");
                result = await baseQuery(args, api, extraOptions);
            } else {
                console.log("❌ [API] Failed to refresh token - logging out");
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");
                localStorage.removeItem("user");

                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
            }
        } else {
            console.log("❌ [API] No refresh token - logging out");
            Cookies.remove("access_token");
            localStorage.removeItem("user");

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
    tagTypes: ["User", "course", "video", "mentor"],
    endpoints: () => ({}),
});