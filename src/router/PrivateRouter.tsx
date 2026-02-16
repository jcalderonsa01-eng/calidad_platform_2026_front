import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

export const PrivateRouter = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div>Cargando...</div>;
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}