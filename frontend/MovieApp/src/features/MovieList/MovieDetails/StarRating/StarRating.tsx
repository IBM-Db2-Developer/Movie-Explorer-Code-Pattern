import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { getRatingForMovie, setRating, removeRating } from '../../../../redux/reducers/ratings';
import type { RootState } from '../../../../redux/root';
import styles from './starrating.module.scss';

type StarRatingProps = {
  movieid: number;
  title: string;
  overview: string;
  posterurl?: string;
};

const AVAILABLE_RATINGS = Array.from({ length: 5 })
  .map((item, idx) => ({
    id: `rating${idx + 1}`,
    value: idx + 1,
    title: `${idx + 1} stars`,
  }))
  .reverse();

export const StarRating = ({ movieid, title, overview, posterurl }: StarRatingProps) => {
  const currentRating = useSelector((state: RootState) => getRatingForMovie(state, movieid));
  const ratingContainer = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  function handleRadioClick(e: React.MouseEvent<HTMLInputElement>) {
    const input = e.currentTarget as HTMLInputElement;
    const rating = Number.parseInt(input.value, 10);
    if (rating === currentRating.rating) {
      dispatch(removeRating({ movieid }));
      return;
    }
    dispatch(
      setRating({
        movieid,
        title,
        overview,
        posterurl,
        rating,
      }),
    );
  }

  return (
    <div className={styles.starRating} ref={ratingContainer}>
      {AVAILABLE_RATINGS.map((ar) => (
        <label
          htmlFor={`${movieid}${ar.id}`}
          title={ar.title}
          key={ar.id}
          className={cx({ [styles.checkedLabel]: ar.value <= currentRating.rating })}
        >
          <input
            type="radio"
            id={`${movieid}${ar.id}`}
            name="rating"
            value={ar.value}
            defaultChecked={ar.value <= currentRating.rating}
            onClick={handleRadioClick}
          />
        </label>
      ))}
    </div>
  );
};

StarRating.defaultProps = {
  posterurl: null,
};
