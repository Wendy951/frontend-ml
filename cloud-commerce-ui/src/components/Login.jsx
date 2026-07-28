import React,{useState} from "react";
import { apiService } from "../services/apiService";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";


export const Login = ({onLoginSuccess, onGoToRegister}) => {
    const [username,setUsername] =useState('');
    const [password,setPassword] =useState('');
    const [error,setError] = useState('');
    const [loading,setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try{
            const data = await apiService.login(username,password);
            onLoginSuccess(data);
        }catch(err){
            setError(err.message || 
                'Credenciales invalidad.Verifica tu correo o pass');
        }finally{
            setLoading(false);
        }
    };

        return(
             <div className="font-auth max-w-lg w-full mx-auto my-12 bg-white
        rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-700
            px-6 py-6 text-center text-white">
            <h2 className="text-2xl font-bold">¡Bienvenido de nuevo!</h2>
            <p className="text-rose-200 mt-1 text-sm">Inicia sesion en tu cuenta de MercaditoLibre</p>

        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex 
                items-start gap-2.5 border border-red-200 text-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Campo de correo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="tucorreo@ejemplo.com"
                    />
                </div>
            </div>

            {/* Campo de contraseña */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="······"
                    />
                </div>
            </div>

            {/*boton de entrar*/}
            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-800 to-pink-700 hover:from-rose-900 hover:to-pink-800 text-white font-medium py-2.5 rounded-lg transition-all mt-2"
            >
                <LogIn className="w-5 h-5" />
                {loading ? 'Iniciando Sesión...' : 'Entrar'}
            </button>

            {/* Enlace al registro */}
            <div className="text-center text-sm text-gray-500 mt-4">
                ¿No tienes una cuenta?{' '}
                <button
                type="button"
                onClick={onGoToRegister}
                className="text-rose-600 font-hold hover:underline "
                >
                Regístrate ahora
                </button>
            </div>
        </form>
    </div>
        );
    }