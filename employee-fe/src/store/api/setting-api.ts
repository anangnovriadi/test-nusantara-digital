import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '@/types/api-response';
import { baseQuery } from './base-query';

export interface SearchParams {}
export interface Setting {
    id: number;
    fullname: string;
}

export interface UpdateSettingRequest {
    fullname: string;
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
