// src/provider/ReduxProvider.tsx
"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/redux/store";

export default function ReduxProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // Используем useState с функцией инициализации
    // Функция вызовется ТОЛЬКО ОДИН РАЗ при первом рендере
    const [store] = useState(() => {
        console.log("🏪 [REDUX_PROVIDER] Store created");
        return makeStore();
    });

    return <Provider store={store}>{children}</Provider>;
}
