import { createPortal } from 'react-dom';
import { TrashCan32 } from '@carbon/icons-react';
import { Button } from 'carbon-components-react';
import { useDispatch } from 'react-redux';
import { clearRatings } from '../../../redux/reducers/ratings';
import styles from './clearratings.module.scss';

type ClearRatingsProps = {
  visible: boolean;
};
export const ClearRatings = ({ visible }: ClearRatingsProps) => {
  const dispatch = useDispatch();
  if (!visible) {
    return null;
  }
  return createPortal(
    <div className={styles.clearRatings}>
      <Button
        kind="ghost"
        renderIcon={TrashCan32}
        hasIconOnly
        tooltipPosition="left"
        iconDescription="Clear all ratings"
        onClick={() => {
          dispatch(clearRatings());
        }}
      />
    </div>,
    document.body,
  );
};
