
// Defino como constantes los intereses a aplicar segun el plan de pago
const INTERES_EN_3 = 50;
const INTERES_EN_6 = 75;
const INTERES_EN_12 = 100;
const PRODUCTOS_DISPONIBLES_KEY = "productosDisponibles"; // Para almacenar en el storage
const PRODUCTOS_CARRITO_KEY = "productosEnCarrito"; // Para almacenar en el storage

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

// array de objetos de tipo Producto
let listaDeProductos = [];

// Carrito de compras GLOBAL
let oCarrito;// = new Carrito([]);

// Funciones anonimas que van a ser utilizadas como callbacks para calcular el interes segun la cantidad de cuotas
let calcularInteresEn3 = () => INTERES_EN_3 / 100;
let calcularInteresEn6 = () => INTERES_EN_6 / 100;
let calcularInteresEn12 = () => INTERES_EN_12 / 100;

/********** FUNCIONES DE LA FINANCIACION *********/

//Calcula el monto del pago segun la cantidad de cuotas elegidas
function calcularMontoCuota(precioTotal, cuotas) {
    let precioCuota;
    let montoConInteres;

    switch (parseInt(cuotas)) {
        case 1:
            montoConInteres = precioTotal;
            break;
        case 3:
            montoConInteres = calcularInteres(precioTotal, calcularInteresEn3);
            break;
        case 6:
            montoConInteres = calcularInteres(precioTotal, calcularInteresEn6);
            break;
        case 12:
            montoConInteres = calcularInteres(precioTotal, calcularInteresEn12);
            break;

        default:
            montoConInteres = 0;
            break;
    }

    precioCuota = montoConInteres / cuotas;

    return Math.round(precioCuota);

}
function calcularInteres(precio, calcularInteresCB) {
    return precio + precio * calcularInteresCB();
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

/********** FUNCIONES PRINCIPALES *********/

function agregarEventos() {

    // Asigno el evento al documento para cargar los productos del carrito cuando se cargue la pagina
    document.addEventListener('DOMContentLoaded', cargarCarrito);

    // Asigno el evento al boton de pagar
    let btnPagar = document.getElementById("btnPagar");
    btnPagar.addEventListener('click', pagar);

    // Asigno el evento al documento para guardar los datos al storage
    window.addEventListener('pagehide', guardarEnStorage);

    return 1;
}

function pagar() {

    let oCuotas = document.getElementById("cuotas");

    let productosEnCarrito = JSON.parse(localStorage.getItem(PRODUCTOS_CARRITO_KEY));

    let precioTotal = 0;

    // Cargo todos los productos del storage en el array listaDeProductos para tener los metodos
    for (let i = 0; i < productosEnCarrito.length; i++) {
        let oProductoEnCarrito = productosEnCarrito[i];

        precioTotal = precioTotal + (oProductoEnCarrito.cantidad * oProductoEnCarrito.precio);
    }

    // Se calcula el monto de las cuotas
    let montoCuota = calcularMontoCuota(precioTotal, oCuotas.value);

    //alert("El monto de la cuota es de : " + montoCuota);
    alert(montoCuota);
}

function guardarEnStorage() {

    // Guardo en el storage los productos como array de objetos Producto
    localStorage.setItem(PRODUCTOS_DISPONIBLES_KEY, JSON.stringify(listaDeProductos));

    // Guardo en el storage el carrito como array de objetos ProductoEnCarrito
    localStorage.setItem(PRODUCTOS_CARRITO_KEY, JSON.stringify(oCarrito.obtenerListaDeProductosDelCarrito()));
}

function cargarCarrito() {

    // Obtengo el array de productos Disponibles del storage
    let productosDisponibles = JSON.parse(localStorage.getItem(PRODUCTOS_DISPONIBLES_KEY));
    let productosEnCarrito = JSON.parse(localStorage.getItem(PRODUCTOS_CARRITO_KEY));

    oCarrito = new Carrito(productosEnCarrito);

    // Cargo todos los productos del storage en el array listaDeProductos para tener los metodos
    for (let i = 0; i < productosDisponibles.length; i++) {

        let oProducto = productosDisponibles[i];

        // Agrego los productos ingresados como objetos en el array global de productos
        listaDeProductos.push(new Producto(oProducto.id, oProducto.descripcion, oProducto.precio, oProducto.stock, oProducto.pathIMG));

    }

    let oLista = document.getElementById("lista");
    let cantidadCarrito = document.getElementById("cantidadCarrito");

    cantidadCarrito.innerText = oCarrito.obtenerCantidadProductosAgregados();

    let precioTotal = 0;

    // Cargo todos los productos del storage en el array listaDeProductos para tener los metodos
    for (let i = 0; i < productosEnCarrito.length; i++) {
        let oProductoEnCarrito = productosEnCarrito[i];
        let oProductoDisponible = obtenerProducto(oProductoEnCarrito.id);

        precioTotal = precioTotal + (oProductoEnCarrito.cantidad * oProductoEnCarrito.precio);

        let oListItem = document.createElement("li");

        oListItem.classList = "list-group-item d-flex justify-content-between lh-sm";

        oLista.appendChild(oListItem);

        let oDiv = document.createElement("div");

        oListItem.appendChild(oDiv);

        let oHeader = document.createElement("h6");

        oHeader.classList = "my-0";

        oHeader.innerText = oProductoDisponible.descripcion;

        oDiv.appendChild(oHeader);

        let oSmall = document.createElement("small");

        oSmall.classList = "text-muted";
        oSmall.innerText = "Cantidad: " + oProductoEnCarrito.cantidad

        oDiv.appendChild(oSmall);

        let oSpan = document.createElement("span");

        oSpan.classList = "text-muted";
        oSpan.innerText = "$" + (oProductoEnCarrito.cantidad * oProductoDisponible.precio);

        oListItem.appendChild(oSpan);

    }

    let oListItemTotal = document.createElement("li");

    oListItemTotal.classList = "list-group-item d-flex justify-content-between";

    oLista.appendChild(oListItemTotal);

    let oSpanTotal = document.createElement("span");

    oSpanTotal.classList = "text-muted";
    oSpanTotal.innerText = "Total (ARS)";

    oListItemTotal.appendChild(oSpanTotal);

    let oStrongPrecioFinal = document.createElement("label");

    oStrongPrecioFinal.classList = "text-muted";
    oStrongPrecioFinal.innerText = "$" + precioTotal;

    oListItemTotal.appendChild(oStrongPrecioFinal);


}

agregarEventos();