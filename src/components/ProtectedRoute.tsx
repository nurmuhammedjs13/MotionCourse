// src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useValidateTokenQuery } from "@/redux/api/auth";
import { useAppSelector } from "@/redux/hooks";
import Cookies from "js-cookie";
import style from "./ProtectedRoute.module.scss";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();

    // Получаем пользователя из Redux
    const userFromRedux = useAppSelector((state) => state.user);

    // Проверяем наличие токена
    const hasToken = !!Cookies.get("access_token");

    // Используем validateToken для проверки валидности токена
    const { isLoading, error, isSuccess } = useValidateTokenQuery(undefined, {
        skip: !hasToken,
        refetchOnMountOrArgChange: true, // Перезагружаем данные при каждом монтировании
    });

    useEffect(() => {
        // Если нет токена - сразу редиректим
        if (!hasToken) {
            console.log("❌ No token found, redirecting to /login");
            router.replace("/login");
            return;
        }

        // Если загрузка завершена и токен невалиден
        if (!isLoading && error) {
            console.error("❌ Token validation failed:", error);
            Cookies.remove("access_token", { path: "/" });
            Cookies.remove("refresh_token", { path: "/" });
            router.replace("/login");
            return;
        }

        // Если токен валиден - логируем успех
        if (isSuccess && !isLoading) {
            console.log("✅ Token valid, user can proceed");
            if (userFromRedux?.username) {
                console.log("✅ User data in Redux:", userFromRedux.username);
            }
        }
    }, [hasToken, isLoading, error, isSuccess, userFromRedux, router]);

    // Показываем loader пока идет проверка
    if (!hasToken || isLoading) {
        return <div className={style.loading}>Загрузка...</div>;
    }

    // Если токен невалиден - показываем loader
    if (error) {
        return <div className={style.loading}>Перенаправление...</div>;
    }

    // Токен валиден - показываем контент
    return <>{children}</>;
}
