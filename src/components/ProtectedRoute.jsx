// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, token, isAuthenticated } = useAuth();

  if (!token) {
    return <Navigate to="/member/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/member/login" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { user, token } = useAuth();

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/member/login" replace />;
  }

  return children;
}
