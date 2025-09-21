import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'customer' | 'cleaner' | 'admin';
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  requiredRole,
  redirectTo = '/signin'
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && user) {
    // Redirect authenticated users away from auth pages
    return <Navigate to="/account" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const roleDashboards = {
      customer: '/account',
      cleaner: '/cleaner',
      admin: '/admin'
    };
    return <Navigate to={profile ? roleDashboards[profile.role] : '/signin'} replace />;
  }

  return <>{children}</>;
};