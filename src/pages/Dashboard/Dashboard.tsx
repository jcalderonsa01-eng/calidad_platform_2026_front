import { NavigationMenu } from "./Components/NavigationMenu";
import { Outlet } from "react-router-dom";

export function Dashboard() {
    return (
        // Quitamos cualquier scroll global. flex-col permite que el main crezca
        <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden">
            <NavigationMenu />

            {/* flex-1 hace que el contenido ocupe todo el alto restante. 
                overflow-hidden es vital aquí para que el scroll solo ocurra dentro del PDF */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
}