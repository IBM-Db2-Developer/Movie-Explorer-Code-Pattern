import { useMemo, useEffect, useState } from 'react';
import { unstable_batchedUpdates as batch } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { debounce, uniqBy } from 'lodash';
import { Search, InlineLoading } from 'carbon-components-react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary';
import { getSessionSelector, logoutAction } from '../../redux/reducers/auth';
import { getRatedMovies, getHasRatedMovies } from '../../redux/reducers/ratings';
import { MOVIE_WEBSOCKET } from '../../config';
import { ErrorFallBack } from '../ErrorFallBack';
import { MovieDetails } from './MovieDetails';
import { ClearRatings } from './ClearRatings';
import { GetStarted } from './GetStarted';
import type { MovieDetailsProps } from './MovieDetails';
import styles from './movielist.module.scss';

export type MovieResults = {
  MOVIEID: number;
  TITLE: string;
  POSTERURL?: string;
  OVERVIEW: string;
};

type WSMessageReturn = {
  results: Array<MovieResults>;
  error: string | null;
  jobComplete: boolean;
};

type WSMessageParsed = {
  results: Array<MovieDetailsProps>;
  error: string | null;
  jobComplete: boolean;
};

export const MovieListWithoutError = () => {
  const [wsAvailable, setWsAvailable] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const handleError = useErrorHandler();
  const hasRatedAMovie = useSelector(getHasRatedMovies);
  const dispatch = useDispatch();
  const [searchFilter, setSearchFilter] = useState('');
  const session = useSelector(getSessionSelector);
  const currentRatedMovies = useSelector(getRatedMovies);

  const ws = useMemo(() => {
    if (!session) {
      return null;
    }
    const webSocket = new WebSocket(`${MOVIE_WEBSOCKET}?session=${session}`);
    webSocket.onopen = () => {
      setWsAvailable(true);
    };
    webSocket.onerror = () => {
      handleError(
        new Error(`Unable to connect to ${MOVIE_WEBSOCKET}. Verify the server is running and refresh the page.`),
      );
    };
    return webSocket;
  }, [session, handleError]);

  const [messages, setMessages] = useState<WSMessageParsed>({
    error: null,
    results: [],
    jobComplete: false,
  });

  const hasNextPage = !messages.jobComplete;

  const loadNextPage = () => {
    return new Promise<void>((resolve) => {
      try {
        ws?.send(JSON.stringify({ query: searchFilter, nextPage: true }));
        resolve();
      } catch (e) {
        handleError(e);
      }
    });
  };

  const [sentryRef, { rootRef }] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadNextPage,
    disabled: !!messages.error,
    rootMargin: '0px 0px 400px 0px',
  });

  useEffect(() => {
    if (!ws) {
      return;
    }

    ws.onmessage = (message: { data?: string }) => {
      if (message.data) {
        const data = JSON.parse(message.data) as WSMessageReturn;
        if (data.error?.includes('Invalid session ID!')) {
          batch(() => {
            setIsLoading(false);
            dispatch(logoutAction());
            ws.close();
          });
          return;
        }
        const updatedData: WSMessageParsed = {
          jobComplete: data.jobComplete,
          error: data.error,
          results: [],
        };
        updatedData.results = data.results.map((r) => ({
          movieid: r.MOVIEID,
          title: r.TITLE,
          overview: r.OVERVIEW,
          posterurl: r.POSTERURL,
        }));
        batch(() => {
          setIsLoading(false);
          setMessages((currentData) => {
            const updatedMessages = uniqBy([...currentData.results, ...updatedData.results], (m) => m.movieid);
            return {
              error: data.error,
              jobComplete: data.jobComplete,
              results: updatedMessages,
            };
          });
        });
      }
    };
  }, [ws, dispatch]);

  useEffect(() => {
    if (!searchFilter) {
      setMessages({
        error: null,
        jobComplete: true,
        results: currentRatedMovies,
      });
    }
  }, [searchFilter, currentRatedMovies]);
  useEffect(() => {
    if (!searchFilter || ws?.readyState !== 1) {
      return;
    }

    setIsLoading(true);
    ws.send(JSON.stringify({ query: searchFilter, nextPage: false }));
  }, [searchFilter, ws]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchFilter(value?.toLocaleLowerCase() ?? '');
        setMessages({
          error: null,
          jobComplete: false,
          results: [],
        });
      }, 500),
    [],
  );

  return (
    <>
      <ClearRatings visible={hasRatedAMovie && !searchFilter} />
      <div className={styles.container}>
        <Search
          labelText="Search for a movie"
          placeholder="Search for a movie"
          disabled={!wsAvailable}
          onChange={(e) => {
            debouncedSetSearch(e.currentTarget.value);
          }}
        />
        <GetStarted open={!searchFilter && !hasRatedAMovie} />
        <div className={styles.movieList} ref={rootRef}>
          {messages.results.map((item) => (
            <div key={item.movieid}>
              <MovieDetails
                movieid={item.movieid}
                overview={item.overview}
                posterurl={item.posterurl}
                title={item.title}
              />
            </div>
          ))}

          {(loading || hasNextPage) && (
            <div ref={sentryRef}>
              <div className={styles.loadingContainer}>
                <InlineLoading description="Loading..." />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const MovieList = () => (
  <ErrorBoundary FallbackComponent={ErrorFallBack}>
    <MovieListWithoutError />
  </ErrorBoundary>
);
