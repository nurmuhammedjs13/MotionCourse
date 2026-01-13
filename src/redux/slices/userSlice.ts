// src/redux/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    username: string | null;
    email: string | null;
}

const initialState: UserState = {
    username: null,
    email: null,
};

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
        },
        clearUser: (state) => {
            console.log("🧹 [USER_SLICE] clearUser called");
            state.username = null;
            state.email = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
