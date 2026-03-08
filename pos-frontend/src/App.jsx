import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HeaderGuest from './Components/shared/HeaderGuest';
import AdminHeader from './Components/shared/AdminHeader';
import Bottomnav from './Components/shared/Bottomnav';
import ProtectedRoute from './Components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Menu from './pages/Menu';
import About from './pages/about';
import Reservation from './pages/reservation';
import Checkout from './pages/checkout';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminOrders from './pages/AdminDashboard/AdminOrders';
import AdminMenu from './pages/AdminDashboard/AdminMenu';
import AdminReservations from './pages/AdminDashboard/AdminReservations';
import AdminReports from './pages/AdminDashboard/AdminReports';
import AdminUsers from './pages/AdminDashboard/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import './App.css';
import { CartProvider } from './context/CartContext';
import Contact from './pages/Contact/Contact';
import Profile from './pages/Profile/Profile';
import SignUpWithVerification from './pages/SignUpWithVerification';
import { useAuth } from './context/AuthContext';  // ← ADD THIS

function AppWrapper() {
  const location = useLocation();
  const { user } = useAuth();  // ← ADD THIS

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const hideHeader   = location.pathname === '/login';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin      = user?.role === 'admin';  // ← ADD THIS

  // ── CHANGE THIS ONE LINE ──────────────────────────────────────────────────
  // Before: !hideHeader && (isAdminRoute ? <AdminHeader /> : <HeaderGuest />)
  // After:  check role, not just the path
  const showAdminHeader = !hideHeader && (isAdminRoute || isAdmin);

  return (
    <>
      {showAdminHeader ? <AdminHeader /> : (!hideHeader && <HeaderGuest />)}

      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/auth"         element={<Auth />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/menu"         element={<Menu />} />
        <Route path="/about"        element={<About />} />
        <Route path="/contact"      element={<Contact />} />
        <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders"       element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/checkout"     element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/reservations" element={<Reservation />} />

        <Route path="/admin/dashboard"    element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/orders"       element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/menu"         element={<ProtectedRoute><AdminMenu /></ProtectedRoute>} />
        <Route path="/admin/reservations" element={<ProtectedRoute><AdminReservations /></ProtectedRoute>} />
        <Route path="/admin/products"     element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/reports"      element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/users"        element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      </Routes>

      <Bottomnav />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <CartProvider>
          <AppWrapper />
        </CartProvider>
      </Router>
    </div>
  );
}

export default App;