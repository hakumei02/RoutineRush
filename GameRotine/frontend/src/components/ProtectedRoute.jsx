import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = () => {
  const auth = isAuthenticated();
  console.log('ProtectedRoute: isAuthenticated =', auth);
  return auth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;