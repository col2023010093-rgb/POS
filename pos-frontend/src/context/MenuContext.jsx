import React, { createContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [products, setProducts] = useState([]);  // ← Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.getProducts();
        setProducts(response.data || []);  // ← Ensure it's an array
      } catch (error) {
        console.error('Failed to fetch menu:', error);
        setError(error.message);
        setProducts([]);  // ← Default to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <MenuContext.Provider value={{ products, loading, error }}>
      {children}
    </MenuContext.Provider>
  );
};