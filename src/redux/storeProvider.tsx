// src/redux/storeProvider.tsx
"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";
import { AuthInitializer } from "@/components/AuthInitializer";

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // Используем useRef для гарантии, что store создаётся только один раз
    const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);

    if (!storeRef.current) {
        storeRef.current = makeStore();
        console.log("🏪 [STORE_PROVIDER] Store создан");
    }

    return (
        <Provider store={storeRef.current}>
            <AuthInitializer />
            {children}
        </Provider>
    );
}
