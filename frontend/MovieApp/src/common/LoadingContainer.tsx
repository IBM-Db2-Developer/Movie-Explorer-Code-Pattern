import { useState, useEffect } from 'react';
import { Loading } from 'carbon-components-react';
import styles from './common.module.scss';

type LoadingContainerProps = {
  delay?: number;
  small?: boolean;
  withOverlay?: boolean;
  showText?: boolean;
};
export const LoadingContainer = ({
  delay = 100,
  small = true,
  withOverlay = false,
  showText = true,
}: LoadingContainerProps) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, delay);
    return function cleanup() {
      clearTimeout(timeout);
    };
  }, [delay]);

  if (!showLoader) {
    return <></>;
  }
  return (
    <div className={styles.loadingContainer}>
      <Loading id="loader" active withOverlay={withOverlay} description="Loading" small={small} />
      {showText && 'Loading...'}
    </div>
  );
};

LoadingContainer.defaultProps = {
  delay: 100,
  small: true,
  withOverlay: false,
  showText: true,
};
