import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

export const MenuContext = createContext(); // ✅ named export

export const MenuProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // ✅ Add this

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/products');
      console.log('✅ Fetched products:', res.data);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <MenuContext.Provider value={{ products, loading, error, fetchProducts }}>
      {children}
    </MenuContext.Provider>
  );
};

// ✅ Custom hook
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};