import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  className = '',
  href,
  to,
  type = 'button',
  variant = 'primary',
  block = false,
  ...props
}) => {
  const classes = `ui-button is-${variant}${block ? ' is-block' : ''}${className ? ` ${className}` : ''}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
