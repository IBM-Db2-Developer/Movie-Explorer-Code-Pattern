import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

export type RatedMovieDetails = {
  movieid: number;
  overview: string;
  posterurl?: string;
  title: string;
  rating: number;
};

export type RatingState = {
  [key: number]: RatedMovieDetails;
};

type RemoveRatingPayload = {
  movieid: number;
};

export const initialState: RatingState = {};
const ratingsSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    setRating: (state, action: PayloadAction<RatedMovieDetails>): void => {
      const newState = state;
      const { movieid, rating, title, overview, posterurl } = action.payload;
      newState[movieid] = {
        movieid,
        title,
        rating,
        overview,
        posterurl,
      };
    },
    removeRating: (state, action: PayloadAction<RemoveRatingPayload>): void => {
      const newState = state;
      const { movieid } = action.payload;
      delete newState[movieid];
    },
    clearRatings: () => initialState,
  },
});

export const { setRating, removeRating, clearRatings } = ratingsSlice.actions;
export { ratingsSlice };

export const getRatingForMovie = (state: RootState, movieid: number) => state.ratings[movieid] || 0;

export const getRatedMovies = createSelector(
  (state: RootState) => state.ratings,
  (ratings) => {
    const ratedMovies = Object.values(ratings)
      .map((m) => ({ movieid: m.movieid, overview: m.overview, title: m.title, posterurl: m.posterurl }))
      .sort((a, b) => a.title.localeCompare(b.title));
    return ratedMovies;
  },
);

export const getHasRatedMovies = (state: RootState) => Object.keys(state.ratings).length > 0;

export const getRatedMovieForRecommendations = createSelector(
  (state: RootState) => state.ratings,
  (ratings) => {
    const ratedMovies: Array<[number, number]> = Object.values(ratings).map((m) => [m.movieid, m.rating]);
    return ratedMovies;
  },
);
