// src/redux/storeProvider.tsx
"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";
import { makeStoreWithMiddleware } from "./store";
import { AuthInitializer } from "@/components/AuthInitializer";

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // Используем useMemo для гарантии единственного экземпляра store
    const store = useMemo(() => {
        console.log("🏪 [STORE_PROVIDER] Creating new store instance...");
        const newStore = makeStoreWithMiddleware();
        console.log("🏪 [STORE_PROVIDER] Store created with initial state");
        return newStore;
    }, []);

    // Добавим отладочный лог для проверки рендеров
    console.log("🔄 [STORE_PROVIDER] StoreProvider render, store exists:", !!store);

    return (
        <Provider store={store}>
            <AuthInitializer />
            {children}
        </Provider>
    );
}
