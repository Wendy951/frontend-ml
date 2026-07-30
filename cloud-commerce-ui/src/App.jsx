import { useEffect, useState } from 'react'
import  Footer  from './components/Footer';
import {Catalogo} from './components/Catalogo';
import { Navbar } from './components/Navbar';
import { Registro } from './components/Registro';
import { Login} from './components/Login';
import { apiService } from './services/apiService';
import { AdminDashboard } from './components/adminDashboard';
import { ClienteDashboard } from './components/ClienteDashboard';
import { Cart } from './components/Cart';
import { CheckoutForm } from './components/CheckhoutFrom';
//import heroImg from './assets/hero.png'
//import './App.css'

function App() {
  //const [count, setCount] = useState(0)
  const [vistaActual, setVistaActual] = useState('catalogo');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen,setIsCartOpen] =useState(false);
  const [ventaActiva, setVentaActiva] = useState(null);
  const [adminSubTab, setAdminSubTab] = useState('productos');
  //Cargar los datos iniciales de usuarios si existe activo
  useEffect(() => {
    if(apiService.isAuthenticated()) {
      setUser({
        username:localStorage.getItem('username'),
        nombre: localStorage.getItem('nombre'),
        rol: localStorage.getItem('rol')
      });
  }
},[]);

//Metodo handleLoginSucces
  const handleLoginSuccess = (userData) => {
    setUser({
      username: userData.username,
      nombre: userData.nombre,
      rol: userData.rol
    });
    if(userData.rol === 'ROLE_ADMIN'){
      setVistaActual('admin-panel');
    }else{
      setVistaActual('catalogo');
    }
  };
  //metodo hadleLogout
  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setVentaActiva(null);
    setVistaActual('catalogo');
  
  };
  //Funcion de carrito de compras
  const AddToCart = (producto) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item)=> item.producto.id === producto.id);
      if(existing){
        if(existing.cantidad >= producto.stock){
          alert("No se puede añadir mas stock para " + producto.nombre +
        "Inventario disponible "+ producto.stock);
        return prevCart;
      }
      return prevCart.map((item) =>
        item.producto.id === producto.id ? {... item, cantidad:
          item.cantidad +1 } : item
      );
      }
      return[...prevCart, {producto: producto, cantidad: 1}];
    });
    setIsCartOpen(true);
  };
  //Actualizar cantidad
  const updateQuantity = (productoId, nuevaCantidad) =>{
    if(nuevaCantidad <= 0){
      removeFromCart(productoId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item)=>{
        if(item.producto.id === productoId){
          if(nuevaCantidad > item.producto.stock){
            alert("No se puede exceder el stock disponible : "
              + item.producto.stock)
              return item;
            }
            return{...item,cantidad: nuevaCantidad};
          }
          return item;
      }));
  };
  //remover del carrito
  const removeFromCart = (productoId) =>{
    setCart(prevCart => prevCart.filter((item)=> item.producto.id !== productoId));
  };
  //limpiar carrito
  const clearCart = () => setCart([]);
  //Contar productos en carrito
  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

//vista contenido principal
  const vistaContenido = () =>{
    switch(vistaActual){
      case 'catalogo':
        return <Catalogo setVistaActual={setVistaActual}
                          user = {user}
                          AddToCart = {AddToCart}
         />;
    case 'admin-panel':
        return <AdminDashboard setVistaActual={setVistaActual}
                       user = {user}
                      //addToCart = {addToCart}
         />;
         case 'miscompras':
        return <ClienteDashboard setVistaActual={setVistaActual}
                       setVentaActiva={setVentaActiva}
                       user = {user}
                      //addToCart = {addToCart}
         />;
        case 'register':
          return (
        <Registro
          onRegisterSuccess={() => setVistaActual('login')}
          onGoToLogin={() => setVistaActual('login')}/>
      );
      case 'login':
      return ( 
        <Login
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setVistaActual('register')}
        />
      );
      case 'checkout':
      return <CheckoutForm ventaActiva={ventaActiva} setVistaActual={setVistaActual}/>;
    default:
      return <Catalogo setVistaActual={setVistaActual}
             user = {user}
             AddToCart = {AddToCart}
         />;
    }
  };
  return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 antialiased">
        <Navbar vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        user={user}
        onLogout={handleLogout}
        cartCount={cartCount}
        openCart={()=> setIsCartOpen(true)}
        />

      <main className="flex-grow pb-12">
        {
          vistaContenido()
        }
      </main>
      <Cart
      isOpen={ isCartOpen}
      onClose= {()=>setIsCartOpen(false)}
      cart = {cart}
      updateQuantity={updateQuantity}
      removeFromCart={removeFromCart}
      clearCart={clearCart}
      setVistaActual={setVistaActual}
      setVentaActiva={setVentaActiva}
      />

      <Footer/>
      </div>
    );
}
export default App
