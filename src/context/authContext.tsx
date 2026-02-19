import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/apiConfig";

interface User {
    id: number;
    username: string;
    role?: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    loginState: (userData: User) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar sesión al cargar la app o refrescar (F5)
    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await api.get("/auth/verify");
                setUser(response.data.user);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        verifySession();
    }, []);

    const loginState = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
            setUser(null);
            localStorage.removeItem("isLoggedIn"); // Marca opcional para el router
            localStorage.removeItem("token");
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            loginState,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
};