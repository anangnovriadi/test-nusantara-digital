import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '@/types/api-response';
import { baseQuery } from './base-query';

export interface UserProfile {
    id: string;
    fullname: string;
    email: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UpdateProfileRequest {
    fullname: string;
}

export const settingApi = createApi({
    reducerPath: 'settingApi',
    baseQuery: baseQuery,
    tagTypes: ['UserProfile'],
    endpoints: (builder) => ({
        getUserProfile: builder.query<UserProfile, void>({
            query: () => ({
                url: `/users/profile`,
                method: 'GET',
            }),
            providesTags: ['UserProfile'],
        }),

        updateUserProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
            query: (data) => ({
                url: `/users/profile`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['UserProfile'],
        }),
    }),
});

export const {
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
} = settingApi;

