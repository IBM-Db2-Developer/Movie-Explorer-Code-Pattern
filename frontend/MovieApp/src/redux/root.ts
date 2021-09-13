import { combineReducers, Action } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { sessionAPI } from './services/session';
import { genresAPI } from './services/genres';
import { productionCompaniesAPI } from './services/productionCompanies';
import { recommendationsAPI } from './services/recommendations';
import { authSlice } from './reducers/auth';
import { ratingsSlice } from './reducers/ratings';

const rootReducer = combineReducers({
  [sessionAPI.reducerPath]: sessionAPI.reducer,
  [genresAPI.reducerPath]: genresAPI.reducer,
  [productionCompaniesAPI.reducerPath]: productionCompaniesAPI.reducer,
  [recommendationsAPI.reducerPath]: recommendationsAPI.reducer,
  [authSlice.name]: authSlice.reducer,
  [ratingsSlice.name]: ratingsSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
export { rootReducer };
