import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '@/types/api-response';
import { baseQuery } from './base-query';

export interface SearchParams {}

export type StudentDetail = {
  id: number
  name: string
  nisn: string
  date_of_birth: string
  gender: string
  address: string
}

export interface Student {
    id: number;
    name: string;
    nisn: string;
    date_of_birth: string;
    gender: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export interface CreateStudentRequest {
    name: string;
    nisn: string;
    date_of_birth: string;
    gender: string;
    address?: string;
}

export interface UpdateStudentRequest {
    name: string;
    nisn: string;
    date_of_birth: string;
    gender: string;
    address?: string;
}

export interface GetStudentsResponse extends ApiResponse<{ data: Student[] }> {}
export interface GetStudentDetailResponse extends ApiResponse<{ data: Student }> {}

export const studentApi = createApi({
    reducerPath: 'studentApi',
    baseQuery: baseQuery,
    tagTypes: ['Students'],
    endpoints: (builder) => ({
        getAllStudents: builder.query<GetStudentsResponse, SearchParams>({
            query: () => ({
                url: '/students',
                method: 'GET',
                params: {},
            }),
            providesTags: ['Students'],
        }),

        getAllStudentGender: builder.query<any, SearchParams>({
            query: () => ({
                url: '/student-gender',
                method: 'GET',
                params: {},
            }),
            providesTags: ['Students'],
        }),

        createStudent: builder.mutation<ApiResponse<Student>, CreateStudentRequest>({
            query: (payloadBody) => ({
                url: '/student/create',
                method: 'POST',
                body: payloadBody,
            }),
            invalidatesTags: ['Students'],
        }),

        getDetailStudent: builder.query<GetStudentDetailResponse, number>({
            query: (id) => ({
                url: `/student/${id}`,
                method: 'GET',
            }),
            providesTags: ['Students'],
        }),

        updateStudent: builder.mutation<ApiResponse<any>, { id: number; data: UpdateStudentRequest }>({
            query: ({ id, data }) => ({
                url: `/student/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Students'],
        }),

        deleteStudent: builder.mutation<ApiResponse<any>, any>({
            query: (id) => ({
                url: `/student/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Students'],
        }),
    }),
});

export const {
    useGetAllStudentsQuery,
    useGetAllStudentGenderQuery,
    useCreateStudentMutation,
    useGetDetailStudentQuery,
    useUpdateStudentMutation,
    useDeleteStudentMutation
} = studentApi;
