// src/redux/store.ts
import { configureStore, Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { api } from "./api";
import userReducer from "./slices/userSlice";

// Создаём функцию для создания store (нужно определить раньше для типов)
export const makeStore = () => {
    return configureStore({
        reducer: {
            [api.reducerPath]: api.reducer,
            user: userReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(api.middleware),
    });
};

// Экспортируем типы
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Middleware для сохранения состояния пользователя в localStorage
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const localStorageMiddleware: Middleware<{}, RootState> = 
    (store: MiddlewareAPI<AppDispatch, RootState>) => 
    (next) => 
    (action) => {
    const result = next(action);
    
    // Сохраняем состояние пользователя после каждого изменения
    if (typeof action === 'object' && action !== null && 'type' in action) {
        const typedAction = action as { type: string };
        if (typedAction.type?.startsWith('user/')) {
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

// Обновляем функцию для создания store с middleware и preloadedState
export const makeStoreWithMiddleware = () => {
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
