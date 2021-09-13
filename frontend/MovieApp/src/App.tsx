import { Suspense, lazy, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Content } from 'carbon-components-react';
import { LoadingContainer } from './common';
import { HeaderBar } from './features/HeaderBar';
import { ProtectedRoute } from './features/ProtectedRoute';
import { Logon } from './features/Logon';

const MovieList = lazy(() => import(/* webpackChunkName: "Features-MovieList" */ './features/MovieList'));
const GraphVis = lazy(() => import(/* webpackChunkName: "Features-GraphVis" */ './features/GraphVis'));

const Recommendations = lazy(
  () => import(/* webpackChunkName: "Features-Recommendations" */ './features/Recommendations'),
);

export const App = () => {
  useEffect(() => {
    function handleButtonClick(evt: MouseEvent) {
      if (evt.detail > 0) {
        const target = evt.target as HTMLButtonElement;
        if (target.tagName.toLowerCase() === 'button' || target.tagName.toLowerCase() === 'a') {
          target.blur();
          target.parentElement?.blur();
        }
      }
    }
    document.body.addEventListener('click', handleButtonClick);
    return () => document.body.removeEventListener('click', handleButtonClick);
  });

  return (
    <Suspense fallback={<LoadingContainer small={false} withOverlay />}>
      <HeaderBar />
      <Logon />
      <Content>
        <Switch>
          <Route exact path="/">
            <MovieList />
          </Route>
          <ProtectedRoute exact path="/recommendations">
            <Recommendations />
          </ProtectedRoute>
          <Route exact path="/graphvis">
            <GraphVis />
          </Route>
        </Switch>
      </Content>
    </Suspense>
  );
};
