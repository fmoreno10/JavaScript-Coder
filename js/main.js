
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
    obtenerStock(cantidadAComprar) {
        return this.stock;
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

// array de objetos de tipo Producto
let listaDeProductos = [];

// Carrito de compras GLOBAL
let oCarrito = new Carrito([]);

// Funciones anonimas que van a ser utilizadas como callbacks para calcular el interes segun la cantidad de cuotas
let calcularInteresEn3 = () => INTERES_EN_3 / 100;
let calcularInteresEn6 = () => INTERES_EN_6 / 100;
let calcularInteresEn12 = () => INTERES_EN_12 / 100;

/********** FUNCIONES PRINCIPALES *********/

function agregarEventosDeBotones() {

    // Busco los botones de agregar al carrito
    const btnsAgregarCarrito = document.getElementsByClassName("btnAgregarCarrito");

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

    // Asigno el evento al documento para guardar los datos al storage
    window.addEventListener('pagehide', guardarEnStorage);
}

function guardarEnStorage() {
    
    // Guardo en el storage los productos como array de objetos Producto
    localStorage.setItem(PRODUCTOS_DISPONIBLES_KEY, JSON.stringify(listaDeProductos));
    
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

function agregarAlCarrito(event) {

    // Obtengo el ID del producto desde el input hidden, que está antes del boton de agregar al carrito
    let IdProducto = event.target.previousElementSibling.value

    // Obtengo el ID del producto desde el input number, que está antes del input hidden de arriba
    let cantidadAComprar = parseInt(event.target.previousElementSibling.previousElementSibling.value);

    let oProductoSeleccionado = obtenerProducto(IdProducto);

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

            if (oProductoSeleccionado.obtenerStock() == 0) {
                event.target.disabled = true;
            }


        } else {
            mostrarAlert("No hay stock del producto indicado. Intente seleccionar menos cantidad.");
        }

    } else {
        mostrarAlert("No se encontro el producto en la lista de productos disponibles");
    }

    /*
    obtenerCantidadProductosAgregados()

    // Agrega un producto al carrito de compras
    agregarProductoAlCarrito(producto, cantidad) 

    // Devuelve true si el producto especificado se encuentra en el carrito
    existeProductoEnCarrito(IdProducto)

    // Obtiene el producto especificado del carrito de compras
    obtenerProductoDelCarrito(IdProducto) 

    // Actualiza la cantidad del producto en el carrito de compras
    actualizarProductoDelCarrito(IdProducto, cantidad) 

    // Elimina el producto especificado del carrito de compras
    eliminarProductoDelCarrito(IdProducto) 

    // Suma los subtotales de los productos en el carrito
    calcularPrecioTotal() {
    */
}

