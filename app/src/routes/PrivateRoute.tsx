import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'associado';
}

export default function PrivateRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'associado' ? '/portal' : '/'} replace />;
  }

  if (!requiredRole && user?.role === 'associado' && !location.pathname.startsWith('/portal')) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
}
