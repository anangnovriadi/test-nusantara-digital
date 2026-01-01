import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authSlice from './auth-slice';
import { authApi } from './api/auth-api';
import { settingApi } from './api/setting-api';
import { studentApi } from './api/student-api';
import { attendanceApi } from './api/attendance-api';
import { holidayApi } from './api/holiday-api';
import { homepageApi } from './api/homepage-api';

const rootReducer = combineReducers({
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
    [settingApi.reducerPath]: settingApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [holidayApi.reducerPath]: holidayApi.reducer,
    [homepageApi.reducerPath]: homepageApi.reducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([
            authApi.middleware,
            studentApi.middleware,
            settingApi.middleware,
            attendanceApi.middleware,
            homepageApi.middleware,
            holidayApi.middleware,
        ]),
});

export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
