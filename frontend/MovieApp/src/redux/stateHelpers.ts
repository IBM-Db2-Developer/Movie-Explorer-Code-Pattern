import type { Middleware, Action } from 'redux';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { RootState } from '.';
import { logoutAction } from './reducers/auth';
import { LOCAL_STORAGE_KEY } from '../config';

export type LocalSessionStorage = {
  state?: Partial<RootState>;
};
export const getState = (): Partial<RootState> => {
  const existingState = {
    auth: {
      session: '',
    },
    ratings: {},
  };
  try {
    const localStorageState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!) as unknown as RootState;
    existingState.auth.session = localStorageState.auth?.session ?? '';
    existingState.ratings = localStorageState.ratings || {};
  } catch (e) {
    //
  }

  return existingState;
};

export const handleInvalidSessionMiddleware: Middleware<{}, RootState> =
  (storeApi) => (next) => (action: Action<string>) => {
    if (isRejectedWithValue(action)) {
      if (action.error.message?.toLowerCase().includes('invalid session')) {
        storeApi.dispatch(logoutAction);
      }
    }

    return next(action);
  };

export const saveStateMiddleware: Middleware<{}, RootState> = (storeApi) => (next) => (action: Action<string>) => {
  next(action);

  if (action.type.startsWith('session') || action.type.startsWith('rating')) {
    const { auth, ratings } = storeApi.getState();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ auth, ratings }));
  }
};
