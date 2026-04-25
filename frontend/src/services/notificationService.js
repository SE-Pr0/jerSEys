const TOAST_EVENT_NAME = 'jerseys-toast';

export const showToast = ({
  icon = 'Cart',
  message = 'Added to cart!',
  subtext = 'Item ready for checkout',
} = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT_NAME, {
      detail: {
        icon,
        message,
        subtext,
      },
    })
  );
};

export { TOAST_EVENT_NAME };
