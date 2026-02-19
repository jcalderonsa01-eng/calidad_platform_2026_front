import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/apiConfig"
import { Button } from "../../components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useAuth } from "../../context/authContext"

export function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { loginState, isAuthenticated, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate, isAuthenticated, authLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('isLoggedIn', 'true');
            }

            loginState(response.data.user || { username: response.data.username });

            // 3. Navegamos al dashboard
            navigate('/dashboard');
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Login fallido. Verifica tus credenciales.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    // Si el AuthProvider aún está verificando la cookie, mostramos un loader
    if (authLoading) return <div className="flex h-screen items-center justify-center">Verificando...</div>;

    return (
        <section className="h-screen w-screen flex flex-cols items-center justify-center">
            <Card className="shadow-2xl inset-shadow-neutral-200 shadow-green-600">
                <CardHeader>
                    <CardTitle>Iniciar sesión</CardTitle>
                </CardHeader>
                <CardContent>
                    <form id="login-form" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                {/* CAMBIO: Label actualizado a Username */}
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Tu usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button form="login-form" type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                </CardFooter>
            </Card>
        </section>
    )
}