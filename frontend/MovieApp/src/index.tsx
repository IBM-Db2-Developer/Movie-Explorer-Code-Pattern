import './carbon.css';
import './app.scss';
import { memo } from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from './redux';
import { getState } from './redux/stateHelpers';
import { App } from './App';

const initialState = getState();
const store = createStore(initialState);

const BaseApp = ({ children }: { children: React.ReactChild }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};

const render = (Component: React.FC): void => {
  const MemoComp = memo(Component);
  ReactDom.render(
    <BaseApp>
      <MemoComp />
    </BaseApp>,
    document.getElementById('root'),
  );
};

const spinner = document.querySelector('#startspinner');

if (spinner) {
  spinner?.parentNode?.removeChild(spinner);
}

render(App);
