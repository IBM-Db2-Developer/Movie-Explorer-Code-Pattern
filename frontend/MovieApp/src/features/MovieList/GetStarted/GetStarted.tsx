import styles from './getstarted.module.scss';

type GetStartedProps = {
  open: boolean;
};

export const GetStarted = ({ open }: GetStartedProps) => {
  if (!open) {
    return null;
  }
  return (
    <div className={styles.container}>
      <p>
        Search and rate movies, then click Find Recommendations to view movies we think you would like.
        <br />
        The more you rate, the better the predictions will be.
      </p>
      <br />
      <p>
        To remove a movie rating, click it&apos;s current rating symbol. Or, click the trash icon in the lower right.
      </p>
      <br />
      <p>Next to each movies rating, you can explore movies with the same genres by the same production companies.</p>
    </div>
  );
};
