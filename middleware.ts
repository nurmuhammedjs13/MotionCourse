// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
    // Теперь просто пропускаем все запросы
    // Защита происходит на уровне ProtectedRoute компонента
    // который проверяет авторизацию через API запрос
    return NextResponse.next();
}

export const config = {
    matcher: ["/lessons/:path*", "/chat/:path*", "/home/:path*"],
};
