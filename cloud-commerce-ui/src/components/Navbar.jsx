import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { ShoppingCart, LogOut, User, LayoutDashboard, Database, ListOrdered, ShoppingBag, Shield, IdCard, MapPin, Phone, Settings } from 'lucide-react';

export const Navbar = ({ vistaActual, setVistaActual, user, onLogout, cartCount, openCart }) => {
  const [showPerfil, setShowPerfil] = useState(false);
  const perfilRef = useRef(null);

  const handleLogout = () => {
    apiService.logout();
    onLogout();
    setVistaActual('catalogo');
  };

  const isCliente = user && user.rol === 'ROLE_CLIENTE';
  const isAdmin = user && user.rol === 'ROLE_ADMIN';
  const rolLegible = isAdmin ? 'Administrador' : isCliente ? 'Cliente' : '';

  //Cerrar el panel de perfil al hacer click fuera de el
  useEffect(() => {
    const manejarClickFuera = (evento) => {
      if (perfilRef.current && !perfilRef.current.contains(evento.target)) {
        setShowPerfil(false);
      }
    };
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-rose-950 via-rose-900 to-rose-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setVistaActual('catalogo')}
          >
            <ShoppingBag className="h-8 w-8 text-rose-400 animate-pulse" />
            <span className="ml-2 font-bold text-lg">Mercadito Libre</span>
          </div>
          {/*Links de navegacion*/}
          <div className="flex items-centers spance-x-4">
            <button
           onClick={() => setVistaActual('catalogo')}
           className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-rose-800
           ${vistaActual === 'catalogo' ? 'bg-rose-800 font-bold border-b-2 border-white' : ''}`}>
              Catalago
            </button>

            {/*Botones para clientes*/}
            {isCliente && (
              <>
                 <button
           onClick={() => setVistaActual('miscompras')}
           className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-rose-800
           ${vistaActual === 'miscompras' ?
            'bg-rose-800 font-bold border-b-2 border-white' : ''}`}>
                <ListOrdered className="w-4 h-4"/>
                 Mis Compras
              </button>
              </>
            )}

             {/*Botones para admin*/}
            {isAdmin && (
              <>
                 <button
           onClick={() => setVistaActual('admin-panel')}
           className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-rose-800
           ${vistaActual === 'admin-panel' ?
            'bg-rose-800 font-bold border-b-2 border-white' : ''}`}>
                <ListOrdered className="w-4 h-4"/>
                 Admin Panel 
              </button>
              </>
            )}

             {/* Botón de carrito y loggeo */}
              {user ? (<>

    <div className="relative" ref={perfilRef}>
      <button
        onClick={() => setShowPerfil((prev) => !prev)}
        className="flex items-center text-sm font-medium
        bg-rose-800 px-3 py-1.5 rounded-full
        border border-rose-600 gap-1.5 max-w-[150px] truncate
        hover:bg-rose-700 transition-colors cursor-pointer">
        <User className="w-4 h-4 text-rose-300 flex-shrink-0"/>
        <span className="truncate">{user.nombre}</span>
      </button>

      {showPerfil && (
        <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800
        rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="bg-gradient-to-r from-rose-900 to-pink-700 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 border border-white/30">
                <User className="w-5 h-5 text-white"/>
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-rose-200">Mi Perfil</p>
                <p className="font-bold text-lg truncate">{user.nombre}</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <IdCard className="w-4 h-4 text-rose-700 flex-shrink-0"/>
              <span className="text-gray-500">Usuario:</span>
              <span className="font-medium truncate">{user.username}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-rose-700 flex-shrink-0"/>
              <span className="text-gray-500">Rol:</span>
              <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-rose-100 text-rose-800' : 'bg-pink-100 text-pink-800'
              }`}>
                {rolLegible}
              </span>
            </div>

            {user.telefono && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-rose-700 flex-shrink-0"/>
                <span className="text-gray-500">Teléfono:</span>
                <span className="font-medium truncate">{user.telefono}</span>
              </div>
            )}

            {user.direccion && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5"/>
                <span className="text-gray-500 flex-shrink-0">Dirección:</span>
                <span className="font-medium">{user.direccion}</span>
              </div>
            )}

            {/* Info y accesos rápidos según el rol */}
            {isCliente && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setVistaActual('miscompras');
                    setShowPerfil(false);
                  }}
                  className="w-full flex items-center gap-2 text-sm font-bold text-rose-700
                  hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <ListOrdered className="w-4 h-4"/>
                  Ver mis compras
                </button>
              </div>
            )}

            {isAdmin && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Settings className="w-3.5 h-3.5"/>
                  Acceso administrador: control total del catálogo, ventas, clientes y proveedores.
                </div>
                <button
                  onClick={() => {
                    setVistaActual('admin-panel');
                    setShowPerfil(false);
                  }}
                  className="w-full flex items-center gap-2 text-sm font-bold text-rose-700
                  hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4"/>
                  Ir al panel de administración
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

           {isCliente && (
        <button onClick={openCart}
        className="relative p-2 rounded-full hover:bg-rose-800
        transition-colors cursor-pointer group">
            <ShoppingCart className="w-6 h-6 text-white group-hover:text-rose-300" />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500
                text-white rounded-full text-xs w-5 h-5
                flex items-center justify-center font-bold border border-rose-900 animate-bounce">
                {cartCount}
                </span>
            )}
        </button>
            )}

            <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-900 hover:text-red-200
            transition-colors cursor-pointer"
            title="Cerrar Sesión">
            <LogOut className="w-5 h-5" />
        </button>
                 
            </>
            ):(<>
              <button onClick={() => setVistaActual('login')}
              className="px-3 py-2 rounded-md text-sm font-medium
              transition-colors hover:bg-rose-300">
                Iniciar Sesión
              </button>
              <button onClick={() => setVistaActual('register')}
              className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700
              text-white px-4 py-2 rounded-md text-sm font-medium
              transition-all shadow-md">
                Registrarse 
              </button>
            
            </>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};