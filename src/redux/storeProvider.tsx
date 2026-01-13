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
    const store = useMemo(() => {
        return makeStoreWithMiddleware();
    }, []);

    return (
        <Provider store={store}>
            <AuthInitializer />
            {children}
        </Provider>
    );
}
