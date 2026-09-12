import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ allowedRoles }) {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mb-4"></div>
                <p className="text-gray-500 font-medium">Vérification de la session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Redirection vers le bon tableau de bord selon son vrai rôle
        if (user?.role === "admin") {
            return <Navigate to="/admin" replace />;
        }
        if (user?.role === "vendeur" || user?.role === "producteur") {
            return <Navigate to="/vendeur" replace />;
        }
        return <Navigate to="/acheteur" replace />;
    }

    return <Outlet />;
}
