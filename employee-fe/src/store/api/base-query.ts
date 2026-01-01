import { BaseQueryApi, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clearToken } from '@/store/auth-slice';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { API_URL } from '@/constants/api';
import { COOKIE_KEYS } from '@/constants/cookies';
import { ROUTES } from '@/constants/routes';

export const baseQueryAuth = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = Cookies.get(COOKIE_KEYS.AUTH_TOKEN);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQuery = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
  const result = await baseQueryAuth(args, api, extraOptions);

  if (result?.error?.status === 403) {
    toast.error("Session expired", {
      id: 'session-expired',
      description: "Sesi telah berakhir",
      duration: 1000,
      onAutoClose: () => {
        api.dispatch(clearToken());

        if (typeof window !== 'undefined') {
          window.location.href = ROUTES.ADMIN.DASHBOARD;
        }
      },
    });
  }

  return result;
};
