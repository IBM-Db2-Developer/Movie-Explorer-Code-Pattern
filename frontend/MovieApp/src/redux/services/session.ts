import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REGISTER_URL } from '../../config';

export interface SessionRequest {
  hostname: string;
  database: string;
  dbPort: number;
  restPort: number;
  ssl: boolean;
  password: string;
  username: string;
  expiryTime: string | number;
}
// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: REGISTER_URL,
});

export const sessionAPI = createApi({
  reducerPath: 'sessionAPI',
  baseQuery,
  endpoints: (build) => ({
    login: build.mutation<string, SessionRequest>({
      query: (req) => ({
        url: '/',
        params: req,
        method: 'GET',
        responseHandler: (response) => response.text(),
      }),
    }),
  }),
});

export const { useLoginMutation } = sessionAPI;

export const {
  endpoints: { login },
} = sessionAPI;
