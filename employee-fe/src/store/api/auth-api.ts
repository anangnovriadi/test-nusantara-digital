import { ApiResponse } from '@/types/api-response';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './base-query';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
}

export interface LoginResponse extends ApiResponse<{ token: string }> {}
export interface RegisterResponse extends ApiResponse<{ email: string }> {}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation<RegisterResponse, RegisterCredentials>({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
