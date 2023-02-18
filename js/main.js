
/*
    SIMULADOR DE CARRITO DE COMPRAS:
    Se agregan algunos productos para no tener que cargarlos manualmente
    Se muestran los productos disponibles para la compra
    Se da la opcion al usuario de cargar nuevos productos
    Se solicita al usuario que ingrese los productos que desea comprar y la cantidad    
    Se le pregunta al usuario si quiere actualizar la cantidad de algun producto del carrito
    Se le pregunta al usuario si quiere quitar algun producto del carrito
    Se muestra el carrito de compras antes de realizar el pago
    Se le pregunta al usuario si quiere financiar el monto total y de ser afirmativo, en cuantas cuotas desea pagar
    Se muestra el monto total a pagar y el monto de las cuotas

    CARRITO DE COMPRAS:
    1. AGREGAR AL STORAGE LOS PRODUCTOS DISPONIBLES
    2. CARGAR LOS PRODUCTOS DISPONIBLES DEL STORAGE EN EL HTML
    3. AGREGAR LOS EVENTOS A LOS BOTONES DE AGREGAR AL CARRITO Y COMPRAR
        3.1 sI AGREGA AL CARRITO, AGREGAR A LA LISTA CARRITO EN EL STORAGE
        3.2 SI COMPRA, MOSTRAR CHECK OUT DE ESE PRODUCTO
    4. VER CARRITO MUESTRA LOS PRODUCTOS AGREGADOS AL CARRITO CON LOS SUBTOTALES Y EL TOTAL
        4.1 APARECE UN COMBO PARA SELECCIONAR LA CANTIDAD DE CUOTAS (1,3,6,12)
        4.2 BOTON FINALIZAR COMPRA MUESTRA EL MENSAJE CON EL TOTAL

*/

class Usuario {
    constructor(usuario, password, recordar) {
        this.usuario = usuario;
        this.password = password;
        this.recordar = recordar;
    }
}

// Clase para los productos disponibles
class Producto {
    constructor(id, descripcion, precio, stock, pathIMG) {
        this.id = id;
        this.pathIMG = pathIMG;
        this.descripcion = descripcion.toUpperCase();
        this.precio = parseFloat(precio);
        this.stock = parseInt(stock);
    }

    // Cada vez que se agrega el producto al carrito, se decrementa el stock
    disminuirStock(cantidadAComprar) {
        this.stock = this.stock - cantidadAComprar;
        return this.stock;
    }

    // Cuando se quita el producto del carrito, se incrementa el stock
    aumentarStock(cantidadAComprar) {
        this.stock = this.stock + cantidadAComprar;
        return this.stock;
    }

    // Para comprobar si hay stock del producto antes de comprar
    hayStock(cantidadAComprar) {
        return cantidadAComprar <= this.stock;
    }

    // Devuelve el stock del producto
    obtenerStock() {
        return this.stock;
    }
}

// Clase con la lista de productos disponibles para comprar
class ProductosDisponibles {

    constructor(listaDeProductos) {
        this.listaDeProductos = listaDeProductos; // Array con objetos Producto disponibles para comprar
    }

    obtenerListaDeProductosDisponibles() {
        return this.listaDeProductos;
    }

    //agregarProducto(id, descripcion, precio, stock, pathIMG) {
    agregarProducto(oProducto) {
        // Agrego los productos ingresados como objetos en el array de productos de la clase
        this.listaDeProductos.push(new Producto(oProducto.id, oProducto.descripcion, oProducto.precio, oProducto.stock, oProducto.pathIMG));

    }

    // Devuelve true si el producto especificado se encuentra en la lista de productos
    existeProducto(IdProducto) {
        return this.listaDeProductos.some(producto => producto.id == IdProducto);

    }

    // Devuelve el producto especificado de la lista de productos
    obtenerProducto(IdProducto) {

        if (this.existeProducto(IdProducto)) {
            return this.listaDeProductos.find(producto => producto.id == IdProducto);
        }

        return null;
    }

