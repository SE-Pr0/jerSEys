import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import NotFound from './pages/NotFound';
import TradeMarketplace    from './pages/TradeMarketplace';
import TradeListingDetails from './pages/TradeListingDetails';
import TradeRequests       from './pages/TradeRequests';
import CreateTradeListing  from './pages/CreateTradeListing';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:productId" element={<ProductDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="order-history" element={<OrderHistory />} />
        <Route path="trade"            element={<TradeMarketplace />} />
        <Route path="trade/marketplace" element={<Navigate to="/trade" replace />} />
        <Route path="trade/requests"   element={<TradeRequests />} />
        <Route path="trade/create"     element={<CreateTradeListing />} />
        <Route path="trade/:listingId" element={<TradeListingDetails />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Router;
