import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireRole?: 'admin' | 'manager';
}

export function AdminProtectedRoute({ children, requireRole }: Props) {
  const { currentAdmin, isLoading } = useAdmin();

  if (isLoading) return null;
  if (!currentAdmin) return <Navigate to="/admin/login" replace />;
  if (requireRole && currentAdmin.role !== requireRole) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