    // Devuelve un array con los productos que coinciden con la descripcion especificada
    buscarProducto(sDescripcionProducto) {
        return this.listaDeProductos.filter(producto => {
            let descripcionMinusculas = producto.descripcion.toLowerCase();
            let descripcionBuscarMinusculas = sDescripcionProducto.toLowerCase();
            return descripcionMinusculas.includes(descripcionBuscarMinusculas);
        });

    }
}


// Clase para los productos que se agregan al carrito de compras
class ProductoEnCarrito {
    constructor(producto, cantidadProducto) {
        this.id = producto.id;
        this.cantidad = cantidadProducto;
        this.precio = producto.precio;
    }

    // Devuelve el subtotal del producto comprado
    calcularSubtotal() {
        return this.cantidad * this.precio;
    }
}

// Carrito de Compras
class Carrito {
    constructor(listaDeProductosEnCarrito) {
        this.listaDeProductosEnCarrito = listaDeProductosEnCarrito; // Array con objetos ProductoEnCarrito agregados al carrito
    }

    limpiarCarrito() {
        this.listaDeProductosEnCarrito = [];
        return 1;
    }

    obtenerCantidadProductosAgregados() {
        return this.listaDeProductosEnCarrito.length;
    }

    obtenerCantidadProductosTotalesAgregados() {
        return this.listaDeProductosEnCarrito.reduce((acumulador, producto) => acumulador + producto.cantidad, 0);
    }

    obtenerListaDeProductosDelCarrito() {
        return this.listaDeProductosEnCarrito;
    }

    // Agrega un producto al carrito de compras
    agregarProductoAlCarrito(producto, cantidad) {
        // Si ya existe el producto en el carrito, actualizo la cantidad
        if (this.existeProductoEnCarrito(producto.id)) {
            let oProductoEnCarrito;

            oProductoEnCarrito = this.obtenerProductoDelCarrito(producto.id);

            oProductoEnCarrito.cantidad = oProductoEnCarrito.cantidad + cantidad;
        } else { //Si no existe, agregarlo
            this.listaDeProductosEnCarrito.push(new ProductoEnCarrito(producto, cantidad));
        }

    }

    // Devuelve true si el producto especificado se encuentra en el carrito
    existeProductoEnCarrito(IdProducto) {

        return this.listaDeProductosEnCarrito.some(productoEnCarrito => productoEnCarrito.id === IdProducto);

    }

    // Obtiene el producto especificado del carrito de compras
    obtenerProductoDelCarrito(IdProducto) {
        if (this.existeProductoEnCarrito(IdProducto)) {
            return this.listaDeProductosEnCarrito.find(productoEnCarrito => productoEnCarrito.id === IdProducto);
        }

        return null;

    }

    // Actualiza la cantidad del producto en el carrito de compras
    actualizarProductoDelCarrito(IdProducto, cantidad) {
        if (this.existeProductoEnCarrito(IdProducto)) {
            let cantidadAnterior = 0;

            let productoEnCarrito = this.listaDeProductosEnCarrito.find(productoEnCarrito => productoEnCarrito.id === IdProducto);

            cantidadAnterior = productoEnCarrito.cantidad;

            productoEnCarrito.cantidad = cantidad;

            return cantidadAnterior;
        }

        return null;
    }

    // Elimina el producto especificado del carrito de compras
    eliminarProductoDelCarrito(IdProducto) {
        if (this.existeProductoEnCarrito(IdProducto)) {
            listaDeCompras = this.listaDeProductosEnCarrito.filter(productoEnCarrito => productoEnCarrito.id !== IdProducto);
            return this.listaDeProductosEnCarrito.length;
        }

        return null;

    }

    // Suma los subtotales de los productos en el carrito
    calcularPrecioTotal() {
        return this.listaDeProductosEnCarrito.reduce((acumulador, producto) => acumulador + producto.calcularSubtotal(), 0);
    }

}

