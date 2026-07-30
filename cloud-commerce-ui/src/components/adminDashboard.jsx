import React, { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import {
  Package,
  Tag,
  DollarSign,
  ShoppingBag,
  Boxes,
  ClipboardList,
  Users,
  Pencil,
  Trash2,
  Save,
  X,
  Info,
  AlertTriangle,
  Plus,
  Loader2,
  Truck,
  Eye,
} from "lucide-react";

// ---------- Modal genérico reutilizable para crear/editar ----------
const ModalFormulario = ({ titulo, onCerrar, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-rose-950/50 backdrop-blur-sm transition-opacity"
      onClick={onCerrar}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="px-6 py-5 bg-gradient-to-r from-rose-900 to-pink-700 text-white flex items-center justify-between sticky top-0">
        <h3 className="text-lg font-bold">{titulo}</h3>
        <button
          onClick={onCerrar}
          className="p-1.5 rounded-full hover:bg-rose-700 transition-colors text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export const AdminDashboard = ({}) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [carga, setCarga] = useState(true);
  const [error, setError] = useState("");

  const [seccionActiva, setSeccionActiva] = useState("productos");

  // ---- Modal de creación / edición (compartido por producto, categoría y cliente) ----
  const [modal, setModal] = useState(null); // { tipo: 'producto'|'categoria'|'cliente', modo: 'crear'|'editar', datos: {} }
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [detalleVenta, setDetalleVenta] = useState(null);

  useEffect(() => {
    const cargarDatosAdmin = async () => {
      setCarga(true);
      try {
        const [datosProductos, datosCategorias, datosVentas, datosClientes, datosProveedores] =
          await Promise.allSettled([
            apiService.getProductos(),
            apiService.getCategorias(),
            apiService.getVentas(),
            apiService.getClientes(),
            apiService.getProveedores(),
          ]);

        setProductos(
          datosProductos.status === "fulfilled" ? datosProductos.value : []
        );
        setCategorias(
          datosCategorias.status === "fulfilled" ? datosCategorias.value : []
        );
        setVentas(datosVentas.status === "fulfilled" ? datosVentas.value : []);
        setClientes(
          datosClientes.status === "fulfilled" ? datosClientes.value : []
        );
        setProveedores(
          datosProveedores.status === "fulfilled" ? datosProveedores.value : []
        );

        if (
          [datosProductos, datosCategorias, datosVentas, datosClientes, datosProveedores].some(
            (r) => r.status === "rejected"
          )
        ) {
          setError("Algunos datos no pudieron cargarse desde el servidor.");
        }
      } catch (err) {
        setError("Error en el servidor backend.. " + err);
      } finally {
        setCarga(false);
      }
    };
    cargarDatosAdmin();
  }, []);

  // ---- Cálculo de estadísticas ----
  const productosActivos = productos.length;
  const categoriasTotales = categorias.length;
  const ordenesTotales = ventas.length;
  const totalRecaudado = ventas.reduce((acumulado, venta) => {
    const monto = venta.total ?? venta.montoTotal ?? venta.precioTotal ?? 0;
    return acumulado + Number(monto || 0);
  }, 0);

  // ==================== MODAL: apertura / cierre ====================
  const abrirModalCrear = (tipo) => {
    setErrorFormulario("");
    const datosIniciales =
      tipo === "producto"
        ? { nombre: "", descripcion: "", precio: "", stock: "", imagenUrl: "", categoriaId: "", proveedorId: "" }
        : tipo === "categoria"
        ? { nombre: "" }
        : tipo === "proveedor"
        ? { nombre: "", email: "", direccion: "", telefono: "" }
        : { nombre: "", email: "", direccion: "", telefono: "" };
    setModal({ tipo, modo: "crear", datos: datosIniciales });
  };

  const abrirModalEditar = (tipo, item) => {
    setErrorFormulario("");
    const datosIniciales =
      tipo === "producto"
        ? {
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion || "",
            precio: item.precio,
            stock: item.stock,
            imagenUrl: item.imagenUrl || "",
            categoriaId: item.categoria?.id || "",
            proveedorId: item.proveedor?.id || "",
          }
        : tipo === "categoria"
        ? { id: item.id, nombre: item.nombre }
        : {
            id: item.id,
            nombre: item.nombre || "",
            email: item.email || "",
            direccion: item.direccion || "",
            telefono: item.telefono || "",
          };
    setModal({ tipo, modo: "editar", datos: datosIniciales });
  };

  const cerrarModal = () => {
    setModal(null);
    setErrorFormulario("");
  };

  const actualizarCampoModal = (campo, valor) => {
    setModal((prev) => ({ ...prev, datos: { ...prev.datos, [campo]: valor } }));
  };

  // ==================== GUARDAR (crear o editar según modo) ====================
  const guardarModal = async (e) => {
    e.preventDefault();
    if (!modal) return;
    setGuardando(true);
    setErrorFormulario("");

    try {
      if (modal.tipo === "producto") {
        const { id, nombre, descripcion, precio, stock, imagenUrl, categoriaId, proveedorId } = modal.datos;
        if (!nombre || precio === "" || stock === "") {
          setErrorFormulario("Nombre, precio y stock son obligatorios.");
          setGuardando(false);
          return;
        }
        const payload = {
          nombre,
          descripcion,
          precio: Number(precio),
          stock: Number(stock),
          imagenUrl,
          categoria: categoriaId
            ? { id: Number(categoriaId) }
            : null,
          proveedor: proveedorId
            ? { id: Number(proveedorId) }
            : null,
        };

        if (modal.modo === "crear") {
          const creado = await apiService.crearProducto(payload);
          setProductos((prev) => [...prev, creado]);
        } else {
          const actualizado = await apiService.actualizarProducto(id, payload);
          setProductos((prev) => prev.map((p) => (p.id === id ? actualizado : p)));
        }
      }

      if (modal.tipo === "categoria") {
        const { id, nombre } = modal.datos;
        if (!nombre) {
          setErrorFormulario("El nombre de la categoría es obligatorio.");
          setGuardando(false);
          return;
        }
        const payload = { nombre };

        if (modal.modo === "crear") {
          const creada = await apiService.crearCategorias(payload);
          setCategorias((prev) => [...prev, creada]);
        } else {
          const actualizada = await apiService.actualizarCategorias(id, payload);
          setCategorias((prev) => prev.map((c) => (c.id === id ? actualizada : c)));
        }
      }

      if (modal.tipo === "cliente") {
        const { id, nombre, email, direccion, telefono } = modal.datos;
        if (!nombre || !email) {
          setErrorFormulario("Nombre y correo son obligatorios.");
          setGuardando(false);
          return;
        }
        const payload = { nombre, email, direccion, telefono };

        if (modal.modo === "crear") {
          const creado = await apiService.crearClientes(payload);
          setClientes((prev) => [...prev, creado]);
        } else {
          const actualizado = await apiService.actualizarClientes(id, payload);
          setClientes((prev) => prev.map((c) => (c.id === id ? actualizado : c)));
        }
      }

      if (modal.tipo === "proveedor") {
        const { id, nombre, email, direccion, telefono } = modal.datos;
        if (!nombre || !email) {
          setErrorFormulario("Nombre y correo son obligatorios.");
          setGuardando(false);
          return;
        }
        const payload = { nombre, email, direccion, telefono };

        if (modal.modo === "crear") {
          const creado = await apiService.crearProveedores(payload);
          setProveedores((prev) => [...prev, creado]);
        } else {
          const actualizado = await apiService.actualizarProveedores(id, payload);
          setProveedores((prev) => prev.map((p) => (p.id === id ? actualizado : p)));
        }
      }

      cerrarModal();
    } catch (err) {
      setErrorFormulario("No se pudo guardar. " + (err.message || err));
    } finally {
      setGuardando(false);
    }
  };

  // ==================== ELIMINAR ====================
  const eliminarProducto = async (producto) => {
    if (!window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return;
    try {
      await apiService.eliminarProducto(producto.id);
      setProductos((prev) => prev.filter((p) => p.id !== producto.id));
    } catch (err) {
      setError("No se pudo eliminar el producto.. " + err);
    }
  };

  const eliminarCategoria = async (categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    try {
      await apiService.eliminarCategorias(categoria.id);
      setCategorias((prev) => prev.filter((c) => c.id !== categoria.id));
    } catch (err) {
      setError(
        "No se pudo eliminar la categoría (puede tener productos asociados).. " + err
      );
    }
  };

  const eliminarCliente = async (cliente) => {
    if (!window.confirm(`¿Eliminar al cliente "${cliente.nombre || cliente.username}"?`)) return;
    try {
      await apiService.eliminarClientes(cliente.id);
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
    } catch (err) {
      setError("No se pudo eliminar el cliente.. " + err);
    }
  };

  const eliminarProveedor = async (proveedor) => {
    if (!window.confirm(`¿Eliminar al proveedor "${proveedor.nombre}"?`)) return;
    try {
      await apiService.eliminarProveedores(proveedor.id);
      setProveedores((prev) => prev.filter((p) => p.id !== proveedor.id));
    } catch (err) {
      setError("No se pudo eliminar el proveedor.. " + err);
    }
  };

  if (carga) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-700"></div>
        <p className="text-gray-500 mt-4 font-medium">
          Cargando panel de administración....
        </p>
      </div>
    );
  }

  const tarjetasEstadisticas = [
    {
      titulo: "Productos Activos",
      valor: `${productosActivos} Artículos`,
      subtitulo: "En inventario",
      icono: Package,
    },
    {
      titulo: "Categorías",
      valor: `${categoriasTotales} Categorías`,
      subtitulo: "Clasificaciones",
      icono: Tag,
    },
    {
      titulo: "Total Recaudado",
      valor: `$${totalRecaudado.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
      })} MXN`,
      subtitulo: "Ingresos totales",
      icono: DollarSign,
    },
    {
      titulo: "Órdenes Totales",
      valor: `${ordenesTotales} Órdenes`,
      subtitulo: "Ventas registradas",
      icono: ShoppingBag,
    },
  ];

  const secciones = [
    { id: "productos", label: "Gestión de Productos", icono: Boxes },
    { id: "categorias", label: "Categorías", icono: Tag },
    { id: "ventas", label: "Registro de Ventas", icono: ClipboardList },
    { id: "clientes", label: "Gestión de Clientes", icono: Users },
    { id: "proveedores", label: "Gestión de Proveedores", icono: Truck },
  ];

  return (
    <div className="font-admin max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-700 to-pink-600 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl text-white sm:text-4xl font-extrabold tracking-tight">
            Panel de Administración
          </h1>
          <p className="mt-2 text-rose-100 text-sm sm:text-base">
            Gestiona productos, categorías, ventas y clientes de Mercadito
            Libre desde un solo lugar.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8">
          <ShoppingBag className="w-64 h-64" />
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl flex items-start gap-2.5 border border-amber-200 text-sm mb-6">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Aviso del Servidor:</span> {error}.
            Asegúrate de iniciar la API en Spring Boot.
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {tarjetasEstadisticas.map((tarjeta) => {
          const Icono = tarjeta.icono;
          return (
            <div
              key={tarjeta.titulo}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                <Icono className="w-7 h-7 text-rose-700" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {tarjeta.titulo}
                </h3>
                <p className="text-xl font-extrabold text-gray-800">
                  {tarjeta.valor}
                </p>
                <p className="text-xs text-gray-400">{tarjeta.subtitulo}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navegación de secciones */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-2 mb-8">
        {secciones.map((seccion) => {
          const Icono = seccion.icono;
          const activa = seccionActiva === seccion.id;
          return (
            <button
              key={seccion.id}
              onClick={() => setSeccionActiva(seccion.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activa
                  ? "bg-gradient-to-r from-rose-700 to-pink-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icono className="w-4 h-4" />
              {seccion.label}
            </button>
          );
        })}
      </div>

      {/* Contenido: Gestión de Productos */}
      {seccionActiva === "productos" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-lg text-gray-800">
                Gestión de Productos
              </h2>
              <p className="text-gray-400 text-sm">
                Crea, edita o elimina productos del inventario.
              </p>
            </div>
            <button
              onClick={() => abrirModalCrear("producto")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-pink-600 hover:from-rose-800 hover:to-pink-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nuevo Producto
            </button>
          </div>

          {productos.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-800">
                No hay productos registrados
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Los productos que agregues aparecerán en esta tabla.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-bold">Producto</th>
                    <th className="text-left px-6 py-3 font-bold">
                      Categoría
                    </th>
                    <th className="text-left px-6 py-3 font-bold">Precio</th>
                    <th className="text-left px-6 py-3 font-bold">Stock</th>
                    <th className="text-right px-6 py-3 font-bold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productos.map((producto) => {
                    const defaultImage =
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100";
                    return (
                      <tr
                        key={producto.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={producto.imagenUrl || defaultImage}
                              alt={producto.nombre}
                              className="w-11 h-11 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                              onError={(e) => {
                                e.target.src = defaultImage;
                              }}
                            />
                            <span className="font-bold text-gray-800">
                              {producto.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            {producto.categoria?.nombre || "Sin categoría"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-rose-900">
                            $
                            {Number(producto.precio).toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold ${
                              producto.stock <= 0
                                ? "text-red-500"
                                : "text-green-600"
                            }`}
                          >
                            {producto.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => abrirModalEditar("producto", producto)}
                              className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => eliminarProducto(producto)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contenido: Categorías */}
      {seccionActiva === "categorias" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-lg text-gray-800">Categorías</h2>
              <p className="text-gray-400 text-sm">
                Crea, edita o elimina las categorías de productos.
              </p>
            </div>
            <button
              onClick={() => abrirModalCrear("categoria")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-pink-600 hover:from-rose-800 hover:to-pink-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nueva Categoría
            </button>
          </div>

          {categorias.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-800">
                No hay categorías registradas
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Las categorías que agregues aparecerán en esta tabla.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-bold">Categoría</th>
                    <th className="text-left px-6 py-3 font-bold">
                      Productos asociados
                    </th>
                    <th className="text-right px-6 py-3 font-bold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categorias.map((categoria) => {
                    const cantidadProductos = productos.filter(
                      (p) => p.categoria?.id === categoria.id
                    ).length;
                    return (
                      <tr
                        key={categoria.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {categoria.nombre}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            {cantidadProductos} producto
                            {cantidadProductos === 1 ? "" : "s"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => abrirModalEditar("categoria", categoria)}
                              className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => eliminarCategoria(categoria)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contenido: Registro de Ventas */}
      {seccionActiva === "ventas" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-800">
              Registro de Ventas
            </h2>
            <p className="text-gray-400 text-sm">
              Historial de las ventas realizadas en la tienda.
            </p>
          </div>

          {ventas.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-800">
                No hay ventas registradas
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Las ventas realizadas aparecerán en esta tabla.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-bold">ID</th>
                    <th className="text-left px-6 py-3 font-bold">Cliente</th>
                    <th className="text-left px-6 py-3 font-bold">Fecha</th>
                    <th className="text-left px-6 py-3 font-bold">Estado</th>
                    <th className="text-right px-6 py-3 font-bold">Total</th>
                    <th className="text-right px-6 py-3 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ventas.map((venta) => (
                    <tr
                      key={venta.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-800">
                        #{venta.id}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {venta.cliente?.nombre ||
                          venta.cliente?.username ||
                          "N/D"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {venta.fecha
                          ? new Date(venta.fecha).toLocaleDateString("es-MX")
                          : "N/D"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          {venta.estadoPago || venta.estado || "N/D"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-rose-900">
                        $
                        {Number(
                          venta.total ?? venta.montoTotal ?? 0
                        ).toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setDetalleVenta(venta)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAL: Ver Detalle de Venta ==================== */}
      {detalleVenta && (
        <ModalFormulario
          titulo={`Detalle de la Venta #${detalleVenta.id}`}
          onCerrar={() => setDetalleVenta(null)}
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-bold text-gray-800">Cliente:</span>{" "}
                {detalleVenta.cliente?.nombre ||
                  detalleVenta.cliente?.username ||
                  "N/D"}
              </div>
              <div>
                <span className="font-bold text-gray-800">Fecha:</span>{" "}
                {detalleVenta.fecha
                  ? new Date(detalleVenta.fecha).toLocaleDateString("es-MX")
                  : "N/D"}
              </div>
              <div>
                <span className="font-bold text-gray-800">Estado:</span>{" "}
                <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {detalleVenta.estadoPago || detalleVenta.estado || "N/D"}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Productos
              </h4>
              <div className="space-y-2">
                {(detalleVenta.detalles || []).map((det, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-2"
                  >
                    <span>
                      {det.producto?.nombre || `Producto #${det.producto?.id}`} (x
                      {det.cantidad})
                    </span>
                    <span className="font-bold text-gray-800">
                      $
                      {Number(
                        det.subTotal ?? det.precioUnitario * det.cantidad
                      ).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 flex justify-between font-extrabold text-rose-900">
              <span>Total</span>
              <span>
                $
                {Number(detalleVenta.total ?? 0).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetalleVenta(null)}
                className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </ModalFormulario>
      )}

      {/* Contenido: Gestión de Clientes */}
      {seccionActiva === "clientes" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-lg text-gray-800">
                Gestión de Clientes
              </h2>
              <p className="text-gray-400 text-sm">
                Crea, edita o elimina los clientes registrados en la plataforma.
              </p>
            </div>
            <button
              onClick={() => abrirModalCrear("cliente")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-pink-600 hover:from-rose-800 hover:to-pink-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </button>
          </div>

          {clientes.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-800">
                No hay clientes registrados
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Los clientes registrados aparecerán en esta tabla.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-bold">Nombre</th>
                    <th className="text-left px-6 py-3 font-bold">Correo</th>
                    <th className="text-left px-6 py-3 font-bold">Teléfono</th>
                    <th className="text-left px-6 py-3 font-bold">Dirección</th>
                    <th className="text-right px-6 py-3 font-bold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientes.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {cliente.nombre || "N/D"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {cliente.email || cliente.correo || "N/D"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {cliente.telefono || "N/D"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {cliente.direccion || "N/D"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModalEditar("cliente", cliente)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarCliente(cliente)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contenido: Gestión de Proveedores */}
      {seccionActiva === "proveedores" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-lg text-gray-800">
                Gestión de Proveedores
              </h2>
              <p className="text-gray-400 text-sm">
                Crea, edita o elimina los proveedores registrados.
              </p>
            </div>
            <button
              onClick={() => abrirModalCrear("proveedor")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-pink-600 hover:from-rose-800 hover:to-pink-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nuevo Proveedor
            </button>
          </div>

          {proveedores.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-gray-800">
                No hay proveedores registrados
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Los proveedores que agregues aparecerán en esta tabla.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-bold">Nombre</th>
                    <th className="text-left px-6 py-3 font-bold">Correo</th>
                    <th className="text-left px-6 py-3 font-bold">Teléfono</th>
                    <th className="text-left px-6 py-3 font-bold">Dirección</th>
                    <th className="text-right px-6 py-3 font-bold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {proveedores.map((proveedor) => (
                    <tr
                      key={proveedor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {proveedor.nombre || "N/D"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {proveedor.email || "N/D"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {proveedor.telefono || "N/D"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {proveedor.direccion || "N/D"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModalEditar("proveedor", proveedor)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminarProveedor(proveedor)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAL: Crear / Editar Producto ==================== */}
      {modal && modal.tipo === "producto" && (
        <ModalFormulario
          titulo={modal.modo === "crear" ? "Nuevo Producto" : "Editar Producto"}
          onCerrar={cerrarModal}
        >
          <form onSubmit={guardarModal} className="space-y-4">
            {errorFormulario && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-200">
                {errorFormulario}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                value={modal.datos.nombre}
                onChange={(e) => actualizarCampoModal("nombre", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Descripción
              </label>
              <textarea
                value={modal.datos.descripcion}
                onChange={(e) => actualizarCampoModal("descripcion", e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Precio (MXN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={modal.datos.precio}
                  onChange={(e) => actualizarCampoModal("precio", e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={modal.datos.stock}
                  onChange={(e) => actualizarCampoModal("stock", e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Categoría
              </label>
              <select
                value={modal.datos.categoriaId}
                onChange={(e) => actualizarCampoModal("categoriaId", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900 bg-white"
              >
                <option value="">Sin categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Proveedor
              </label>
              <select
                value={modal.datos.proveedorId}
                onChange={(e) => actualizarCampoModal("proveedorId", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900 bg-white"
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                URL de Imagen
              </label>
              <input
                type="text"
                value={modal.datos.imagenUrl}
                onChange={(e) => actualizarCampoModal("imagenUrl", e.target.value)}
                placeholder="https://..."
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-pink-600 hover:from-rose-800 hover:to-pink-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {guardando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar
              </button>
            </div>
          </form>
        </ModalFormulario>
      )}

      {/* ==================== MODAL: Crear / Editar Categoría ==================== */}
      {modal && modal.tipo === "categoria" && (
        <ModalFormulario
          titulo={modal.modo === "crear" ? "Nueva Categoría" : "Editar Categoría"}
          onCerrar={cerrarModal}
        >
          <form onSubmit={guardarModal} className="space-y-4">
            {errorFormulario && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-200">
                {errorFormulario}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre de la categoría
              </label>
              <input
                type="text"
                value={modal.datos.nombre}
                onChange={(e) => actualizarCampoModal("nombre", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-pink-600 hover:from-rose-800 hover:to-pink-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {guardando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar
              </button>
            </div>
          </form>
        </ModalFormulario>
      )}

      {/* ==================== MODAL: Crear / Editar Cliente ==================== */}
      {modal && modal.tipo === "cliente" && (
        <ModalFormulario
          titulo={modal.modo === "crear" ? "Nuevo Cliente" : "Editar Cliente"}
          onCerrar={cerrarModal}
        >
          <form onSubmit={guardarModal} className="space-y-4">
            {errorFormulario && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-200">
                {errorFormulario}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                value={modal.datos.nombre}
                onChange={(e) => actualizarCampoModal("nombre", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={modal.datos.email}
                onChange={(e) => actualizarCampoModal("email", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Teléfono
              </label>
              <input
                type="text"
                value={modal.datos.telefono}
                onChange={(e) => actualizarCampoModal("telefono", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Dirección
              </label>
              <input
                type="text"
                value={modal.datos.direccion}
                onChange={(e) => actualizarCampoModal("direccion", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-pink-600 hover:from-rose-800 hover:to-pink-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {guardando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar
              </button>
            </div>
          </form>
        </ModalFormulario>
      )}

      {/* ==================== MODAL: Crear / Editar Proveedor ==================== */}
      {modal && modal.tipo === "proveedor" && (
        <ModalFormulario
          titulo={modal.modo === "crear" ? "Nuevo Proveedor" : "Editar Proveedor"}
          onCerrar={cerrarModal}
        >
          <form onSubmit={guardarModal} className="space-y-4">
            {errorFormulario && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-200">
                {errorFormulario}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                value={modal.datos.nombre}
                onChange={(e) => actualizarCampoModal("nombre", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={modal.datos.email}
                onChange={(e) => actualizarCampoModal("email", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Teléfono
              </label>
              <input
                type="text"
                value={modal.datos.telefono}
                onChange={(e) => actualizarCampoModal("telefono", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Dirección
              </label>
              <input
                type="text"
                value={modal.datos.direccion}
                onChange={(e) => actualizarCampoModal("direccion", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm text-gray-900"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-pink-600 hover:from-rose-800 hover:to-pink-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {guardando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar
              </button>
            </div>
          </form>
        </ModalFormulario>
      )}
    </div>
  );
};
