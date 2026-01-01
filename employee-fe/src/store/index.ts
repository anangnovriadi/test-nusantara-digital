import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authSlice from './auth-slice';
import { authApi } from './api/auth-api';
import { settingApi } from './api/setting-api';
import { employeeApi } from './api/employee-api';

const rootReducer = combineReducers({
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
    [settingApi.reducerPath]: settingApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([
            authApi.middleware,
            employeeApi.middleware,
            settingApi.middleware,
        ]),
});

export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
