import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    name: string;
    email: string;
    password: string;
}

interface UserState {
    users: User[];
}

const initialState: UserState = {
    users: [],
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        registerUser: (state, action: PayloadAction<User>) => {
            state.users.push(action.payload);
        },
    },
});

export const { registerUser } = userSlice.actions;
export default userSlice.reducer;
