import style from './poster.module.scss';

type PosterProps = {
  posterurl?: string;
  title: string;
};

const baseImgURL = 'https://image.tmdb.org/t/p/w500';

export const Poster = ({ posterurl, title }: PosterProps) => {
  if (!posterurl) {
    return <span className={style.missingPoster} />;
  }
  const imgURL = posterurl ? `${baseImgURL}${posterurl}` : '';
  return <img src={imgURL} alt={`Poster for ${title}`} width="96px" />;
};
Poster.defaultProps = {
  posterurl: null,
};
