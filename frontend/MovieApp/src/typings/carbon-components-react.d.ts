import * as carboncomponentsreact from 'carbon-components-react';

declare module 'carbon-components-react' {
  export interface HeaderNameProps extends carboncomponentsreact.HeaderNamePropsBase {
    to?: string;
    element?: any;
    prefix?: string;
  }
  export interface HeaderMenuItemProps extends carboncomponentsreact.HeaderMenuItemPropsBase {
    to: string;
    element: any;
    className?: string;
    disabled?: boolean;
  }

  export function HeaderMenuItem(props: HeaderMenuItemProps): FCReturn;

  export function HeaderName(props: HeaderNameProps): FCReturn;
}
