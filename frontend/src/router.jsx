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
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import NotFound from './pages/NotFound';
import TradeMarketplace from './pages/TradeMarketplace';
import TradeListingDetails from './pages/TradeListingDetails';
import TradeRequests from './pages/TradeRequests';
import CreateTradeListing from './pages/CreateTradeListing';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManageInventory from './pages/admin/ManageInventory';
import ManageProducts from './pages/admin/ManageProducts';
import ManageTemplates from './pages/admin/ManageTemplates';
import SalesReports from './pages/admin/SalesReports';
import InventoryReports from './pages/admin/InventoryReports';

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
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/manage-users" element={<ManageUsers />} />
          <Route path="admin/manage-orders" element={<ManageOrders />} />
          <Route path="admin/manage-inventory" element={<ManageInventory />} />
          <Route path="admin/manage-products" element={<ManageProducts />} />
          <Route path="admin/manage-patterns" element={<ManageTemplates />} />
          <Route path="admin/sales-reports" element={<SalesReports />} />
          <Route path="admin/inventory-reports" element={<InventoryReports />} />
          <Route path="trade" element={<TradeMarketplace />} />
          <Route path="trade/marketplace" element={<Navigate to="/trade" replace />} />
          <Route path="trade/requests" element={<TradeRequests />} />
          <Route path="trade/create" element={<CreateTradeListing />} />
          <Route path="trade/:listingId" element={<TradeListingDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {backgroundLocation ? (
        <Routes>
          <Route path="/cart" element={<Cart />} />
        </Routes>
      ) : null}
    </>
  );
};

export default Router;
