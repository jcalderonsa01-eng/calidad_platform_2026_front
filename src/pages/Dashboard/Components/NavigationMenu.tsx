import { Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import { Button } from "../../../components/ui/button";
import { LogOut, FileUp, FileSearch, History, UserCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

import { useNavigate } from "react-router-dom";

export function NavigationMenu() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login"); // Redirección programática tras limpiar el estado
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };
    const menuItems = [
        { path: '/dashboard/upload', label: 'Cargar documento', icon: <FileUp className="w-4 h-4 mr-2" /> },
        { path: '/dashboard/compare', label: 'Comparar documento', icon: <FileSearch className="w-4 h-4 mr-2" /> },
        { path: '/dashboard/history', label: 'Historial de registro', icon: <History className="w-4 h-4 mr-2" /> },
    ];

    return (
        <nav className="w-full flex items-center justify-between px-8 py-4 bg-white">
            {/* Grupo de botones central/izquierdo */}
            <div className="flex items-center gap-6">
                {menuItems.map((item) => (
                    <NavLink key={item.path} to={item.path}>
                        {({ isActive }) => (
                            <Button
                                variant="outline"
                                className={`
                  rounded-lg px-6 py-2 h-auto text-sm font-semibold transition-all
                  ${isActive
                                        ? "bg-black text-white hover:bg-black/90 hover:text-white border-black"
                                        : "bg-white text-black border-black hover:bg-gray-50"}
                `}
                            >
                                {item.label}
                            </Button>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Icono de Usuario y Menú Desplegable */}
            <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 rounded-full transition-opacity hover:opacity-80">
                            <UserCircle className="w-10 h-10 text-black stroke-[1.5]" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="mt-2 w-48">
                        <div className="px-2 py-1.5 text-xs text-gray-500 font-medium">
                            Conectado como: <br />
                            <span className="text-black text-sm">{user?.username}</span>
                        </div>
                        <div className="h-px bg-gray-100 my-1" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-600 cursor-pointer flex items-center font-medium focus:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}