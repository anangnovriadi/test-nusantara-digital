import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '@/types/api-response';
import { baseQuery } from './base-query';

export interface SearchParams { }

export interface Employee {
  id: string;
  name: string;
  age: number;
  position: string;
  salary: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeRequest {
  name: string;
  age: number;
  position: string;
  salary: number;
}

export interface UpdateEmployeeRequest {
  name: string;
  age: number;
  position: string;
  salary: number;
}

/* ======================
   API RESPONSES
====================== */

export interface GetEmployeesResponse
  extends ApiResponse<{ data: Employee[] }> { }

export interface GetEmployeeDetailResponse
  extends ApiResponse<{ data: Employee }> { }

/* ======================
   RTK QUERY
====================== */

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: baseQuery,
  tagTypes: ['Employees'],
  endpoints: (builder) => ({
    getAllEmployees: builder.query<GetEmployeesResponse, SearchParams>({
      query: () => ({
        url: '/employees',
        method: 'GET',
      }),
      providesTags: ['Employees'],
    }),

    createEmployee: builder.mutation<
      ApiResponse<Employee>,
      CreateEmployeeRequest
    >({
      query: (payload) => ({
        url: '/employees',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Employees'],
    }),

    getEmployeeDetail: builder.query<GetEmployeeDetailResponse, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'GET',
      }),
      providesTags: ['Employees'],
    }),

    updateEmployee: builder.mutation<
      ApiResponse<Employee>,
      { id: string; data: UpdateEmployeeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Employees'],
    }),

    deleteEmployee: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employees'],
    }),

    getEmployeeStats: builder.query<{
      totalEmployees: number;
      positions: string[];
    }, void>({
      query: () => ({
        url: '/employees/stats',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<{
        totalEmployees: number;
        positions: string[];
      }>) => response.data,
      providesTags: ['Employees'],
    }),

    importEmployees: builder.mutation<
      { jobId: string; message: string },
      File
    >({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/employees/import',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Employees'],
    }),
  }),
});

export const {
  useGetAllEmployeesQuery,
  useCreateEmployeeMutation,
  useGetEmployeeDetailQuery,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeeStatsQuery,
  useImportEmployeesMutation,
} = employeeApi;
