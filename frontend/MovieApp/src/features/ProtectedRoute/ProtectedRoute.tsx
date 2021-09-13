import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getHasRatedMovies } from '../../redux/reducers/ratings';

export const ProtectedRoute = ({ children, ...rest }: RouteProps) => {
  const hasRatedMovies = useSelector(getHasRatedMovies);
  if (!hasRatedMovies) {
    return <Redirect to="/" />;
  }
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Route {...rest}>{children}</Route>;
};
