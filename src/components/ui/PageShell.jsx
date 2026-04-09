import React from 'react';

const PageShell = ({ children, className = '', narrow = false }) => {
  const classes = `ui-page-shell${narrow ? ' is-narrow' : ''}${className ? ` ${className}` : ''}`;

  return (
    <section className={classes}>
      <div className="ui-page-stack">{children}</div>
    </section>
  );
};

export default PageShell;
