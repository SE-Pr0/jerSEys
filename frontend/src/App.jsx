import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './router';
import CustomCursor from './components/CustomCursor';
import Loader from './components/Loader';
import ScrollToTop from './components/ScrollToTop';
import Toast from './components/Toast';
import { TradeProvider } from './context/TradeContext';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <CustomCursor />
      {isLoading && <Loader />}
      <Toast />
      <BrowserRouter>
        <TradeProvider>
          <ScrollToTop />
          <Router />
        </TradeProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
