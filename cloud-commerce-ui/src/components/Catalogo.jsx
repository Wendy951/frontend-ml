import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Search, Filter, ShoppingCart, Info, AlertTriangle } from 'lucide-react';

export const Catalogo = ({setVistaActual,user,AddToCart}) =>{
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [carga, setCarga] = useState([true]);
    const [error, setError] = useState('');

    //filtros 
    const [searchQuery, setSearchQuery] = useState('');
    const [selecionCategoria, setSelecionCategoria] = useState('Todos');

    useEffect(() => {
        const cargaDatosCatalogo = async()=>{
            setCarga(true);
            try{
                const datosProductos = await apiService.getProductos();
                setProductos(datosProductos);
                const datosCategorias = await apiService.getCategorias();
                setCategorias(datosCategorias);
            }catch(err){
                cargaDatosCatalogo();
                setError('Error en el servidor backend..' + err);
            }finally{
                setCarga(false);
            }
        }; cargaDatosCatalogo();
    },[]);
//Agregar al carrito
    const handleAddToCart = (producto) => {
        if (!usuario) {
        setVistaActual('login');
        return;
        }
        if (usuario.rol!== 'CLIENTE') {
        alert('Solo los usuarios registrados con el rol de Cliente pueden realizar compras.');
        return;
        }
        AddToCart(producto);
    };

    const filtroProductos = productos.filter((producto)=>{
        const busqueda = 
        producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (producto.descripcion 
        && producto.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));

        const busquedaCategorias =
        selecionCategoria === 'Todos' || 
        (producto.categoria && producto.categoria.nombre === selecionCategoria);    

        return busqueda && busquedaCategorias;
    
    });
    
    if(carga){
        return(
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                    <p className="text-gray-500 mt-4 font-medium">Cargando productos....</p>
            </div>
        );
    }

    return(
        <div className="font-catalogo max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           
            
            {/* Banner Principal */}
            <div className="bg-gradient-to-br from-rose-950 via-rose-800 to-pink-600 rounded-3xl p-8 sm:p-10 mb-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute right-24 bottom-0 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 max-w-xl">
                <span className="inline-block bg-white/15 text-rose-100 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                    Mercadito Libre
                </span>
                <h1 className="text-3xl text-white sm:text-5xl font-extrabold tracking-tight">Catálogo de Productos</h1>
                <p className="mt-3 text-rose-100 text-sm sm:text-base">
                    Explora las mejores ofertas, productos de calidad y envíos garantizados directamente por nuestros proveedores.
                </p>
                </div>
                <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8">
                <ShoppingCart className="w-64 h-64" />
                </div>
            </div>

            {error && (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl flex items-start gap-2.5 border border-amber-200 text-sm mb-6">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold">Aviso del Servidor:</span> {error}. Mostrando interfaz local. Asegúrate de iniciar la API en Spring Boot.
                </div>
                </div>
            )}

            {/* Buscador y Contenido */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros Lateral (Sidebar) */}
        <div className="w-full md:w-1/4 flex-shrink-0 space-y-6">
          {/* Tarjeta de Búsqueda */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Search className="w-4 h-4 text-rose-500" /> Buscar Producto
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe nombre o descripción..."
                className="w-full p-3 pl-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-gray-900"
              />
            </div>
          </div>

          {/* Tarjeta de Categorías */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Filter className="w-4 h-4 text-rose-500" /> Categorías
            </h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSelecionCategoria('Todos')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selecionCategoria === 'Todos'
                    ? 'bg-rose-50 text-rose-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Todas las categorías
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelecionCategoria(cat.nombre)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    selecionCategoria === cat.nombre
                      ? 'bg-rose-50 text-rose-700 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cuadrícula de Productos */}
        <div className="w-full md:w-3/4">
          {filtroProductos .length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <AlertTriangle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-800">No se encontraron productos</h3>
              <p className="text-gray-500 text-sm mt-1">Prueba a modificar los filtros o los términos de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtroProductos.map((producto) => {
                const defaultImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300";
                const isOutOfStock = producto.stock <= 0;

                return (
                  <div
                    key={producto.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-rose-200 transition-all duration-300 hover:-translate-y-1.5"
                  >
                    {/* Imagen con zoom effect */}
                    <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                      <img
                        src={producto.imagenUrl || defaultImage}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = defaultImage;
                        }}
                      />
                      {/* Categoría Badge */}
                      {producto.categoria && (
                        <span className="absolute top-3 left-3 bg-rose-900/80 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                          {producto.categoria.nombre}
                        </span>
                      )}
                    </div>

                    {/* Cuerpo */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Proveedor */}
                        {producto.proveedor && (
                          <div className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                            <i className="fa-solid fa-truck text-rose-400"></i> {producto.proveedor.nombreEmpresa}
                          </div>
                        )}
                        <h3 className="fuente-vista font-extrabold text-gray-900 text-lg leading-snug line-clamp-1 group-hover:text-rose-700 transition-colors">
                          {producto.nombre}
                        </h3>
                        <p className="text-gray-600 text-xs line-clamp-2 h-8">
                          {producto.descripcion || 'Sin descripción disponible.'}
                        </p>
                      </div>

                      {/* Precio y Stock */}
                      <div className="pt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="font-extrabold text-xl bg-gradient-to-r from-rose-800 to-pink-600 bg-clip-text text-transparent">
                            ${producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                          </span>
                          <span className={`text-xs font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                            {isOutOfStock ? 'Sin stock' : `Disponibles: ${producto.stock}`}
                          </span>
                        </div>

                        {/* Botón Comprar */}
                        <button
                          onClick={() => AddToCart(producto)}
                          disabled={isOutOfStock}
                          className={`w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 cursor-pointer ${
                            isOutOfStock
                              ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
                              : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white hover:shadow-md'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {!user? 'Ingresa para comprar' : 'Añadir al Carrito'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>



        </div>
    );

};