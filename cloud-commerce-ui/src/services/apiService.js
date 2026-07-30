const API_URL ="http://z138yq42iq5j2doui1731hln.2.25.90.130.sslip.io/api/v1/"

//metodo helper para obtener las cabeceras con jwt
const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;

};
//metodo para manejo de errores al api
const handleResponse=async(response) =>{
if(!response.ok){
    const errortext = await response.text();
    throw new Error (errortext || "Error en la red");
}
if(response.status===204)return null;
return await response.json();
};

//metodo principal de peticiones 
export const apiService = {
     isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
    getUserRole: () => {
        return !!localStorage.getItem('rol');
    },
    getUserName: () => {
        return !!localStorage.getItem('nombre') || localStorage.getItem('username');
    },
    
    //metodo de registro 
    registro: async (userData) => {
        const response = await fetch(API_URL + 'auth/registro',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData),
     } );
     return await handleResponse(response);
    },

    //metodo de login
    login: async (username,password) =>{
        const response = await fetch(API_URL+'auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username,password}),
        });
        const data =await handleResponse(response);
        if(data.token){
            localStorage.setItem('token', data.token),
            localStorage.setItem('username', data.username),
            localStorage.setItem('nombre', data.nombre),
            localStorage.setItem('rol', data.rol),
            localStorage.setItem('direccion', data.direccion || ''),
            localStorage.setItem('telefono', data.telefono || '')
        }
        return data;
    },
    //metodo de logout
    logout: () => {
        localStorage.removeItem('token'),
        localStorage.removeItem('username'),
        localStorage.removeItem('nombre'),
        localStorage.removeItem('rol'),
        localStorage.removeItem('direccion'),
        localStorage.removeItem('telefono')
    },


    //peticiones a productos
    getProductos: async() =>{
        const response = await fetch(
            API_URL+'productos/',
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
     getProducto: async(id) =>{
        const response = await fetch(
            API_URL+'productos/'+id,
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
    crearProducto: async(producto) =>{
        const response = await fetch(
            API_URL+'productos/',
            {
                method:'POST',
                body: JSON.stringify(producto),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     actualizarProducto: async(id, producto) =>{
        const response = await fetch(
            API_URL+'productos/'+id,
            {
                method:'PUT',
                body: JSON.stringify(producto),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     eliminarProducto: async(id) =>{
        const response = await fetch(
            API_URL+'productos/'+id,
            {
                method:'DELETE',
             
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

    //Categorias
   
    //peticiones a categorias
    getCategorias: async() =>{
        const response = await fetch(
            API_URL+'categorias/',
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
     getCategoria: async(id) =>{
        const response = await fetch(
            API_URL+'categorias/'+id,
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
    crearCategorias: async(categoria) =>{
        const response = await fetch(
            API_URL+'categorias/',
            {
                method:'POST',
                body: JSON.stringify(categoria),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     actualizarCategorias: async(id, categoria) =>{
        const response = await fetch(
            API_URL+'categorias/'+id,
            {
                method:'PUT',
                body: JSON.stringify(categoria),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     eliminarCategorias: async(id) =>{
        const response = await fetch(
            API_URL+'categorias/'+id,
            {
                method:'DELETE',
             
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     //peticiones a clientes
    getClientes: async() =>{
        const response = await fetch(
            API_URL+'clientes/',
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
     getCliente: async(id) =>{
        const response = await fetch(
            API_URL+'clientes/'+id,
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
    crearClientes: async(clientes) =>{
        const response = await fetch(
            API_URL+'clientes/',
            {
                method:'POST',
                body: JSON.stringify(clientes),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     actualizarClientes: async(id, clientes) =>{
        const response = await fetch(
            API_URL+'clientes/'+id,
            {
                method:'PUT',
                body: JSON.stringify(clientes),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     eliminarClientes: async(id) =>{
        const response = await fetch(
            API_URL+'clientes/'+id,
            {
                method:'DELETE',
             
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },
  
   //peticiones a proveedores
    getProveedores: async() =>{
        const response = await fetch(
            API_URL+'proveedores/',
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
     getProveedor: async(id) =>{
        const response = await fetch(
            API_URL+'proveedores/'+id,
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
    crearProveedores: async(proveedores) =>{
        const response = await fetch(
            API_URL+'proveedores/',
            {
                method:'POST',
                body: JSON.stringify(proveedores),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     actualizarProveedores: async(id, proveedores) =>{
        const response = await fetch(
            API_URL+'proveedores/'+id,
            {
                method:'PUT',
                body: JSON.stringify(proveedores),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     eliminarProveedores: async(id) =>{
        const response = await fetch(
            API_URL+'proveedores/'+id,
            {
                method:'DELETE',
             
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },


    // Ventas (Checkout)
    procesarVenta: async (venta) => {
        const response = await fetch(API_URL+'ventas/', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(venta),
        });
        return await handleResponse(response);
    },
    getSales: async () => {
        const response = await fetch(API_URL+'ventas', {
        headers: getHeaders(),
        });
        return await handleResponse(response);
    },
    getMyPurchases: async () => {
    const response = await fetch(API_URL+'ventas/mis-compras', {
        headers: getHeaders(),
    });
    return await handleResponse(response);
    },

     //peticiones a Ventas
    getVentas: async() =>{
        const response = await fetch(
            API_URL+'ventas/',
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
     getVenta: async(id) =>{
        const response = await fetch(
            API_URL+'ventas/'+id,
            {headers: getHeaders()}

        );
        return await handleResponse(response);


    },
    crearVentas: async(ventas) =>{
        const response = await fetch(
            API_URL+'ventas/',
            {
                method:'POST',
                body: JSON.stringify(ventas),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     actualizarVentas: async(id, ventas) =>{
        const response = await fetch(
            API_URL+'ventas/'+id,
            {
                method:'PUT',
                body: JSON.stringify(ventas),
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

     eliminarVentas: async(id) =>{
        const response = await fetch(
            API_URL+'ventas/'+id,
            {
                method:'DELETE',
             
                headers: getHeaders()
            }

        );
        return await handleResponse(response);
    },

    //metodos de pagos
    crearIntencionPago: async (idVenta) => {
        const response = await fetch(API_URL+"/pagos/crear-intencion",
        {
            method:'POST',
            headers: getHeaders(),
            body: JSON.stringify({idVenta,moneda:'mxn'}),
        });
        return await handleResponse(response);
    },
    confirmarPagoVenta: async (idVenta) => {
        const response = await fetch(API_URL+"pagos/confirmar-pago/"+idVenta,
            {
                method: 'POST',
                headers: getHeaders(),

            });
            return await handleResponse(response);
    }

    


};
