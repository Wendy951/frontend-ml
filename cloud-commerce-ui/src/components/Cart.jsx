import React, {useState} from "react";
import {apiService} from '../services/apiService';
import {X, ShoppingBasket, Trash2, Plus, Minus, CreditCard, Loader2} from 'lucide-react';

export const Cart = ({isOpen, onClose, cart, updateQuantity, removeFromCart, clearCart,
    setVistaActual, setVentaActiva}) =>{

        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');

        if(!isOpen) return null;

        const total = cart.reduce((sum, item) => sum + item.producto.precio
            * item.cantidad, 0);

            const handleCheckout = async() => {
                setLoading(true);
                setError('');

                //Mapero de los datos para venta y detalle venta
                const ventaPayload ={
                    detalles: cart.map(item => ({
                        producto: {id: item.producto.id},
                        cantidad: item.cantidad
                    }))
                };
            //funcion de registro de venta
               try{
                  const ventaRegistrada = await apiService.procesarVenta(ventaPayload);
                  setVentaActiva(ventaRegistrada);
                  clearCart();
                  onClose();
                  setVistaActual('checkout');
               } catch(err){
                setError(err.message || 'Error al procesar la compra.');
               }finally{
                setLoading(false);
               }
            };

            return(
                <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo Traslúcido */}
      <div 
        className="absolute inset-0 bg-rose-950/45 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Cabecera */}
          <div className="px-6 py-5 bg-gradient-to-r from-rose-900 to-pink-700 text-white flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBasket className="w-5 h-5 text-rose-300" /> Mi Carrito
            </h2>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-rose-800 transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs border border-red-200">
                {error}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <ShoppingBasket className="w-16 h-16 text-gray-300 mx-auto" />
                <h3 className="font-bold text-gray-800 text-base">Tu carrito está vacío</h3>
                <p className="text-gray-500 text-xs px-6">Explora el catálogo y añade algunos productos para comenzar tu compra.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div 
                    key={item.producto.id} 
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 relative group"
                  >
                    <img 
                      src={item.producto.imagenUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=150"} 
                      alt={item.producto.nombre} 
                      className="w-16 h-16 object-cover rounded-lg bg-gray-200" 
                    />
                    
                    <div className="flex-grow space-y-1">
                      <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.producto.nombre}</h4>
                      <p className="text-xs text-gray-400 font-semibold">{item.producto.categoria?.nombre}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        {/* Controles de Cantidad */}
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <button 
                            onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                            className="p-1 px-2 hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-gray-800">{item.cantidad}</span>
                          <button 
                            onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                            className="p-1 px-2 hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Subtotal del Item */}
                        <span className="font-bold text-sm text-rose-950">
                          ${(item.producto.precio * item.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Botón Eliminar */}
                    <button 
                      onClick={() => removeFromCart(item.producto.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pie de Carrito con Totalizadores */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Envío</span>
                  <span className="text-green-600 font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </div>

              {/* Botón de Pago */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-700 to-pink-600 hover:from-rose-800 hover:to-pink-700 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Procesando Compra...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Proceder al Pago
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
            );
    };