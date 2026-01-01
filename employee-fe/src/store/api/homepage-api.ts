import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '@/types/api-response';
import { baseQuery } from './base-query';

export interface SearchParams {
    attendance_date: string;
}
export interface Setting {
    id: number;
    school_name: string;
    fullname: string;
    school_year: string;
    level_of_education: string;
    about: string;
    created_at: string;
    updated_at: string;
}

export interface Student {
    id: number;
    name: string;
    date_of_birth: string;
    gender: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    id: number;
    student_id: number;
    status: string;
}

export interface Holiday {
    id: number;
    date: string;
    note: string;
    created_at: string;
    updated_at: string;
}

export interface CreateOrUpdateAttendaceRequest {
    student_id: number;
    status: string;
    attendance_date: string;
}

export interface GetSettingDetailResponse extends ApiResponse<{ data: Setting }> {}
export interface GetStudentsResponse extends ApiResponse<{ data: Student[] }> {}
export interface GetHolidaysResponse extends ApiResponse<{ data: Holiday[] }> {}

export const homepageApi = createApi({
    reducerPath: 'homepageApi',
    baseQuery: baseQuery,
    tagTypes: ['Homepage'],
    endpoints: (builder) => ({
        getDetailSettingPublic: builder.query<GetSettingDetailResponse, {}>({
            query: () => ({
                url: `/public/setting/detail`,
                method: 'GET',
            }),
            providesTags: ['Homepage'],
        }),

        getAllStudentsPublic: builder.query<GetStudentsResponse, SearchParams>({
            query: ({ attendance_date }) => ({
                url: '/public/students',
                method: 'GET',
                params: {
                    attendance_date
                }
            }),
            providesTags: ['Homepage'],
        }),

        createOrUpdateAttendancePublic: builder.mutation<ApiResponse<any>, { data: CreateOrUpdateAttendaceRequest }>({
            query: ({ data }) => ({
                url: `/homepage/attendance/create-update`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Homepage'],
        }),

        getAllHolidaysPublic: builder.query<GetHolidaysResponse, {}>({
            query: () => ({
                url: '/homepage/holidays',
                method: 'GET',
                params: {},
            }),
            providesTags: ['Homepage'],
        }),
    }),
});

export const {
    useGetDetailSettingPublicQuery,
    useGetAllStudentsPublicQuery,
    useGetAllHolidaysPublicQuery,
    useCreateOrUpdateAttendancePublicMutation,
} = homepageApi;
