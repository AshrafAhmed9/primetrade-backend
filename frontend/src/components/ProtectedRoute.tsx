import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
}


const ProtectedRoute = ({ children, adminOnly = false }: Props) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/login" replace />;

  const user = JSON.parse(userStr);
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
