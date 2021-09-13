/** ****************************************************
 *
 *  OCO SOURCE MATERIALS
 *
 *  IBM CONFIDENTIAL (IBM CONFIDENTIAL-RESTRICTED when combined with the
 *                    Aggregated OCO Source Modules for this Program)
 *
 *  Source File Name = ibm-cloud-cognitive-cdai.d.ts
 *
 *  Descriptive Name = Code for debugger support.
 *
 *  Copyright = 5737-K73 (c) Copyright IBM Corp 2020
 *              Licensed Materials - Program Property of IBM
 */

declare module '@carbon/ibm-cloud-cognitive-cdai/es/components/IdeHTTPErrors/IdeHTTPErrors' {
  interface IdeHTTPErrorsProps {
    background: 403 | 404;
    description: string;
    details: string;
    title: string;
    links: {
      text: string;
      url: string;
    }[];
  }
  // eslint-disable-next-line import/no-default-export
  export default function IdeHTTPErrors(props: IdeHTTPErrorsProps);
}

declare module '@carbon/ibm-cloud-cognitive-cdai/es/components/IdeEmptyState/IdeEmptyState' {
  interface IdeEmptyStateProps {
    body: string;
    button?: {
      kind: 'primary' | tertiary;
      onClick: () => void;
      text: string;
    };
    image: {
      alt: string;
      className?: string;
      src: string;
    };
    format?: 'lg' | 'sm';
    title: string;
  }
  // eslint-disable-next-line import/no-default-export
  export default function IdeEmptyState(props: IdeEmptyStateProps);
}

declare module '@carbon/ibm-cloud-cognitive-cdai/es/components/IdeSlideOverPanel/IdeSlideOverPanel' {
  interface IdeSlideOverPanelProps {
    className?: string;
    size?: 'small' | 'medium' | 'large';
    title?: string;
    open?: boolean;
    onClose?: () => void;
    children?: false | JSX.Element;
    withOverlay?: boolean;
    controls?: boolean;
    danger?: boolean;
    closeButtonIconDescription?: string;
    focusTrapOptions?: {
      escapeDeactivates?: boolean;
      delayInitialFocus?: boolean;
      initialFocus?: string;
      onDeactivate?: () => void;
      setReturnFocus?: string;
      fallbackFocus?: string;
      checkCanFocusTrap?: (trapContainers: HTMLElement[]) => Promise<void[]>;
    };
  }
  // eslint-disable-next-line import/no-default-export
  export default function IdeSlideOverPanel(props: IdeSlideOverPanelProps);
}