// Defino como constantes los intereses a aplicar segun el plan de pago
const INTERES_EN_3 = 50;
const INTERES_EN_6 = 75;
const INTERES_EN_12 = 100;
const PRODUCTOS_DISPONIBLES_KEY = "productosDisponibles"; // Para almacenar en el storage
const PRODUCTOS_CARRITO_KEY = "productosEnCarrito"; // Para almacenar en el storage

// Lista de Productos disponibles para comprar
let oListaDeProductos = new ProductosDisponibles([]);

// Carrito de compras GLOBAL
let oCarrito = new Carrito([]);

// Funciones anonimas que van a ser utilizadas como callbacks para calcular el interes segun la cantidad de cuotas
let calcularInteresEn3 = () => INTERES_EN_3 / 100;
let calcularInteresEn6 = () => INTERES_EN_6 / 100;
let calcularInteresEn12 = () => INTERES_EN_12 / 100;

/********** FUNCIONES PRINCIPALES *********/

// Agrego los eventos a todos los botones
function agregarEventosDeBotones() {

    // Asigno el evento al documento para cargar el avatar si el usuario está logueado cuando se cargue la pagina
    document.addEventListener('DOMContentLoaded', inicializarPagina);

    // Busco el boton del carrito
    const btnCarrito = document.getElementById("carrito");
    //btnCarrito.addEventListener("click", () => window.location.href = "../pages/carrito.html");
    btnCarrito.addEventListener("click", mostrarPaginaDelCarrito);

    // Busco los botones de agregar al carrito
    const btnsAgregarCarrito = document.getElementsByClassName("btnAgregarCarrito");

    // Agrego el evento click al boton de busqueda
    const btnBuscar = document.getElementById("btnBuscar");
    btnBuscar.addEventListener("click", buscarProducto);

    // Agrego el evento buscar al input de busqueda
    //const inputBuscar = document.getElementById("textoABuscar");
    //inputBuscar.addEventListener("search", buscarProducto);

    // Les asigno el evento click que acciona agregar el producto al carrito 
    for (const btn of btnsAgregarCarrito) {
        btn.addEventListener('click', agregarAlCarrito);
    }

    // Busco los botones de comprar
    const btnsComprar = document.getElementsByClassName("btnComprar");

    // Les asigno el evento click que acciona la compra del producto individual
    for (const btn of btnsComprar) {
        btn.addEventListener('click', comprar);
    }

    // Asigno el evento al documento para guardar los datos al storage al cerrar la pagina (abrir otra)
    window.addEventListener('pagehide', guardarEnStorage);
}

// Busca los productos al hacer click al boton Buscar
function buscarProducto(event) {

    let textoABuscar = document.getElementById("textoABuscar");

    renderizarProductos(oListaDeProductos.buscarProducto(textoABuscar.value.trim()));

}

// Muestra la pagina del carrito
function mostrarPaginaDelCarrito(){
    let oUsuario = obtenerUsuario();

    // Establezco la clave para mostrar la pagina del carrito en la pagina de login
    localStorage.setItem("mostrarPagina","carrito");

    // Si hay usuario logueado, muestro la pagina del carrito, sino muestro la pagina de login
    window.location.href = oUsuario != null ? "../pages/carrito.html" : "../pages/login.html";

}

// Cierra la sesion del usuario logueado
function cerrarSesion() {

    let oUsuario = obtenerUsuario();

    if (oUsuario != null) {

        if(oUsuario.recordar){
            // Si recordar es verdadero, el usuario esta cargado en el local storage
            localStorage.removeItem("usuario");
        }else{
            // Sino, esta cargado en el session storage
            sessionStorage.removeItem("usuario");
        }

    }
    
    let contenedorUsuario = document.getElementById("contenedorUsuario");
    contenedorUsuario.style.visibility = "hidden";

    // recargo la pagina
    location.reload();

}

