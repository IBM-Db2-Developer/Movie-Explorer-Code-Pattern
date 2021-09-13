import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { TagTypeName } from 'carbon-components-react';
import { GENRES_URL } from '../../config';

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: GENRES_URL,
});

type GenresRequest = {
  movieid: number;
  session: string;
};

const AVAILABLE_COLOURS: TagTypeName[] = [
  'red',
  'magenta',
  'purple',
  'blue',
  'cyan',
  'teal',
  'green',
  'gray',
  'cool-gray',
  'warm-gray',
];
const TOTAL_COLOURS = AVAILABLE_COLOURS.length;

type GenreWithColour = {
  id: string;
  colour: TagTypeName;
};

type GenreResponse = {
  genres: string[];
  error?: string;
};
export const genresAPI = createApi({
  reducerPath: 'genresAPI',
  baseQuery,
  endpoints: (build) => ({
    genresForMovie: build.query<GenreWithColour[], GenresRequest>({
      query: ({ movieid, session }) => ({
        url: `${movieid}`,
        method: 'GET',
        params: { session },
      }),
      transformResponse: (response: GenreResponse) =>
        response.genres.map((genre, idx) => ({
          id: genre,
          colour: AVAILABLE_COLOURS[idx % TOTAL_COLOURS],
        })),
    }),
  }),
});

export const { useGenresForMovieQuery } = genresAPI;

export const {
  endpoints: { genresForMovie },
} = genresAPI;
