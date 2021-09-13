import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RECOMMENDATIONS_URL } from '../../config';
import type { MovieResults } from '../../features/MovieList/MovieList';
import type { RatedMovieDetails } from '../reducers/ratings';

type RecommendationResult = {
  recommendations: MovieResults[];
};

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: RECOMMENDATIONS_URL,
});

export interface RecommendationRequest {
  session: string;
  movies: Array<[number, number]>;
}

export const recommendationsAPI = createApi({
  reducerPath: 'recommendationsAPI',
  baseQuery,
  endpoints: (build) => ({
    getRecommendations: build.query<Omit<RatedMovieDetails, 'rating'>[], RecommendationRequest>({
      query: ({ session, movies }) => ({
        url: '/',
        body: movies,
        method: 'POST',
        params: { session },
      }),
      transformResponse: (response: RecommendationResult) =>
        response.recommendations.map((M) => ({
          movieid: M.MOVIEID,
          title: M.TITLE,
          posterurl: M.POSTERURL,
          overview: M.OVERVIEW,
        })),
    }),
  }),
});

export const { useGetRecommendationsQuery, useLazyGetRecommendationsQuery } = recommendationsAPI;

export const {
  endpoints: { getRecommendations },
} = recommendationsAPI;
