import type { CSSProperties, FC, MouseEvent, PropsWithChildren, ReactElement } from 'react';
import React from 'react';

export type ButtonProps = PropsWithChildren<{
  className?: string;
  disabled?: boolean;
  endIcon?: ReactElement;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  startIcon?: ReactElement;
  style?: CSSProperties;
  tabIndex?: number;
}>;

const classNameDefault =
  'c98-border c98-border-[#333] c98-p-3 c98-rounded-xl c98-bg-[#fdd05a] c98-text-[#333] hover:c98-bg-[#fdbe1d] c98-duration-300 c98-font-bold c98-cursor-pointer c98-text-[18px]';
const classNameStartIconDefault = '';
const classNameEndIconDefault = '';

export const Button: FC<ButtonProps> = props => {
  return (
    <button
      className={`${classNameDefault}  ${props.className || ''}`}
      disabled={props.disabled}
      style={props.style}
      onClick={props.onClick}
      tabIndex={props.tabIndex || 0}
      type="button"
    >
      {props.startIcon && <i className={classNameStartIconDefault}>{props.startIcon}</i>}
      {props.children}
      {props.endIcon && <i className={classNameEndIconDefault}>{props.endIcon}</i>}
    </button>
  );
};
