import React from 'react';
import '../styles/toast.css';

const Toast = ({
  icon = '🛒',
  message = 'Added to cart!',
  subtext = 'Item ready for checkout',
  visible = false,
}) => {
  return (
    <div className={`toast${visible ? ' show' : ''}`}> 
      <div className="toast-icon">{icon}</div>
      <div>
        <div className="toast-msg">{message}</div>
        <span className="toast-sub">{subtext}</span>
      </div>
    </div>
  );
};

export default Toast;
