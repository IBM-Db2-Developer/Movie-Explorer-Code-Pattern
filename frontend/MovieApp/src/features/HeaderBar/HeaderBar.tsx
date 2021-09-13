import { Header, HeaderName, HeaderNavigation, HeaderMenuItem } from 'carbon-components-react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { getHasRatedMovies } from '../../redux/reducers/ratings';
import styles from './headerbar.module.scss';

export const HeaderBar = () => {
  const hasRatedMovies = useSelector(getHasRatedMovies);
  const location = useLocation();
  const movieApp = 'IBM Db2 Movie Recommender';
  const linkToHome = '/';
  const linkToRecommendations = '/recommendations';
  return (
    <Header className={styles.name} aria-label={movieApp}>
      <HeaderName prefix="" element={Link} to={linkToHome}>
        {movieApp}
      </HeaderName>
      <HeaderNavigation aria-label={movieApp}>
        <HeaderMenuItem isCurrentPage={location.pathname === linkToHome} element={Link} to={linkToHome}>
          Find Movies
        </HeaderMenuItem>

        <HeaderMenuItem
          className={cx({ [styles.disabledLink]: !hasRatedMovies })}
          isCurrentPage={location.pathname === linkToRecommendations}
          element={Link}
          to={linkToRecommendations}
        >
          Find Recommendations
        </HeaderMenuItem>
      </HeaderNavigation>
    </Header>
  );
};
