import React, { useEffect, useState } from 'react';
import '../styles/toast.css';
import { TOAST_EVENT_NAME } from '../services/notificationService';

const DEFAULT_TOAST = {
  icon: '🛒',
  message: 'Added to cart!',
  subtext: 'Item ready for checkout',
  visible: false,
};

const Toast = () => {
  const [toast, setToast] = useState(DEFAULT_TOAST);

  useEffect(() => {
    let hideTimer;

    const handleToast = (event) => {
      const nextToast = {
        icon: event?.detail?.icon || DEFAULT_TOAST.icon,
        message: event?.detail?.message || DEFAULT_TOAST.message,
        subtext: event?.detail?.subtext || DEFAULT_TOAST.subtext,
        visible: true,
      };

      window.clearTimeout(hideTimer);
      setToast(nextToast);

      hideTimer = window.setTimeout(() => {
        setToast((currentToast) => ({ ...currentToast, visible: false }));
      }, 2600);
    };

    window.addEventListener(TOAST_EVENT_NAME, handleToast);

    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener(TOAST_EVENT_NAME, handleToast);
    };
  }, []);

  return (
    <div className={`toast${toast.visible ? ' show' : ''}`}>
      <div className="toast-icon">{toast.icon}</div>
      <div>
        <div className="toast-msg">{toast.message}</div>
        <span className="toast-sub">{toast.subtext}</span>
      </div>
    </div>
  );
};

export default Toast;
