import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { sessionAPI } from '../services/session';
import { RootState } from '..';

export type AuthState = {
  session: string;
};

export const initialState: AuthState = {
  session: '',
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAction: (state, action: PayloadAction<string>): void => {
      const newState = state;
      newState.session = action.payload;
    },
    logoutAction: (state): void => {
      const newState = state;
      newState.session = '';
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(sessionAPI.endpoints.login.matchFulfilled, (state, { payload }) => {
      if (payload.includes('Error')) {
        return;
      }
      const newState = state;
      newState.session = payload;
    });
  },
});

export const { loginAction, logoutAction } = authSlice.actions;
export { authSlice };

export const getSessionSelector = createSelector(
  (state: RootState) => state.auth,
  (authState) => authState.session,
);
