import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
