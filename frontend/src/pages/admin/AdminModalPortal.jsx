import React from 'react';
import { createPortal } from 'react-dom';

const AdminModalPortal = ({ children }) => {
  if (typeof document === 'undefined') {
    return children;
  }

  return createPortal(children, document.body);
};

export default AdminModalPortal;
