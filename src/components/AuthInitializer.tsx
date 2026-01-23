// src/components/AuthInitializer.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearUser } from "@/redux/slices/userSlice";
import Cookies from "js-cookie";

export function AuthInitializer() {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const hasToken = isClient ? !!Cookies.get("access_token") : false;
    const currentUser = useAppSelector((state) => state.user);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        console.log("🔍 [AUTH_INIT] Initial state check:", {
            hasToken,
            username: currentUser?.username,
            status: currentUser?.status,
            course: currentUser?.course,
        });

        // Если есть токен но нет данных в Redux
        if (hasToken && !currentUser?.username) {
            console.log("⚠️ [AUTH_INIT] Token exists but no user data");
            
            // Проверяем localStorage
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                console.log("❌ [AUTH_INIT] No user in localStorage - clearing tokens");
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");
                dispatch(clearUser());
                router.replace("/login");
            }
        }

        // Если нет токена но есть данные в Redux - очищаем Redux
        if (!hasToken && currentUser?.username) {
            console.log("🧹 [AUTH_INIT] No token but user data exists - clearing state");
            dispatch(clearUser());
            localStorage.removeItem("user");
        }
    }, [isClient, hasToken, currentUser, router, dispatch]);

    return null;
}