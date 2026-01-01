import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '@/types/api-response';
import { baseQuery } from './base-query';

export interface SearchParams {
    attendance_date?: string;
    start_date?: string;
    end_date?: string;
}
export interface Attendance {
    id: number;
    student_id: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAttendanceRequest {
    student_id: number;
    status: string;
}

export interface UpdateAttendanceRequest {
    student_id: number;
    status: string;
}

export interface GetAttendancesResponse extends ApiResponse<{ data: Attendance[] }> {}
export interface GetAttendanceDetailResponse extends ApiResponse<{ data: Attendance }> {}

export const attendanceApi = createApi({
    reducerPath: 'attendanceApi',
    baseQuery: baseQuery,
    tagTypes: ['Attendances'],
    endpoints: (builder) => ({
        getAllAttendances: builder.query<GetAttendancesResponse, SearchParams>({
            query: ({ attendance_date }) => ({
                url: '/attendances',
                method: 'GET',
                params: {
                    attendance_date
                },
            }),
            providesTags: ['Attendances'],
        }),

        getAllAttendancesSummary: builder.query<GetAttendancesResponse, SearchParams>({
            query: ({ start_date, end_date }) => ({
                url: '/attendances-summary',
                method: 'GET',
                params: {
                    start_date,
                    end_date
                },
            }),
            providesTags: ['Attendances'],
        }),

        createAttendance: builder.mutation<ApiResponse<Attendance>, CreateAttendanceRequest>({
            query: (payloadBody) => ({
                url: '/attendance/create',
                method: 'POST',
                body: payloadBody,
            }),
            invalidatesTags: ['Attendances'],
        }),

        getDetailAttendance: builder.query<GetAttendanceDetailResponse, number>({
            query: (id) => ({
                url: `/attendance/${id}`,
                method: 'GET',
            }),
            providesTags: ['Attendances'],
        }),

        updateAttendance: builder.mutation<ApiResponse<any>, { id: number; data: UpdateAttendanceRequest }>({
            query: ({ id, data }) => ({
                url: `/attendance/update/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Attendances'],
        }),

        deleteAttendance: builder.mutation<ApiResponse<any>, any>({
            query: ({ id }) => ({
                url: `/attendance/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Attendances'],
        }),
    }),
});

export const {
    useGetAllAttendancesQuery,
    useGetAllAttendancesSummaryQuery,
    useCreateAttendanceMutation,
    useGetDetailAttendanceQuery,
    useUpdateAttendanceMutation,
    useDeleteAttendanceMutation
} = attendanceApi;
