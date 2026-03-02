import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HeaderGuest from './Components/shared/HeaderGuest';
import Bottomnav from './Components/shared/Bottomnav';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Menu from './pages/Menu';
import About from './pages/About';
import Reservation from './pages/Reservation';
import Checkout from './pages/checkout';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminUsers from './pages/AdminDashboard/AdminUsers';
import AdminProducts from './pages/AdminDashboard/AdminProducts';
import './App.css';
import { CartProvider } from './context/CartContext';
import Contact from './pages/Contact/Contact';
import Profile from './pages/Profile/Profile';
import SignUpWithVerification from './pages/SignUpWithVerification';


function AppWrapper() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const hideHeader = location.pathname === '/login';

  return (
    <>
      {!hideHeader && <HeaderGuest />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> 
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reservations" 
          element={
            <ProtectedRoute>
              <Reservation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/products" 
          element={
            <ProtectedRoute>
              <AdminProducts />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Bottomnav />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <AppWrapper />
      </Router>
    </div>
  )
}

export default App;