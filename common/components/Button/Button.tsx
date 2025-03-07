import React, { forwardRef } from 'react';

interface Props {
  onClick: () => void;
  onMouseEnter: () => void;
  title: string;
  className: string;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ onClick, onMouseEnter, title, className }, ref) => {
    return (
      <button
        ref={ref}
        className={className}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        {`( ${title} )`}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
