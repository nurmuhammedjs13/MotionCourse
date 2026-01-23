"use client";

import Mentor from "@/appPages/site/components/pages/Mentor";
import { useAppSelector } from "@/redux/hooks";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function Page() {
    const router = useRouter();
    const currentUser = useAppSelector((state) => state.user);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const hasToken = !!Cookies.get("access_token");

        if (!hasToken) {
            router.replace("/login");
            return;
        }

        // Ждем пока восстановятся данные пользователя из localStorage
        if (!currentUser?.username) return;

        if (currentUser.status !== "mentor") {
            router.replace("/lessons");
        }
    }, [mounted, currentUser?.username, currentUser?.status, router]);

    // Единый UI на первый рендер, чтобы не ловить hydration mismatch
    if (!mounted || !currentUser?.username) {
        return <div>Загрузка</div>;
    }

    if (currentUser.status !== "mentor") {
        return <div>Загрузка</div>;
    }

    return <Mentor />;
}

export default Page;
