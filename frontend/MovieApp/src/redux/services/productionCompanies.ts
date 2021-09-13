import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PRODUCTION_COMPANIES_URL } from '../../config';

const baseQuery = fetchBaseQuery({
  baseUrl: PRODUCTION_COMPANIES_URL,
});

type ProductionCompanyRequest = {
  movieid: number;
  session: string;
};

type ProductionCompanyResponse = {
  productionCompanies: string[];
  error?: string;
};
export const productionCompaniesAPI = createApi({
  reducerPath: 'productionCompaniesAPI',
  baseQuery,
  endpoints: (build) => ({
    productionCompaniesForMovie: build.query<string[], ProductionCompanyRequest>({
      query: ({ movieid, session }) => ({
        url: `${movieid}`,
        method: 'GET',
        params: { session },
      }),
      transformResponse: (response: ProductionCompanyResponse) =>
        response.productionCompanies.map((productionCompany) => productionCompany),
    }),
  }),
});

export const { useProductionCompaniesForMovieQuery } = productionCompaniesAPI;

export const {
  endpoints: { productionCompaniesForMovie },
} = productionCompaniesAPI;
