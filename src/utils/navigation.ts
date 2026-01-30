"use client";

import { useRouter } from "next/navigation";

/**
 * Переход на главную страницу с принудительным обновлением
 * Если пользователь уже на главной странице, страница все равно обновится
 */
export const navigateToHome = (router?: ReturnType<typeof useRouter>): void => {
    if (typeof window === "undefined") return;
    
    // Если роутер не передан, используем window.location для перехода
    if (!router) {
        if (window.location.pathname === "/home") {
            window.location.reload();
        } else {
            window.location.href = "/home";
        }
        return;
    }
    
    // Если уже на главной странице, принудительно обновляем
    if (window.location.pathname === "/home") {
        window.location.reload();
    } else {
        // Иначе переходим на главную страницу
        router.push("/home");
    }
};