// Render Inicio Sesion
function renderLogin() {

    let oULLogin = document.getElementById("ulLogin");

    // Elimino primero los hijos para escribir los nuevos hijos
    oULLogin.replaceChildren();

    let oListItem = document.createElement("li");
    oListItem.classList = "d-flex flex-column align-items-center justify-content-center";
    oULLogin.appendChild(oListItem);

    let oAnchor = document.createElement("a");
    oAnchor.classList = "dropdown-item align-self-center";
    oAnchor.href = "../pages/login.html";
    oAnchor.innerText = "INGRESAR";
    oListItem.appendChild(oAnchor);
}

// Renderizo el menu de usuario
function renderUsuario(sUsuario) {

    let oULLogin = document.getElementById("ulLogin");

    // Elimino primero los hijos para escribir los nuevos hijos
    oULLogin.replaceChildren();

    let oListItem1 = document.createElement("li");
    oListItem1.classList = "d-flex flex-column align-items-center justify-content-center";
    oULLogin.appendChild(oListItem1);

    let oAnchor1 = document.createElement("a");
    oAnchor1.classList = "dropdown-item align-self-center";
    oAnchor1.href = "#";
    oAnchor1.innerText = "Mis datos";
    oListItem1.appendChild(oAnchor1);

    let oListItem2 = document.createElement("li");
    oListItem2.classList = "d-flex flex-column align-items-center justify-content-center";
    oULLogin.appendChild(oListItem2);

    let oAnchor2 = document.createElement("a");
    oAnchor2.classList = "dropdown-item align-self-center";
    oAnchor2.href = "#";
    oAnchor2.innerText = "Mis Direcciones";
    oListItem2.appendChild(oAnchor2);

    let oListItem3 = document.createElement("li");
    oListItem3.classList = "d-flex flex-column align-items-center justify-content-center";
    oULLogin.appendChild(oListItem3);

    let oHR = document.createElement("hr");
    oHR.classList = "dropdown-divider";
    oListItem3.appendChild(oHR);

    let oListItem4 = document.createElement("li");
    oListItem4.classList = "d-flex flex-column align-items-center justify-content-center";
    oULLogin.appendChild(oListItem4);

    let oAnchor4 = document.createElement("a");
    oAnchor4.classList = "dropdown-item align-self-center";
    oAnchor4.id = "cerrarSesion";
    oAnchor4.href = "#";
    oAnchor4.innerText = "Cerrar Sesion";
    oListItem4.appendChild(oAnchor4);

    let contenedorUsuario = document.getElementById("contenedorUsuario");
    contenedorUsuario.style.visibility = "visible";

    let usuario = document.getElementById("usuario");
    usuario.innerText = sUsuario;

    // Agrego el evento link de cerrar sesion
    const oCerrarSesion = document.getElementById("cerrarSesion");
    oCerrarSesion.addEventListener("click", cerrarSesion);

}

// Se ejecuta al iniciar la pagina
function inicializarPagina() {

    // Agregar la ubicacion del usuario en el parrafo del header
    obtenerUbicacion();

    let oUsuario = obtenerUsuario();

    if (oUsuario == null) {

        // Si no esta el usuario en el localStorage y en el sessionStorage, renderizar ingreso de usuario
        renderLogin();

        // Y cargo un avatar de no hay usuario logueado
        document.getElementById("avatar").innerHTML = "<img src='../assets/nouser.jpg' alt='Avatar sin usuario' class='rounded-circle avatar'>";
        

    } else {

        // El usuario esta logueado, renderizo el menu
        renderUsuario(oUsuario.usuario);

        // Carga un avatar aleatorio de acuerdo al nombre de usuario
        getAvatar(oUsuario.usuario);

    }


    return 1;
}

