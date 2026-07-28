import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiService } from '../services/apiService';
import { CreditCard, CheckCircle2, ShieldAlert, Loader2, Play } from 'lucide-react';

// Clave pública de prueba de Stripe. Puede ser reemplazada por una clave real 'pk_test_...'
const stripePromise = loadStripe('pk_test_51Twjt1PLLUS75bXUNji93o5m7yN5nrFHvVpzs4IA4K7axidAMmsNRZAmHcSKzURmkqBOdfz94TDj2sDulCzWw3fW00eevjUQGK');

const PaymentForm = ({ venta, onPaymentSuccess, setCurrentTab }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [clientSecret, setClientSecret] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    // 1. Obtener el clientSecret del backend
    const getSecret = async () => {
      try {
        const res = await apiService.crearIntencionPago(venta.id);
        if (res && res.clientSecret) {
          setClientSecret(res.clientSecret);
        }
      } catch (err) {
        // Ignoramos el error en interfaz porque proveemos el simulador de respaldo
        console.warn('No se pudo inicializar Stripe. Se usará el simulador de pago.', err);
      }
    };
    if (venta && venta.id) {
      getSecret();
    }
  }, [venta]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      setError('Stripe no está inicializado o la clave es incorrecta. Usa el Simulador de Pago abajo.');
      return;
    }

    setProcesando(true);
    setError('');

    try {
      // 2. Confirmar pago en Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        setError(result.error.message);
        setProcesando(false);
      } else if (result.paymentIntent.status === 'succeeded') {
        // 3. Confirmar pago en nuestro Backend
        await apiService.confirmarPagoVenta(venta.id);
        onPaymentSuccess();
      }
    } catch (err) {
      setError(err.message || 'Error de conexión durante el pago.');
      setProcesando(false);
    }
  };

  // Simulador de pago para pruebas rápidas o si no hay conexión/claves reales
  const handleSimulatePayment = async () => {
    setSimulating(true);
    setError('');
    try {
      await apiService.confirmarPagoVenta(venta.id);
      onPaymentSuccess();
    } catch (err) {
      setError('Error al conectar con la API local para simular el pago.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-2.5 border border-red-200 text-sm">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Formulario Stripe */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
        <label className="block text-sm font-semibold text-gray-700">Tarjeta de Crédito o Débito</label>
        <div className="bg-white p-4 rounded-xl border border-gray-300">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
              },
            }
          }} />
        </div>

        <button
          type="submit"
          disabled={!stripe || procesando || !clientSecret}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {procesando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Procesando pago con Stripe...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" /> Pagar Ahora (${venta.total.toFixed(2)} MXN)
            </>
          )}
        </button>
      </form>

      {/* Separador */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
        <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">O de Respaldo</span>
      </div>

      {/* Simulador */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Simulador de Pago de Pruebas</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Si estás usando las claves de Stripe por defecto o si no tienes internet, puedes simular una transacción exitosa para actualizar la base de datos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={simulating}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer text-sm"
        >
          {simulating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Simulando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Simular Pago Exitoso (Recomendado para Pruebas)
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const CheckoutForm = ({ ventaActiva, setCurrentTab }) => {
  const [pagado, setPagado] = useState(false);

  if (!ventaActiva) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-sm">
        <h3 className="font-bold text-lg text-gray-800">No hay ninguna venta activa</h3>
        <p className="text-gray-500 text-sm mt-1">Regresa al catálogo y añade productos para realizar el pago.</p>
        <button
          onClick={() => setCurrentTab('catalog')}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer"
        >
          Ver Catálogo
        </button>
      </div>
    );
  }

  const handlePaymentSuccess = () => {
    setPagado(true);
  };

  if (pagado) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-xl space-y-5 animate-fade-in-down">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-800">¡Pago Exitoso!</h2>
          <p className="text-sm text-gray-500">Tu orden #{ventaActiva.id} ha sido procesada y pagada correctamente.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl text-left text-xs text-gray-600 border border-gray-100 space-y-1">
          <div><span className="font-bold">Total Pagado:</span> ${ventaActiva.total.toFixed(2)} MXN</div>
          <div><span className="font-bold">Estado:</span> <span className="text-green-600 font-bold">PAGADO</span></div>
          <div><span className="font-bold">Cliente:</span> {ventaActiva.cliente?.nombre || 'Demo'}</div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentTab('miscompras')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            Ver Mis Compras
          </button>
          <button
            onClick={() => setCurrentTab('catalog')}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 px-6 py-6 text-white text-center">
        <h2 className="text-xl font-bold">Checkout de Venta</h2>
        <p className="text-indigo-200 mt-1 text-xs">Completa tu pago seguro para la orden #{ventaActiva.id}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Resumen Venta */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Resumen del Pedido</h3>
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm space-y-2">
            {ventaActiva.detalles.map((det, idx) => (
              <div key={idx} className="flex justify-between text-gray-700 text-xs">
                <span>
                  {det.producto?.nombre || `Producto #${det.producto?.id}`} (x{det.cantidad})
                </span>
                <span className="font-bold text-gray-800">${(det.precioUnitario * det.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-indigo-200 pt-2 flex justify-between font-extrabold text-indigo-950 text-sm">
              <span>Total a Cobrar</span>
              <span>${ventaActiva.total.toFixed(2)} MXN</span>
            </div>
          </div>
        </div>

        {/* Formulario Stripe Provider */}
        <Elements stripe={stripePromise}>
          <PaymentForm 
            venta={ventaActiva} 
            onPaymentSuccess={handlePaymentSuccess} 
            setCurrentTab={setCurrentTab} 
          />
        </Elements>
      </div>
    </div>
  );
};