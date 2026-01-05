"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenService } from "@/utils/token";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();

    useEffect(() => {
        // Проверяем авторизацию только на клиенте
        const checkAuth = () => {
            const isAuthenticated = tokenService.isAuthenticated();

            if (!isAuthenticated) {
                router.push("/login");
            }
        };

        checkAuth();
    }, [router]);

    // Просто рендерим children - редирект произойдет в useEffect если нужно
    return <>{children}</>;
}
