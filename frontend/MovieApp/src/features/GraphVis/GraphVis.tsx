import { compressToEncodedURIComponent } from 'lz-string';
import { useLocation, Redirect } from 'react-router-dom';

const REACT_APP_GRAPH_CONNECTION = process.env.REACT_APP_GRAPH_CONNECTION || 'film';
const REACT_APP_GRAPH_NAME = process.env.REACT_APP_GRAPH_NAME || 'film';
const REACT_APP_GRAPH_SERVER = process.env.REACT_APP_GRAPH_SERVER || 'localhost';
const REACT_APP_GRAPH_PORT = process.env.REACT_APP_GRAPH_PORT || '3000';

type AvailableQueries = 'SamePrductionSameGenre';

const makeQueries = (type: AvailableQueries, movieid: number) => {
  const queryObj: { query: string; transforms: unknown[] } = {
    query: '',
    transforms: [],
  };
  if (type === 'SamePrductionSameGenre') {
    queryObj.query = `V().has('DB2INST1.MOVIES', 'MOVIEID', ${movieid}).as('movie').out('DB2INST1.MOVIE_GENRES').as('g').in().where(eq('movie')).out('DB2INST1.MOVIE_PRODUCTION_COMPANIES').in().as('movies').where(__.as('movies').out('DB2INST1.MOVIE_GENRES').as('g')).select('movies').limit(50)`;
    queryObj.transforms = [
      {
        operation: 'adjustColour',
        maxValue: 0,
        minValue: 0,
        colour: '#9013FE',
        group: 'DB2INST1.MOVIES',
        property: 'MOVIEID',
        symbol: '=',
        type: 'vertex',
        val: movieid,
      },
      {
        operation: 'adjustLabel',
        maxValue: 0,
        minValue: 0,
        colour: '#cecece',
        group: 'DB2INST1.MOVIES',
        property: 'TITLE',
        symbol: '',
        type: 'vertex',
        val: 0,
      },
      {
        operation: 'adjustLabel',
        maxValue: 0,
        minValue: 0,
        colour: '#cecece',
        group: 'DB2INST1.MOVIE_GENRES',
        property: 'NAME',
        symbol: '',
        type: 'vertex',
        val: 0,
      },
    ];
  }
  const compressed = compressToEncodedURIComponent(JSON.stringify(queryObj));
  return compressed;
};

type LocationState = {
  movieid: number;
  query: AvailableQueries;
};

export const GraphVis = () => {
  const location = useLocation<LocationState>();
  if (!location?.state?.query && location?.state?.movieid) {
    return <Redirect to="/" />;
  }
  const query = makeQueries(location.state.query, location.state.movieid);
  const src = `https://${REACT_APP_GRAPH_SERVER}:${REACT_APP_GRAPH_PORT}/graphs/query/${REACT_APP_GRAPH_CONNECTION}/${REACT_APP_GRAPH_NAME}?savedQuery=${query}&embedMode=1`;
  return (
    <iframe
      title="Graph Visualization"
      width="100%"
      height="100%"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-downloads allow-modals allow-top-navigation-by-user-activation"
      src={src}
    />
  );
};
