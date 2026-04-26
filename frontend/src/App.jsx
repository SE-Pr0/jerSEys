import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './router';
import CustomCursor from './components/CustomCursor';
import Loader from './components/Loader';
import ScrollToTop from './components/ScrollToTop';
import Toast from './components/Toast';
import { TradeProvider } from './context/TradeContext';
import { getCurrentUser, logoutUser } from './services/authService';
import { getStoredToken } from './utils/auth';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1700);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isActive = true;

    const hydrateAuth = async () => {
      if (!getStoredToken()) {
        if (isActive) {
          setIsAuthReady(true);
        }
        return;
      }

      try {
        await getCurrentUser();
      } catch {
        logoutUser();
      } finally {
        if (isActive) {
          setIsAuthReady(true);
        }
      }
    };

    hydrateAuth();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <CustomCursor />
      {isLoading && <Loader />}
      <Toast />
      <BrowserRouter>
        <TradeProvider>
          <ScrollToTop />
          {isAuthReady ? <Router /> : null}
        </TradeProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
