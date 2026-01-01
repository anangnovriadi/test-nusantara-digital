import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '@/types/api-response';
import { baseQuery } from './base-query';

export interface SearchParams {}
export interface Setting {
    id: number;
    school_name: string;
    fullname: string;
    nip: string;
    principal_name: string;
    principal_nip: string;
    school_year: string;
    level_of_education: string;
    about: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export interface UpdateSettingRequest {
    school_name: string;
    fullname: string;
    nip: string;
    principal_name: string;
    principal_nip: string;
    school_year: string;
    level_of_education: string;
    about?: string;
    address?: string;
}

export interface GetSettingDetailResponse extends ApiResponse<{ data: Setting }> {}

export const settingApi = createApi({
    reducerPath: 'settingApi',
    baseQuery: baseQuery,
    tagTypes: ['Settings'],
    endpoints: (builder) => ({
        getDetailSetting: builder.query<GetSettingDetailResponse, {}>({
            query: () => ({
                url: `/setting/detail`,
                method: 'GET',
            }),
            providesTags: ['Settings'],
        }),

        updateSetting: builder.mutation<ApiResponse<any>, { data: UpdateSettingRequest }>({
            query: ({ data }) => ({
                url: `/setting`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),
    }),
});

export const {
    useGetDetailSettingQuery,
    useUpdateSettingMutation,
} = settingApi;
