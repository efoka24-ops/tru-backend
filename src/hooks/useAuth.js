// src/hooks/useAuth.js
import { useState, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://tru-backend-o1zc.onrender.com';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vérifier si un token valide existe au chargement
  useEffect(() => {
    if (token) {
      verifyTokenValidity();
    }
  }, []);

  const verifyTokenValidity = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Token invalide ou expiré
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        return false;
      }
      
      const data = await response.json();
      setUser(data.user);
      return true;
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      return false;
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser({
        memberId: data.member?.id,
        email: data.member?.email,
        role: data.account.role,
        name: data.member?.name
      });
      
      return { success: true, member: data.member };
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithCode = useCallback(async (loginCode, newPassword, confirmPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loginCode, newPassword, confirmPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login with code failed');
      }
      
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser({
        memberId: data.member?.id,
        email: data.member?.email,
        role: 'member',
        name: data.member?.name
      });
      
      return { success: true, member: data.member };
    } catch (err) {
      const errorMsg = err.message || 'Login with code failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Password change failed');
      }
      
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Password change failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    loginWithCode,
    changePassword,
    logout,
    verifyTokenValidity
  };
}
