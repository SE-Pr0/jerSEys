import React from 'react';

const StateBlock = ({
  icon = '...',
  title,
  description,
  actions,
  centered = false,
}) => {
  return (
    <div className={`ui-state-block${centered ? ' centered' : ''}`}>
      <div className="ui-state-icon" aria-hidden="true">
        {icon}
      </div>
      {title ? <div className="ui-state-title">{title}</div> : null}
      {description ? <p className="ui-state-description">{description}</p> : null}
      {actions ? <div className="ui-state-actions">{actions}</div> : null}
    </div>
  );
};

export default StateBlock;
