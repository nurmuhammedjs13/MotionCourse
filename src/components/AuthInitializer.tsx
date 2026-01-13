// src/components/AuthInitializer.tsx
"use client";

import { useEffect } from "react";
import { useValidateTokenQuery } from "@/redux/api/auth";
import { useAppSelector } from "@/redux/hooks";
import Cookies from "js-cookie";

/**
 * Компонент для автоматического восстановления данных пользователя
 * при загрузке страницы, если есть токен
 */
export function AuthInitializer() {
    const hasToken =
        typeof window !== "undefined" && !!Cookies.get("access_token");

    // Получаем текущее состояние пользователя из Redux
    const currentUser = useAppSelector((state) => state.user);

    // Автоматически проверяем токен и восстанавливаем пользователя
    const { isLoading, isError, data } = useValidateTokenQuery(undefined, {
        skip: !hasToken, // Пропускаем запрос, если нет токена
        refetchOnMountOrArgChange: true, // Перезагружаем данные при каждом монтировании
    });

    useEffect(() => {
        if (isLoading) {
            console.log("🔄 [AUTH_INIT] Проверка токена...");
        } else if (isError) {
            console.log("❌ [AUTH_INIT] Токен невалиден");
        } else if (hasToken && data?.user) {
            console.log("✅ [AUTH_INIT] Пользователь восстановлен:", data.user);
            console.log("✅ [AUTH_INIT] Redux state:", currentUser);
        }
    }, [isLoading, isError, hasToken, data, currentUser]);

    return null; // Этот компонент ничего не рендерит
}
