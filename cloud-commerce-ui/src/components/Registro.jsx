import React, {useState} from "react";
import { apiService } from "../services/apiService";
import { UserPlus, User, Mail, Lock, Phone, MapPin,
    AlertCircle, CheckCircle, XCircle } from 'lucide-react';
    
    export const Registro = ({onRegisterSuccess, onGoToLogin}) => {

        const [nombre, setNombre] = useState('');
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [rol] = useState('ROLE_CLIENTE'); // el registro público siempre crea cuentas de Cliente
        const [direccion, setDireccion] = useState('');
        const [telefono, setTelefono] = useState('');
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');
        const [loading, setLoading] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setSuccess('');
            setLoading(true);
            
            const payload = {
                username,
                password,
                nombre,
                rol,    
                direccion: rol === 'ROLE_CLIENTE' ? direccion : null,
                telefono: rol === 'ROLE_CLIENTE' ? telefono : null
            };

            try{
                await apiService.registro(payload);
                setSuccess('¡Registro completado con éxito! Ahora puedes iniciar sesión.');
                setTimeout(() => {
                    onRegisterSuccess();
                }, 2000);
            }catch(err){
                setError(err.message || 'Error al completar el registro. Intenta con otro correo.');
            }finally{
                setLoading(false);
                
            }
        };


        return(
             <div className="font-auth max-w-lg w-full mx-auto my-12 bg-white
        rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-700
            px-6 py-6 text-center text-white">
            <h2 className="text-2xl font-bold">Crear una Cuenta</h2>
            <p className="text-rose-200 mt-1 text-sm">Únete a
                MercaditoLibre hoy mismo</p>

        </div>

        <form onSubmit={handleSubmit} className="px-6 py-8 space-y-4">
            {error && (
                <div className="bg-red-50 text-red-700 p-4  rounded-xl flex items-start gap-2.5 border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-start gap-2.5 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{success}</span>
                </div>
            )}

            {/*Nombre Completo*/}

    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
        <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-rose-600"
                placeholder="Tu nombre completo"
            />
        </div>
    </div>

    {/*Correo electrónico*/}

    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
        <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-rose-600"
                placeholder="tucorreo@ejemplo.com"
            />
        </div>
    </div>

    {/*Contraseña*/}

    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-rose-600"
                placeholder="Minimo 6 caracteres"
                minLength={6}
            />
        </div>
    </div>
    {/*Campos para el cliente*/}

    {rol === 'ROLE_CLIENTE' && (
        <div className="space-y-4 border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Información Adicional</h3>

        
   

    {/*Teléfono de contacto*/}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de contacto</label>
        <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required={rol === 'ROLE_CLIENTE'}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-rose-600"
                placeholder="55 1234 5678"
            />
        </div>
    </div>

    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required={rol === 'ROLE_CLIENTE'}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-rose-600"
                placeholder="Calle, número, colonia"
            />
        </div>
    </div>
    </div>
)}

 {/*Boton Registrarse*/}

    <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-800 to-pink-700
        hover:from-rose-900 hover:to-pink-800 text-white font-semibold py-2.5 rounded-lg transition-all"
    >
        <UserPlus className="w-5 h-5" />
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
    </button>

    {/*ir al login*/}
    <div className="text-center text-sm text-gray-500 border-gray-100 pt-5">
        ¿Ya tienes una cuenta?{' '}
        <button
        type="button"
        onClick={onGoToLogin}
        className="text-rose-600 hover:underline font-bold"
        >
            Inicia sesión
        </button>
    </div>
       
    
</form>

        </div>
        )
    }
