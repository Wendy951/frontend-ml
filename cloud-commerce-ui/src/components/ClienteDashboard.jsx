import React, { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import {
  ShoppingBag,
  Package,
  Calendar,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

// ---------- Estilo del badge según el estado del pago ----------
const badgeEstado = (estado) => {
  const valor = (estado || "").toUpperCase();
  if (valor.includes("PAGAD") || valor.includes("COMPLET") || valor.includes("APROB")) {
    return {
      clases: "bg-green-50 text-green-700 border border-green-200",
      icono: CheckCircle2,
      texto: estado || "Pagado",
    };
  }
  if (valor.includes("CANCEL") || valor.includes("RECHAZ")) {
    return {
      clases: "bg-red-50 text-red-600 border border-red-200",
      icono: XCircle,
      texto: estado || "Cancelado",
    };
  }
  return {
    clases: "bg-amber-50 text-amber-700 border border-amber-200",
    icono: Clock,
    texto: estado || "Pendiente",
  };
};

export const ClienteDashboard = ({ user }) => {
  const [compras, setCompras] = useState([]);
  const [carga, setCarga] = useState(true);
  const [error, setError] = useState("");
  const [ordenAbierta, setOrdenAbierta] = useState(null);

  useEffect(() => {
    const cargarCompras = async () => {
      setCarga(true);
      try {
        const datos = await apiService.getMyPurchases();
        const ordenadas = [...(datos || [])].sort((a, b) => {
          const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
          const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
          return fechaB - fechaA;
        });
        setCompras(ordenadas);
      } catch (err) {
        setError("No se pudieron cargar tus compras. " + (err.message || err));
      } finally {
        setCarga(false);
      }
    };
    cargarCompras();
  }, []);

  const totalGastado = compras.reduce(
    (acumulado, venta) => acumulado + Number(venta.total || 0),
    0
  );

  const alternarOrden = (id) => {
    setOrdenAbierta((prev) => (prev === id ? null : id));
  };

  if (carga) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-700"></div>
        <p className="text-gray-500 mt-4 font-medium">Cargando tus compras....</p>
      </div>
    );
  }

  return (
    <div className="font-compras max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-700 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            ¡Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}!
          </h1>
          <p className="mt-2 text-rose-100 text-sm sm:text-base">
            Aquí puedes revisar el historial completo de tus compras en Mercadito Libre.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8">
          <ShoppingBag className="w-56 h-56" />
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl flex items-start gap-2.5 border border-amber-200 text-sm mb-6">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Aviso del Servidor:</span> {error}
          </div>
        </div>
      )}

      {/* Resumen rápido */}
      {compras.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <Package className="w-7 h-7 text-rose-700" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Órdenes realizadas
              </h3>
              <p className="text-xl font-extrabold text-gray-800">{compras.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-7 h-7 text-rose-700" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total gastado
              </h3>
              <p className="text-xl font-extrabold text-gray-800">
                ${totalGastado.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de compras */}
      {compras.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-gray-800">Aún no tienes compras registradas</h3>
          <p className="text-gray-500 text-sm mt-1">
            Cuando realices una compra en el catálogo, aparecerá aquí con todos sus detalles.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {compras.map((venta) => {
            const estado = badgeEstado(venta.estadoPago);
            const IconoEstado = estado.icono;
            const abierta = ordenAbierta === venta.id;
            const detalles = venta.detalles || [];

            return (
              <div
                key={venta.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Encabezado de la orden (clic para expandir) */}
                <button
                  onClick={() => alternarOrden(venta.id)}
                  className="w-full flex items-center justify-between gap-4 flex-wrap px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-rose-700" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Orden #{venta.id}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {venta.fecha
                          ? new Date(venta.fecha).toLocaleString("es-MX", {
                              dateStyle: "long",
                              timeStyle: "short",
                            })
                          : "Fecha no disponible"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${estado.clases}`}
                    >
                      <IconoEstado className="w-3.5 h-3.5" />
                      {estado.texto}
                    </span>
                    <span className="font-extrabold text-rose-900 text-lg">
                      ${Number(venta.total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                    {abierta ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Detalle expandible de productos */}
                {abierta && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/60">
                    {detalles.length === 0 ? (
                      <p className="text-gray-400 text-sm py-2">
                        Esta orden no tiene productos detallados.
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {detalles.map((detalle) => {
                          const defaultImage =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100";
                          return (
                            <div
                              key={detalle.id}
                              className="flex items-center justify-between gap-4 py-3 flex-wrap"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={detalle.producto?.imagenUrl || defaultImage}
                                  alt={detalle.producto?.nombre || "Producto"}
                                  className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                                  onError={(e) => {
                                    e.target.src = defaultImage;
                                  }}
                                />
                                <div>
                                  <p className="font-bold text-gray-800 text-sm">
                                    {detalle.producto?.nombre || "Producto no disponible"}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Cantidad: {detalle.cantidad} &middot; $
                                    {Number(detalle.precioUnitario || 0).toLocaleString("es-MX", {
                                      minimumFractionDigits: 2,
                                    })}{" "}
                                    c/u
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-rose-900 text-sm">
                                $
                                {Number(detalle.subTotal || 0).toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};