// Obtengo el usuario, ya sea del local o session storage
function obtenerUsuario() {
    let txtUsuario = localStorage.getItem("usuario");

    if (txtUsuario == "null" || txtUsuario == null) {
        // Busco el usuario en el session storage
        txtUsuario = sessionStorage.getItem("usuario");

        if (txtUsuario == "null" || txtUsuario == null) {
            // Si no está en el session storage ni en el local storage, asigno null para simplificar la comparacion
            txtUsuario = null;
            return txtUsuario;
        }
    }

    let oUsuario = JSON.parse(txtUsuario);

    // Devuelvo un objeto usuario
    return oUsuario;
}

// Guardo en el storage los arrays de productos y el carrito, para ser usados en la pagina carrito
function guardarEnStorage() {

    // Guardo en el storage los productos como array de objetos Producto
    localStorage.setItem(PRODUCTOS_DISPONIBLES_KEY, JSON.stringify(oListaDeProductos.obtenerListaDeProductosDisponibles()));

    // Guardo en el storage el carrito como array de objetos ProductoEnCarrito
    localStorage.setItem(PRODUCTOS_CARRITO_KEY, JSON.stringify(oCarrito.obtenerListaDeProductosDelCarrito()));
}

function comprar() {

    Swal.fire({
        title: `¿Desea agregar TV al carrito?`,
        showDenyButton: true,
        //showCancelButton: true,
        confirmButtonText: 'Aceptar',
        denyButtonText: `Cancelar`,
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Se agrego el producto', '', 'success')
            /*
            let productoCarrito = {
                ...producto,
                id: idContadora++
            }
            carrito.push(productoCarrito);
            renderCarrito();
            */
        } else if (result.isDenied) {
            //Swal.fire('No se agregó el producto', '', 'info')
        }
    })
}

// Muestra un alert con el mensaje especificado, usando la libreria Sweet Alert
function mostrarAlert(sMensaje) {
    Swal.fire({
        title: `${sMensaje}`,
        confirmButtonText: 'Aceptar',
    }).then((result) => {
        if (result.isConfirmed) {
            console.log(sMensaje);

        }
    })

}

// Muestra un toast abajo a la derecha con el mensaje especificado, usando la libreria Sweet Alert
async function mostrarToast(sMensaje) {

    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-right',
        iconColor: 'white',
        customClass: {
            popup: 'colored-toast'
        },
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
    })
    await Toast.fire({
        icon: 'success',
        title: sMensaje
    })

}

// Funcion disparada al hacer click en el boton Agregar al carrito
function agregarAlCarrito(event) {

    // Obtengo el ID del producto desde el input hidden, que está antes del boton de agregar al carrito
    let IdProducto = event.target.previousElementSibling.value

    // Obtengo la cantidad a comprar desde el input number, que está antes del input hidden de arriba
    let cantidadAComprar = parseInt(event.target.previousElementSibling.previousElementSibling.value);

    let oProductoSeleccionado = oListaDeProductos.obtenerProducto(IdProducto);

    if (oProductoSeleccionado !== null) {

        // Verificar que haya stock
        if (oProductoSeleccionado.hayStock(cantidadAComprar)) {

            // Agrego el producto al carrito
            oCarrito.agregarProductoAlCarrito(oProductoSeleccionado, cantidadAComprar);

            // Actualizo la cantidad disponible del producto
            oProductoSeleccionado.disminuirStock(cantidadAComprar);

            // Actualizo el input de cantidad
            event.target.previousElementSibling.previousElementSibling.value = 1;
            event.target.previousElementSibling.previousElementSibling.setAttribute("max", oProductoSeleccionado.obtenerStock());

            // Actualizo el número arriba del carrito
            let cantidadEnCarrito = document.getElementById("agregadoCarrito");
            cantidadEnCarrito.innerText = oCarrito.obtenerCantidadProductosTotalesAgregados();
            cantidadEnCarrito.style.visibility = "visible";

            if (oProductoSeleccionado.obtenerStock() == 0) {
                // Deshabilito el boton de agregar al carrito si no hay stock del producto
                event.target.disabled = true;
            }

            mostrarToast(`Se agregaron ${cantidadAComprar} ${oProductoSeleccionado.descripcion} al carrito`);

        } else {
            mostrarAlert("No hay stock del producto indicado. Intente seleccionar menos cantidad.");
        }

    } else {
        mostrarAlert("No se encontro el producto en la lista de productos disponibles");
    }
}

