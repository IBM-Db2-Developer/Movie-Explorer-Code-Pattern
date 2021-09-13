import { useSelector } from 'react-redux';
import { Tag, Button } from 'carbon-components-react';
import { Recommend32 } from '@carbon/icons-react';
import { useHistory } from 'react-router-dom';
import { useGenresForMovieQuery } from '../../../redux/services/genres';
import { useProductionCompaniesForMovieQuery } from '../../../redux/services/productionCompanies';
import { getSessionSelector } from '../../../redux/reducers/auth';
import { StarRating } from './StarRating';
import { Poster } from './Poster';
import styles from './moviedetails.module.scss';

export type MovieDetailsProps = {
  movieid: number;
  overview: string;
  posterurl?: string;
  title: string;
};

export const MovieDetails = ({ movieid, overview, posterurl, title }: MovieDetailsProps) => {
  const history = useHistory();
  const session = useSelector(getSessionSelector);
  const { data: genres } = useGenresForMovieQuery({ movieid, session }, { skip: !session });
  const { data: productionCompanies } = useProductionCompaniesForMovieQuery({ movieid, session }, { skip: !session });
  const tagInfo = genres || [];
  return (
    <div className={styles.card}>
      <Poster title={title} posterurl={posterurl} key={movieid} />
      <div className={styles.details}>
        <h3>{title}</h3>
        <h5>{productionCompanies?.join(', ') ?? ''}</h5>
        <div className={styles.tagContainer}>
          {tagInfo.map((t) => (
            <Tag key={t.id} type={t.colour} size="sm">
              {t.id}
            </Tag>
          ))}
        </div>
        <p>{overview}</p>
        <div className={styles.starContainer}>
          <StarRating movieid={movieid} title={title} overview={overview} posterurl={posterurl} />
          <Button
            kind="ghost"
            renderIcon={Recommend32}
            hasIconOnly
            iconDescription="Explore similar movies"
            onClick={() => {
              history.push('/graphvis', {
                query: 'SamePrductionSameGenre',
                movieid,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

MovieDetails.defaultProps = {
  POSTERURL: '',
};
