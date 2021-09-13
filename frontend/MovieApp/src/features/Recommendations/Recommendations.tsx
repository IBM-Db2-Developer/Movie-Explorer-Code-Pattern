import { useEffect, useState } from 'react';
import { InlineLoading, Button } from 'carbon-components-react';
import { Renew32 } from '@carbon/icons-react';
import { useSelector } from 'react-redux';
import { MovieDetails } from '../MovieList/MovieDetails';
import movieliststyles from '../MovieList/movielist.module.scss';
import { useLazyGetRecommendationsQuery } from '../../redux/services/recommendations';
import { getRatedMovieForRecommendations } from '../../redux/reducers/ratings';
import { getSessionSelector } from '../../redux/reducers/auth';
import styles from './recommendations.module.scss';

export const Recommendations = () => {
  const [hasFetchedRecommendations, setHasFetchedRecommendations] = useState(false);
  const session = useSelector(getSessionSelector);
  const movies = useSelector(getRatedMovieForRecommendations);
  const [trigger, { isFetching, isLoading, data: recommendedMovies }] = useLazyGetRecommendationsQuery();
  const showSpinner = isFetching || isLoading;
  useEffect(() => {
    if (hasFetchedRecommendations || !session || movies.length === 0) {
      return;
    }
    setHasFetchedRecommendations(true);
    trigger({ session, movies });
  }, [session, movies, hasFetchedRecommendations, trigger]);

  return (
    <div className={styles.recommendationsContainer}>
      <div className={styles.refreshContainer}>
        <h4>Your recommended movies</h4>
        <Button
          kind="ghost"
          renderIcon={Renew32}
          hasIconOnly
          disabled={showSpinner}
          tooltipPosition="left"
          iconDescription="Refresh recommendations"
          onClick={() => {
            setHasFetchedRecommendations(false);
          }}
        />
      </div>
      {showSpinner ? (
        <div className={movieliststyles.loadingContainer}>
          <InlineLoading description="Loading..." />
        </div>
      ) : null}
      <div className={movieliststyles.movieList}>
        {(recommendedMovies || []).map((item) => (
          <div key={item.movieid}>
            <MovieDetails
              movieid={item.movieid}
              overview={item.overview}
              posterurl={item.posterurl}
              title={item.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
