// src/components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearUser } from "@/redux/slices/userSlice";
import Cookies from "js-cookie";
import style from "./ProtectedRoute.module.scss";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isClient, setIsClient] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    const userFromRedux = useAppSelector((state) => state.user);
    const hasToken = isClient ? !!Cookies.get("access_token") : false;

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const checkAuth = async () => {
            console.log("🔍 [PROTECTED_ROUTE] Checking auth:", {
                hasToken,
                username: userFromRedux?.username,
            });

            // Если нет токена - очищаем Redux и редиректим
            if (!hasToken) {
                console.log("❌ No token found, clearing state and redirecting");
                dispatch(clearUser());
                localStorage.removeItem("user");
                router.replace("/login");
                return;
            }

            // Если есть токен но нет данных в Redux
            if (hasToken && !userFromRedux?.username) {
                console.log("⚠️ Token exists but no user data - checking localStorage");
                
                // Проверяем localStorage
                const storedUser = localStorage.getItem("user");
                if (!storedUser) {
                    console.log("❌ No user in localStorage, clearing and redirecting");
                    Cookies.remove("access_token");
                    Cookies.remove("refresh_token");
                    dispatch(clearUser());
                    router.replace("/login");
                    return;
                }
            }

            // Все в порядке
            if (hasToken && userFromRedux?.username) {
                console.log("✅ User authenticated:", userFromRedux.username);
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [isClient, hasToken, userFromRedux, router, dispatch]);

    // На сервере всегда показываем загрузку
    if (!isClient) {
        return <div className={style.loading}>Загрузка</div>;
    }

    // Показываем загрузку только во время проверки
    if (isChecking) {
        return <div className={style.loading}>Загрузка</div>;
    }

    // Если нет токена - не показываем контент (уже идет редирект)
    if (!hasToken) {
        return <div className={style.loading}>Загрузка</div>;
    }

    // Если нет данных пользователя - не показываем контент (уже идет редирект)
    if (!userFromRedux?.username) {
        return <div className={style.loading}>Загрузка</div>;
    }

    // Все проверки пройдены - показываем контент
    return <>{children}</>;
}