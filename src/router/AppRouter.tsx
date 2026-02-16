import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Auth/Login.tsx';
import { Dashboard } from '../pages/Dashboard/Dashboard.tsx';
import { PrivateRouter } from "./PrivateRouter.tsx";
import { useAuth } from '../context/authContext.tsx';
import CompareDocument from '../pages/Dashboard/compare_document.tsx';
import UploadDocument from '../pages/Dashboard/upload_document.tsx';
import RecordFiles from '../pages/Dashboard/record_files.tsx';

export const AppRouter = () => {
    const { isAuthenticated } = useAuth();
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública para autenticación */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />

                {/* Ruta protegida para el Dashboard */}
                {/* Grupo de rutas protegidas bajo el Layout */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRouter>
                            <Dashboard />
                        </PrivateRouter>
                    }
                >
                    {/* Rutas anidadas: la URL será /dashboard/upload, etc. */}
                    <Route index element={<Navigate to="upload" />} /> {/* Redirección por defecto */}
                    <Route path="upload" element={<UploadDocument />} />
                    <Route path="compare" element={<CompareDocument />} />
                    <Route path="history" element={<RecordFiles />} />
                </Route>


                {/* Redirección por defecto */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
};