// Simula la compra de 1 o mas articulos por parte del usuario
function simularCompra() {
    let respuesta;
    let precioTotal = 0;

    inicializarProductos();
    limpiarCarrito();

    // Se muestran los productos disponibles para la compra
    mostrarProductos();

    // Se da la opcion al usuario de cargar nuevos productos 
    respuesta = obtenerRespuesta("¿Desea ingresar un nuevo producto?");

    if (respuesta == "S") {
        if (crearProductos() < 0) {
            return -1; // El usuario cancelo el programa
        }
    }

    // Se solicita al usuario que ingrese los productos que desea comprar y la cantidad
    if (comprarProductos() < 0) {
        return -1; // El usuario cancelo el programa
    }

    // Se le pregunta al usuario si quiere actualizar la cantidad de algun producto del carrito
    respuesta = obtenerRespuesta("¿Desea modificar la cantidad de algun producto del carrito?");

    while (respuesta == "S") {

        let nombreProducto = prompt("Ingrese el nombre del producto que desea actualizar en el carrito: ");

        if (nombreProducto == "" || nombreProducto == null) {
            break; // El usuario presiono Cancelar o no ingreso datos
        }

        nombreProducto = nombreProducto.toUpperCase();

        if (existeProductoEnCarrito(nombreProducto)) {
            let nuevaCantidad = obtenerCantidad("Ingrese cuantos items de " + nombreProducto + " desea dejar en el carrito: ");

            if (nuevaCantidad < 0) {
                break; // Si el usuario cancela el ingreso de cantidad, sale del bucle
            }

            // Obtengo el producto que ingreso el usuario
            let oProducto = obtenerProducto(nombreProducto);

            // Obtengo el producto del carrito para saber cuanta cantidad hay que devolver al stock
            let oProductoEnCarrito = obtenerProductoDelCarrito(nombreProducto);

            // Primero quito la cantidad agregada al carrito para devolver stock
            oProducto.quitarDelCarrito(oProductoEnCarrito.cantidad);

            // Verificar que haya stock
            if (oProducto.hayStock(nuevaCantidad)) {

                // Actualizo la cantidad disponible del producto
                oProducto.agregarAlCarrito(nuevaCantidad);

                // Actualizo la cantidad del producto en el carrito
                actualizarProductoDelCarrito(nombreProducto, nuevaCantidad);

            } else {
                alert("No hay stock del producto indicado. Intente seleccionar menos cantidad.");
            }
        } else {
            alert("No se encontro el producto " + nombreProducto + " en el carrito.");
        }

        respuesta = obtenerRespuesta("¿Desea actualizar la cantidad de otro producto en el carrito?");

    }

    // Se le pregunta al usuario si quiere quitar algun producto del carrito
    respuesta = obtenerRespuesta("¿Desea quitar algun producto del carrito?");

    while (respuesta == "S") {

        let nombreProducto = prompt("Ingrese el nombre del producto que desea quitar del carrito: ");

        if (nombreProducto == "" || nombreProducto == null) {
            break; // El usuario presiono Cancelar o no ingreso datos
        }

        nombreProducto = nombreProducto.toUpperCase();

        if (existeProductoEnCarrito(nombreProducto)) {

            // Obtengo el producto de los disponibles
            let oProducto = obtenerProducto(nombreProducto);

            // Obtengo el producto del carrito para saber cuanta cantidad hay que devolver al stock
            let oProductoEnCarrito = obtenerProductoDelCarrito(nombreProducto);

            // Actualizo la cantidad disponible del producto
            oProducto.quitarDelCarrito(oProductoEnCarrito.cantidad);

            eliminarProductoDelCarrito(nombreProducto);

        } else {
            alert("No se encontro el producto " + nombreProducto + " en el carrito.");
        }

        respuesta = obtenerRespuesta("¿Desea quitar otro producto del carrito?");

    }

    // Se muestra el carrito de compras antes de realizar el pago
    mostrarProductosDelCarrito();

    precioTotal = calcularPrecioTotal();

    // Se le pregunta al usuario si quiere financiar el monto total y de ser afirmativo, en cuantas cuotas desea pagar    
    respuesta = obtenerRespuesta("¿Desea pagar en cuotas?");

    // El usuario va a pagar en cuotas
    if (respuesta == "S") {
        let montoCuota;
        let cantidadCuotas;

        cantidadCuotas = elegirPlanDePago();

        if (cantidadCuotas) {

            // Se calcula el monto de las cuotas
            montoCuota = calcularMontoCuota(precioTotal, cantidadCuotas);

            // Se muestra el monto total a pagar y el monto de las cuotas
            alert("Usted pagara el monto total de $" + precioTotal + " en " + cantidadCuotas + " pagos de $" + montoCuota);

        } else { // el usuario selecciono 0 para salir y pagar en un pago
            alert("Usted pagara $" + precioTotal + " en un solo pago");
        }

    } else { // el usuario paga el monto total
        alert("El precio total es: $" + precioTotal);
    }

    return 1;
}



/********** FUNCIONES DE PRODUCTOS DISPONIBLES *********/

// Devuelve true si el producto especificado se encuentra en la lista de productos
function existeProducto(IdProducto) {
    return listaDeProductos.some(producto => producto.id == IdProducto);

}

// Devuelve el producto especificado de la lista de productos
function obtenerProducto(IdProducto) {

    if (existeProducto(IdProducto)) {
        return listaDeProductos.find(producto => producto.id == IdProducto);
    }

    return null;
}

// Inicializo el array con algunos productos y los cargo en el storage
function inicializarProductos() {

    // Limpio el storage
    localStorage.clear();

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

    return 1;
}

// Carga los productos del storage en la pagina
function cargarProductos() {

    // Obtengo el array de productos Disponibles del storage
    let productosDisponibles = JSON.parse(localStorage.getItem(PRODUCTOS_DISPONIBLES_KEY));

    let oFila = document.getElementById("fila");

    // Cargo todos los productos del storage y los formateo con HTML
    for (let i = 0; i < productosDisponibles.length; i++) {

        let oProducto = productosDisponibles[i];

        // Agrego los productos ingresados como objetos en el array global de productos
        listaDeProductos.push(new Producto(oProducto.id, oProducto.descripcion, oProducto.precio, oProducto.stock, oProducto.pathIMG));

        let oColumna = document.createElement("div");

        oColumna.classList = "col";

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

    return 1;

}


/*********************************** INICIO DEL PROGRAMA *****************************/

// Inicializo el array con algunos productos y los cargo en el storage
inicializarProductos();

// Carga los productos del storage en la pagina
cargarProductos();

// Ejecuto la funcion para agregar eventos
agregarEventosDeBotones();