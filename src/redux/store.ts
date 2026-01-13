// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import userReducer from "./slices/userSlice";

// Middleware для сохранения состояния пользователя в localStorage
const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
    const result = next(action);
    
    // Сохраняем состояние пользователя после каждого изменения
    if (action.type?.startsWith('user/')) {
        const userState = store.getState().user;
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('userState', JSON.stringify(userState));
                console.log('💾 [STORE] User state saved to localStorage:', userState);
            } catch (error) {
                console.error('❌ [STORE] Failed to save to localStorage:', error);
            }
        }
    }
    
    return result;
};

// Загружаем состояние пользователя из localStorage
const loadUserState = () => {
    if (typeof window !== 'undefined') {
        try {
            const serializedState = localStorage.getItem('userState');
            if (serializedState) {
                const userState = JSON.parse(serializedState);
                console.log('📂 [STORE] User state loaded from localStorage:', userState);
                return userState;
            }
        } catch (error) {
            console.error('❌ [STORE] Failed to load from localStorage:', error);
        }
    }
    return undefined;
};

// Создаём функцию для создания store
export const makeStore = () => {
    const preloadedUserState = loadUserState();
    
    return configureStore({
        reducer: {
            [api.reducerPath]: api.reducer,
            user: userReducer,
        },
        preloadedState: preloadedUserState ? { user: preloadedUserState } : undefined,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(api.middleware, localStorageMiddleware),
    });
};

// Экспортируем типы
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
