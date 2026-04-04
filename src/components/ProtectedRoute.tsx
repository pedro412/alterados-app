import { Navigate } from 'react-router';
import type { Profile } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  loading: boolean;
}

export function ProtectedRoute({ children, isAuthenticated, loading }: ProtectedRouteProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

interface AdminRouteProps {
  children: React.ReactNode;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function AdminRoute({ children, profile, loading, isAuthenticated }: AdminRouteProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
