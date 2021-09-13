import { configureStore, Action } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { rootReducer } from './root';
import { sessionAPI } from './services/session';
import { genresAPI } from './services/genres';
import { recommendationsAPI } from './services/recommendations';
import { productionCompaniesAPI } from './services/productionCompanies';
import { saveStateMiddleware, handleInvalidSessionMiddleware } from './stateHelpers';

export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
export { rootReducer };

const createStore = (preloadedState: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        sessionAPI.middleware,
        genresAPI.middleware,
        productionCompaniesAPI.middleware,
        recommendationsAPI.middleware,
        saveStateMiddleware,
        handleInvalidSessionMiddleware,
      ),
  });
  return store;
};

export { createStore };
