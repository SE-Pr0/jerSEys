import React from 'react';

const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
}) => {
  return (
    <header className={`ui-page-header${actions ? ' has-actions' : ''}`}>
      <div>
        {eyebrow && <div className="ui-page-eyebrow">{eyebrow}</div>}
        {title && <h1 className="ui-page-title">{title}</h1>}
        {description && <p className="ui-page-description">{description}</p>}
      </div>
      {actions ? <div className="ui-inline-stack">{actions}</div> : null}
    </header>
  );
};

export default PageHeader;
