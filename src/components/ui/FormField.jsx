import React from 'react';

const FormField = ({
  label,
  hint,
  error,
  htmlFor,
  children,
  action,
}) => {
  return (
    <div className="ui-form-field">
      {(label || action) && (
        <div className="ui-form-label-row">
          {label ? (
            <label className="ui-form-label" htmlFor={htmlFor}>
              {label}
            </label>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
      {error ? (
        <div className="ui-form-error">{error}</div>
      ) : hint ? (
        <div className="ui-form-hint">{hint}</div>
      ) : null}
    </div>
  );
};

export default FormField;