/****************************    APIS   *****************************/

// Devuelve la informacion de la ubicacion del usuario
function obtenerUbicacion() {
    let url = "https://ipapi.co/json/";
    fetch(url)
        .then(res => res.json())
        .then(data => {
            document.getElementById(
                "ubicacion"
            ).innerText = ` ${data.city} - ${data.region} - ${data.country_name}`;
        })
        .catch(error => {
            console.log("error" + error);
        });
}

// Devuelve un avatar aleatorio segun el nombre ingresado
function getAvatar(sNombreUsuario) {
    let avatarId = sNombreUsuario;
    let url = "https://api.multiavatar.com/" + JSON.stringify(avatarId);
    fetch(url)
        .then(res => res.text())
        .then(svg => {
            document.getElementById("avatar").innerHTML = `${svg}`;
        })
        .catch(error => {
            console.log("error" + error);
        });
}

// Inicializo el array con algunos productos y los cargo en el storage
function inicializarProductos() {

    // Limpio el storage
    //localStorage.clear();
    //localStorage.removeItem(PRODUCTOS_DISPONIBLES_KEY);
    //localStorage.removeItem(PRODUCTOS_CARRITO_KEY);

    // Inicializo un array de productos para almacenarlos en el storage
    let productos = [
        { id: 1, descripcion: "Celular Motorhola XXX 5G 64GB", precio: 50000, stock: 15, pathIMG: "./assets/cel1.jpg" },
        { id: 2, descripcion: "Celular Samsoong ZZZ 5G 128GB", precio: 75000, stock: 10, pathIMG: "./assets/cel2.jpg" },
        { id: 3, descripcion: "Celular Aifone YYY 5G 256GB", precio: 100000, stock: 5, pathIMG: "./assets/cel3.jpg" },
        { id: 4, descripcion: "Smart TV Zoni 60 pulgadas", precio: 150000, stock: 30, pathIMG: "./assets/tv1.jpg" },
        { id: 5, descripcion: "Smart TV Elyi 55 pulgadas", precio: 125000, stock: 25, pathIMG: "./assets/tv2.jpg" },
        { id: 6, descripcion: "Smart TV Samsoong 50 pulgadas", precio: 115000, stock: 20, pathIMG: "./assets/tv3.jpg" },
        { id: 7, descripcion: "Notebook Manzana 32GB RAM 1TBSSD EME1", precio: 350000, stock: 40, pathIMG: "./assets/pc1.jpg" },
        { id: 8, descripcion: "Notebook Zoni 16GB RAM 512SSD i9", precio: 300000, stock: 35, pathIMG: "./assets/pc2.jpg" },
        { id: 9, descripcion: "Notebook PELL 16GB RAM 512SSD i7", precio: 250000, stock: 30, pathIMG: "./assets/pc3.jpg" }
    ];

    // Guardo en el storage los productos como array de objetos
    localStorage.setItem(PRODUCTOS_DISPONIBLES_KEY, JSON.stringify(productos));

    // Obtengo el array de productos Disponibles del storage
    let productosDisponibles = JSON.parse(localStorage.getItem(PRODUCTOS_DISPONIBLES_KEY));

    // Cargo todos los productos del storage en el array GLOBAL de productos disponibles
    for (let i = 0; i < productosDisponibles.length; i++) {

        let oProducto = productosDisponibles[i];

        oListaDeProductos.agregarProducto(oProducto);
    }

    return 1;
}

