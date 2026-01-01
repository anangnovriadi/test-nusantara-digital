import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { COOKIE_KEYS } from '@/constants/cookies';

const initialState = {
  token: Cookies.get(COOKIE_KEYS.AUTH_TOKEN) || null,
  user: (() => {
    const userCookie = Cookies.get(COOKIE_KEYS.USER_INFO);
    try {
      return userCookie ? JSON.parse(userCookie) : null;
    } catch {
      return null;
    }
  })(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      Cookies.set(COOKIE_KEYS.AUTH_TOKEN, action.payload, { expires: 1 });
    },
    setUserInfo(state, action) {
      state.user = action.payload;
      Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(action.payload), { expires: 1 });
    },
    clearToken(state) {
      state.token = null;
      state.user = null;
      Cookies.remove(COOKIE_KEYS.AUTH_TOKEN);
      Cookies.remove(COOKIE_KEYS.USER_INFO);
    },
  },
});

export const { setToken, setUserInfo, clearToken } = authSlice.actions;
export default authSlice.reducer;
