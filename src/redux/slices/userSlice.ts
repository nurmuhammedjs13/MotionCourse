// src/redux/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    username: string | null;
    email: string | null;
}

// Функция для загрузки из localStorage
const loadFromLocalStorage = (): UserState => {
    if (typeof window === "undefined") {
        return { username: null, email: null };
    }

    try {
        const saved = localStorage.getItem("user");
        if (saved) {
            const parsed = JSON.parse(saved);
            console.log(
                "📦 [USER_SLICE] Загружены данные из localStorage:",
                parsed
            );
            return parsed;
        }
    } catch (error) {
        console.error(
            "❌ [USER_SLICE] Ошибка загрузки из localStorage:",
            error
        );
    }

    return { username: null, email: null };
};

// Функция для сохранения в localStorage
const saveToLocalStorage = (state: UserState) => {
    if (typeof window === "undefined") return;

    try {
        if (state.username) {
            localStorage.setItem("user", JSON.stringify(state));
            console.log("💾 [USER_SLICE] Сохранено в localStorage:", state);
        } else {
            localStorage.removeItem("user");
            console.log("🗑️ [USER_SLICE] Удалено из localStorage");
        }
    } catch (error) {
        console.error(
            "❌ [USER_SLICE] Ошибка сохранения в localStorage:",
            error
        );
    }
};

const initialState: UserState = loadFromLocalStorage();

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{ username: string; email: string | null }>
        ) => {
            console.log("✅ [USER_SLICE] setUser called with:", action.payload);
            state.username = action.payload.username;
            state.email = action.payload.email;
            saveToLocalStorage(state);
        },
        clearUser: (state) => {
            console.log("🧹 [USER_SLICE] clearUser called");
            state.username = null;
            state.email = null;
            saveToLocalStorage(state);
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