// Carga los productos con la estructura HTML
function renderizarProductos(oProductos) {

    let oFila = document.getElementById("fila");

    // Elimino primero los hijos de la fila para escribir los nuevos hijos
    oFila.replaceChildren();

    // Cargo todos los productos del storage y los formateo con HTML
    for (let i = 0; i < oProductos.length; i++) {

        let oProducto = oProductos[i];

        let oColumna = document.createElement("div");

        oColumna.classList = "col d-flex align-items-stretch";

        oFila.appendChild(oColumna);

        let oCard = document.createElement("div");
        oCard.classList = "card shadow-sm";

        oColumna.appendChild(oCard);

        let oIMG = document.createElement("img");
        oIMG.classList = "card-img-top img-thumbnail rounded";

        oIMG.src = oProducto.pathIMG; // Agregar de producto
        oIMG.alt = oProducto.descripcion; // Agregar de producto

        oCard.appendChild(oIMG);

        let oCardBody = document.createElement("div");

        oCardBody.classList = "card-body";

        oCard.appendChild(oCardBody);

        let oCardTitle = document.createElement("div");

        oCardTitle.classList = "d-flex justify-content-between align-items-center";

        oCardBody.appendChild(oCardTitle);

        let oProductTitle = document.createElement("p");

        oProductTitle.innerText = oProducto.descripcion; // Agregar de producto

        oCardTitle.appendChild(oProductTitle);

        let oProductPrice = document.createElement("p");

        oProductPrice.innerText = "$" + parseFloat(oProducto.precio); // Agregar de producto

        oCardTitle.appendChild(oProductPrice);

        let oCardButtons = document.createElement("div");

        oCardButtons.classList = "d-flex justify-content-between align-items-center";

        oCardBody.appendChild(oCardButtons);

        let oForm = document.createElement("div");

        oCardButtons.appendChild(oForm);

        let oLabel = document.createElement("label");

        oLabel.setAttribute("for", "cantidad" + oProducto.id);  // Agregar del producto
        oLabel.innerText = "Cantidad";

        oForm.appendChild(oLabel);

        let oCantidad = document.createElement("input");

        oCantidad.className = "mx-1";
        oCantidad.type = "number";
        oCantidad.id = "cantidad" + oProducto.id; // Agregar del producto
        oCantidad.name = oCantidad.id; // Agregar del producto
        oCantidad.setAttribute("value", "1");
        oCantidad.min = "1";
        oCantidad.max = oProducto.stock; // Agregar del producto

        oForm.appendChild(oCantidad);

        let oID = document.createElement("input");

        oID.type = "hidden";
        oID.id = "prdID" + oProducto.id; // Agregar del producto
        oID.name = oID.id; // Agregar del producto
        oID.value = oProducto.id;// Agregar del producto

        oForm.appendChild(oID);

        let oAddCart = document.createElement("button");

        oAddCart.type = "button";
        oAddCart.classList = "btn btn-sm btn-outline-primary btnAgregarCarrito";
        oAddCart.innerText = "Agregar al Carrito";

        oForm.appendChild(oAddCart);

        let oBuyButton = document.createElement("button");

        oBuyButton.type = "button";
        oBuyButton.classList = "btn btn-sm btn-outline-primary btnComprar";
        oBuyButton.innerText = "Comprar";

        oCardButtons.appendChild(oBuyButton);
    }

}

// Carga los productos del storage en la pagina
function cargarTodosLosProductos() {

    renderizarProductos(oListaDeProductos.obtenerListaDeProductosDisponibles());

    return 1;

}


/*********************************** INICIO DEL PROGRAMA *****************************/

// Inicializo el array con algunos productos y los cargo en el storage
inicializarProductos();

// Carga todos los productos del storage en la pagina
cargarTodosLosProductos();

// Ejecuto la funcion para agregar eventos
agregarEventosDeBotones();