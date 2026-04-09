import React from 'react';

const Card = ({
  children,
  className = '',
  interactive = false,
  padded = true,
  as: Component = 'div',
  ...props
}) => {
  const classes = [
    'ui-card',
    padded ? 'is-padded' : '',
    interactive ? 'is-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Card;
