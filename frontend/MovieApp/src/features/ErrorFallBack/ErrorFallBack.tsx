import { createPortal } from 'react-dom';
import { FallbackProps } from 'react-error-boundary';
import IdeEmptyState from '@carbon/ibm-cloud-cognitive-cdai/es/components/IdeEmptyState/IdeEmptyState';
import EmptyErrorBright from '../../images/empty-state-bright-error.svg';
import styles from './errorfallback.module.scss';

export function ErrorFallBack({ error }: FallbackProps) {
  const message = error?.message ?? '';

  return createPortal(
    <div className={styles.errorContainer} role="alert">
      <IdeEmptyState
        title="An unexpected error has occured"
        body={message}
        image={{
          src: EmptyErrorBright,
          alt: 'unxpected error',
        }}
        button={{
          kind: 'primary',
          text: 'Reload',
          onClick: () => {
            window.location.reload();
          },
        }}
      />
    </div>,
    document.body,
  );
}
