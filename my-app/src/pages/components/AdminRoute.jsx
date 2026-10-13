import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AdminRoute() {
    const { user } = useSelector((state) => state.auth);

    // Must be logged in and have admin privileges
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.isAdmin !== true) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default AdminRoute;