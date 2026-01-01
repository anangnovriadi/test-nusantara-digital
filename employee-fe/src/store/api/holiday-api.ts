import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '@/types/api-response';
import { baseQuery } from './base-query';

export interface SearchParams {}
export interface Holiday {
    id: number;
    date: string;
    note: string;
    created_at: string;
    updated_at: string;
}

export interface CreateOrUpdateHolidayRequest {
    date: string;
    note: string;
}

export interface GetHolidaysResponse extends ApiResponse<{ data: Holiday[] }> {}

export const holidayApi = createApi({
    reducerPath: 'holidayApi',
    baseQuery: baseQuery,
    tagTypes: ['Holidays'],
    endpoints: (builder) => ({
        getAllHolidays: builder.query<GetHolidaysResponse, {}>({
            query: () => ({
                url: '/holidays',
                method: 'GET',
                params: {},
            }),
            providesTags: ['Holidays'],
        }),

        createOrUpdateHoliday: builder.mutation<ApiResponse<any>, { data: CreateOrUpdateHolidayRequest }>({
            query: ({ data }) => ({
                url: `/holiday/create-update`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Holidays'],
        }),

        deleteHoliday: builder.mutation<ApiResponse<any>, any>({
            query: (date) => ({
                url: `/holiday/${date}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Holidays'],
        }),
    }),
});

export const {
    useGetAllHolidaysQuery,
    useCreateOrUpdateHolidayMutation,
    useDeleteHolidayMutation
} = holidayApi;
