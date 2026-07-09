import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PropTypes from "prop-types";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth(); // Removed loading for now as we don't have async check yet

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {};

export default ProtectedRoute;
