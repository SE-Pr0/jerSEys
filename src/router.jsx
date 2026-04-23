import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';
import TradeMarketplace from './pages/TradeMarketplace';
import TradeListingDetails from './pages/TradeListingDetails';
import TradeRequests from './pages/TradeRequests';
import CreateTradeListing from './pages/CreateTradeListing';

const CustomJerseyBuilder = lazy(() => import('./pages/CustomJerseyBuilder'));

const Router = () => {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route
            path="customize"
            element={(
              <Suspense fallback={<div className="ui-page-shell">Loading builder...</div>}>
                <CustomJerseyBuilder />
              </Suspense>
            )}
          />
          <Route path="shop/:productId" element={<ProductDetails />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="trade" element={<TradeMarketplace />} />
          <Route path="trade/marketplace" element={<Navigate to="/trade" replace />} />
          <Route path="trade/requests" element={<TradeRequests />} />
          <Route path="trade/create" element={<CreateTradeListing />} />
          <Route path="trade/:listingId" element={<TradeListingDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {backgroundLocation ? (
        <Routes>
          <Route path="/cart" element={<Cart />} />
        </Routes>
      ) : null}

      {!backgroundLocation ? (
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="cart" element={<Cart />} />
          </Route>
        </Routes>
      ) : null}
    </>
  );
};

export default Router;
