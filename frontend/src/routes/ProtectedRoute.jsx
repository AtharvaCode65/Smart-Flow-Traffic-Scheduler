import { Navigate, useLocation } from 'react-router-dom';
// Authentication is not implemented by the C++ backend yet. allowDevelopment
// keeps the educational dashboard usable while retaining a future auth boundary.
export default function ProtectedRoute({ children, allowDevelopment = true, isAuthenticated = false }) { const location = useLocation(); return allowDevelopment || isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />; }
