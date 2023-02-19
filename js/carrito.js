
/*************************************************************************************************/
/*                                                                                               */
/*                                         CONSTANTES                                            */
/*                                                                                               */
/*************************************************************************************************/

// Defino como constantes los intereses a aplicar segun el plan de pago
const INTERES_EN_3 = 50;
const INTERES_EN_6 = 75;
const INTERES_EN_12 = 100;
const PRODUCTOS_DISPONIBLES_KEY = "productosDisponibles"; // Para almacenar en el storage
const PRODUCTOS_CARRITO_KEY = "productosEnCarrito"; // Para almacenar en el storage
const ETIQUETA_PRECIO_TOTAL = "precioTotal"; // Etiqueta con el monto total a pagar

/*************************************************************************************************/
/*                                                                                               */
/*                                         CALLBACKS                                             */
/*                                                                                               */
/*************************************************************************************************/

// Funciones anonimas que van a ser utilizadas como callbacks para calcular el interes segun la cantidad de cuotas
let calcularInteresEn3 = () => INTERES_EN_3 / 100;
let calcularInteresEn6 = () => INTERES_EN_6 / 100;
let calcularInteresEn12 = () => INTERES_EN_12 / 100;

/*************************************************************************************************/
/*                                                                                               */
/*                                          CLASES                                               */
/*                                                                                               */
/*************************************************************************************************/

// Clase para los productos disponibles
class Producto {
    constructor(id, descripcion, precio, stock, pathIMG) {
        this.id = id;
        this.pathIMG = pathIMG;
        this.descripcion = descripcion.toUpperCase();
        this.precio = parseFloat(precio) ?? 0;
        this.stock = parseInt(stock) ?? 0;
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
    constructor() {
        this.listaDeProductosEnCarrito = []; // Array con objetos ProductoEnCarrito agregados al carrito
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
            this.listaDeProductosEnCarrito = this.listaDeProductosEnCarrito.filter(productoEnCarrito => productoEnCarrito.id !== IdProducto);
            return this.listaDeProductosEnCarrito.length;
        }

        return null;

    }

    // Suma los subtotales de los productos en el carrito
    calcularPrecioTotal() {
        return this.listaDeProductosEnCarrito.reduce((acumulador, producto) => acumulador + producto.calcularSubtotal(), 0);
    }


}

/*************************************************************************************************/
/*                                                                                               */
/*                                          GLOBAL                                               */
/*                                                                                               */
/*************************************************************************************************/

// array de objetos de tipo Producto
let listaDeProductos = [];

// Carrito de compras GLOBAL
let oCarrito;

/*************************************************************************************************/
/*                                                                                               */
/*                             FUNCIONES DE LA FINANCIACION                                      */
/*                                                                                               */
/*************************************************************************************************/

//Calcula el monto de la cuota segun la cantidad de cuotas elegidas
function calcularMontoCuota(precioTotal, cuotas) {
    let precioCuota;

    let montoConInteres = calcularMontoConInteres(precioTotal, cuotas);

    precioCuota = montoConInteres / cuotas;

    return Math.round(precioCuota);

}

// Devuelve el interes que se aplica segun la cantidad de cuotas
function obtenerInteres(cuotas) {
    let interes;

    switch (parseInt(cuotas)) {

        case 3:
            interes = INTERES_EN_3;
            break;
        case 6:
            interes = INTERES_EN_6;
            break;
        case 12:
            interes = INTERES_EN_12;
            break;

        default:
            interes = 0;
            break;
    }

    return interes;
}

// Devuelve el monto total a pagar con interes segun la cantidad de cuotas elegidas
function calcularMontoConInteres(precioTotal, cuotas) {
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

    return montoConInteres;
}

// Calcula el monto con interes del precio ingresado
function calcularInteres(precio, calcularInteresCB) {
    return precio + precio * calcularInteresCB();
}

/*************************************************************************************************/
/*                                                                                               */
/*                               FUNCIONES DE PRODUCTOS DISPONIBLES                              */
/*                                                                                               */
/*************************************************************************************************/

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

/*************************************************************************************************/
/*                                                                                               */
/*                                       FUNCIONES PRINCIPALES                                   */
/*                                                                                               */
/*************************************************************************************************/

// Boton de tacho para quitar el producto del carrito
function quitarDelCarrito(event) {

    let IdProducto = parseInt(event.target.previousElementSibling.value);

    // Obtengo la cantidad de la etiqueta
    let cantidad = parseInt(event.target.previousElementSibling.previousElementSibling.firstElementChild.nextElementSibling.innerText);

    // Elimino el producto del carrito
    oCarrito.eliminarProductoDelCarrito(IdProducto);

    let oProductoSeleccionado = obtenerProducto(IdProducto);

    // Devuelvo el stock del producto
    oProductoSeleccionado.aumentarStock(cantidad);

    // Elimino el elemento HTML
    event.target.parentNode.parentNode.remove();

    let cantidadEnCarrito = oCarrito.obtenerCantidadProductosAgregados();

    if (cantidadEnCarrito) {

        let cantidadCarrito = document.getElementById("cantidadCarrito");

        cantidadCarrito.innerText = oCarrito.obtenerCantidadProductosAgregados();

        // Actualizar el monto total
        let precioFinal = document.getElementById(ETIQUETA_PRECIO_TOTAL);
        precioFinal.innerText = "$" + oCarrito.calcularPrecioTotal();

        // Actualizar la etiqueta final con el monto a pagar y la financiacion
        cargarPago();

    } else {
        // Si no quedan productos en el carrito, vuelve a la página de inicio
        window.location.href = "../index.html"
    }

}

// Boton de mas en el carrito para agregar cantidad
function agregarCantidadAlCarrito(event) {

    // Obtengo el ID del producto desde el input hidden, siguiente hermano del padre
    let IdProducto = parseInt(event.target.parentNode.nextElementSibling.value);

    // Obtengo la cantidad de la etiqueta
    let cantidad = parseInt(event.target.previousElementSibling.innerText);
    cantidad++;

    let oProductoSeleccionado = obtenerProducto(IdProducto);

    // Aumentar cantidad si hay stock  
    if (oProductoSeleccionado.obtenerStock() > 0) {

        // Disminuyo en 1 el stock del producto
        oProductoSeleccionado.disminuirStock(1);

        // Actualizo la cantidad en la etiqueta
        event.target.previousElementSibling.innerText = cantidad;

        // Actualizar la cantidad del producto en el carrito
        oCarrito.actualizarProductoDelCarrito(IdProducto, cantidad);

        // Actualizar la etiqueta con el subtotal
        event.target.parentNode.parentNode.nextElementSibling.innerText = "$" + oCarrito.obtenerProductoDelCarrito(IdProducto).calcularSubtotal();

        // Actualizar el monto total
        let precioFinal = document.getElementById(ETIQUETA_PRECIO_TOTAL);
        precioFinal.innerText = "$" + oCarrito.calcularPrecioTotal();

        // Actualizar la etiqueta final con el monto a pagar y la financiacion
        cargarPago();

    }
}

// Boton de menos en el carrito para sacar cantidad
function sacarCantidadAlCarrito(event) {

    let cantidad = parseInt(event.target.nextElementSibling.innerText);

    // Disminuir cantidad si cantidad es mayor a 1 cantidad si hay stock  
    if (cantidad > 1) {

        // Obtengo el ID del producto desde el input hidden, siguiente hermano del padre
        let IdProducto = parseInt(event.target.parentNode.nextElementSibling.value);

        let oProductoSeleccionado = obtenerProducto(IdProducto);

        // Aumento en 1 el stock del producto
        oProductoSeleccionado.aumentarStock(1);

        cantidad--;

        // Actualizo la cantidad en la etiqueta
        event.target.nextElementSibling.innerText = cantidad;

        // Actualizar la cantidad del producto en el carrito
        oCarrito.actualizarProductoDelCarrito(IdProducto, cantidad);

        // Actualizar la etiqueta con el subtotal
        event.target.parentNode.parentNode.nextElementSibling.innerText = "$" + oCarrito.obtenerProductoDelCarrito(IdProducto).calcularSubtotal();

        // Actualizar el monto total
        let precioFinal = document.getElementById(ETIQUETA_PRECIO_TOTAL);
        precioFinal.innerText = "$" + oCarrito.calcularPrecioTotal();

        // Actualizar la etiqueta final con el monto a pagar y la financiacion
        cargarPago();

    }

}

// Muestra el monto final a pagar con intereses segun las cuotas elegidas
function cargarPago() {
    // Obtengo el select de cuotas 
    let selCuotas = document.getElementById("cuotas");

    // Obtengo el valor de cuotas seleccionadas por el usuario
    let cantidadCuotas = parseInt(selCuotas.value);

    // Obtengo el monto total del carrito
    let precioTotal = oCarrito.calcularPrecioTotal();
    let montoConInteres = calcularMontoConInteres(precioTotal, cantidadCuotas);

    let interes = obtenerInteres(cantidadCuotas);

    // Se calcula el monto de las cuotas
    let montoCuota = calcularMontoCuota(precioTotal, cantidadCuotas);

    // Obtengo el elemento etiqueta para indicar el monto final y las cuotas
    let oLabel = document.getElementById("pagoFinal").firstElementChild

    oLabel.innerText = `Usted pagara el monto total de $${montoConInteres} en ${cantidadCuotas} pagos de $${montoCuota}
                        Interes: %${interes}`;

}

// Simula el pago
function pagar() {

    Swal.fire({
        title: `Redirecciona a la pagina de pago...`,
        showDenyButton: false,
        confirmButtonText: 'Aceptar',
        denyButtonText: `Cancelar`,
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "../index.html"
        }
    });

}

/*************************************************************************************************/
/*                                                                                               */
/*                                  FUNCIONES DE INICIALIZACION                                  */
/*                                                                                               */
/*************************************************************************************************/

// Asigna los eventos a los elementos
function agregarEventos() {

    // Asigno el evento al documento para cargar los productos del carrito cuando se cargue la pagina
    document.addEventListener('DOMContentLoaded', cargarCarrito);

    // Asigno el evento para mostrar la etiqueta con el monto a pagar cuando se termine de cargar la pagina
    window.addEventListener('pageshow', cargarPago);

    // Asigno el evento al boton de pagar
    let btnPagar = document.getElementById("btnPagar");
    btnPagar.addEventListener('click', pagar);

    // Asigno el evento al documento para guardar los datos al storage
    window.addEventListener('pagehide', guardarEnStorage);

    // Asigno el evento al cambiar la cantidad de cuotas
    let selCuotas = document.getElementById("cuotas");
    selCuotas.addEventListener('change', cargarPago);

    // Busco los botones de agregar cantidad
    const btnsAgregarCantidad = document.getElementsByClassName("spanMas");

    // Les asigno el evento click que acciona agregar mas cantidad del producto al carrito 
    for (const btn of btnsAgregarCantidad) {
        btn.addEventListener('click', agregarCantidadAlCarrito);
    }

    // Busco los botones de sacar cantidad
    const btnsSacarCantidad = document.getElementsByClassName("spanMenos");

    // Les asigno el evento click que acciona sacar cantidad del producto al carrito 
    for (const btn of btnsSacarCantidad) {
        btn.addEventListener('click', sacarCantidadAlCarrito);
    }

    // Busco los botones de quitar producto (tachito)
    const btnsQuitar = document.getElementsByClassName("trashIcon");

    // Les asigno el evento click que acciona quitar el producto del carrito 
    for (const btn of btnsQuitar) {
        btn.addEventListener('click', quitarDelCarrito);
    }

    return 1;
}

// Cargo los productos del carrito en la pagina con elementos HTML
function cargarCarrito() {

    // Borro la clave establecida en el index para mostrar la pagina del carrito en la pagina de login
    localStorage.removeItem("mostrarPagina");

    // Obtengo el array de productos Disponibles del storage
    let productosDisponibles = JSON.parse(localStorage.getItem(PRODUCTOS_DISPONIBLES_KEY));

    cargarCarritoDelStorage();

    // Cargo todos los productos del storage en el array listaDeProductos para tener los metodos
    for (let i = 0; i < productosDisponibles.length; i++) {

        let oProducto = productosDisponibles[i];

        // Desestructuro el objeto en variables
        let {id, descripcion, precio, stock, pathIMG} = oProducto;

        // Agrego los productos ingresados como objetos en el array global de productos
        listaDeProductos.push(new Producto(id, descripcion, precio, stock, pathIMG));

    }

    let oLista = document.getElementById("lista");
    let cantidadCarrito = document.getElementById("cantidadCarrito");

    let cantidad = oCarrito.obtenerCantidadProductosTotalesAgregados();

    cantidadCarrito.innerText = cantidad;
    let productosEnCarrito = oCarrito.obtenerListaDeProductosDelCarrito();

    let btnPagar = document.getElementById("btnPagar");

    // Deshabilitar el boton de pago si el carrito está vacío
    btnPagar.disabled = cantidad == 0;

    let precioTotal = oCarrito.calcularPrecioTotal();

    // Cargo todos los productos del storage en el array listaDeProductos para tener los metodos
    for (let i = 0; i < productosEnCarrito.length; i++) {
        let oProductoEnCarrito = productosEnCarrito[i];

        // Desestructuro en variables
        let {id, cantidad} = oProductoEnCarrito;

        let oProductoDisponible = obtenerProducto(id);

        let oListItem = document.createElement("li");

        oListItem.classList = "list-group-item d-flex justify-content-between lh-sm";

        oLista.appendChild(oListItem);

        let oIMG = document.createElement("img");
        oIMG.classList = "imgMiniatura";
    
        oIMG.src = "." + oProductoDisponible.pathIMG; // Agregar de producto
        oIMG.alt = oProductoDisponible.descripcion; // Agregar de producto
    
        oListItem.appendChild(oIMG);

        let oDiv = document.createElement("div");

        oDiv.classList = "flex-grow-1";

        oListItem.appendChild(oDiv);

        let oHeader = document.createElement("h6");

        oHeader.classList = "my-0";

        oHeader.innerText = oProductoDisponible.descripcion;

        oDiv.appendChild(oHeader);

        // Crear un div con la cantidad, un mas y un menos para cambiar cantidad y un tachito para quitar el producto
        let oDivCantidad = document.createElement("div");

        oDivCantidad.classList = "divCantidad";

        oDiv.appendChild(oDivCantidad);

        let oSpanMenos = document.createElement("span");

        oSpanMenos.classList = "text-muted spanMenos";
        oSpanMenos.onclick = sacarCantidadAlCarrito;
        oSpanMenos.innerText = "-";
        oSpanMenos.title = "Sacar";
        oDivCantidad.appendChild(oSpanMenos);

        let oSmall = document.createElement("small");

        oSmall.classList = "text-muted smallCantidad";
        oSmall.innerText = cantidad;

        oDivCantidad.appendChild(oSmall);

        let oSpanMas = document.createElement("span");

        oSpanMas.classList = "text-muted spanMas";
        oSpanMas.onclick = agregarCantidadAlCarrito;
        oSpanMas.innerText = "+";
        oSpanMas.title = "Agregar";
        oDivCantidad.appendChild(oSpanMas);

        let oID = document.createElement("input");

        oID.type = "hidden";
        oID.id = "prdID" + id;
        oID.name = oID.id;
        oID.value = id;

        oDiv.appendChild(oID);

        let oIMGTrash = document.createElement("img");

        oIMGTrash.classList = "trashIcon";
        oIMGTrash.onclick = quitarDelCarrito;

        oIMGTrash.src = "../assets/trash.jpg";
        oIMGTrash.alt = "Quitar Producto";
        oIMGTrash.title = "Quitar Producto";

        oDiv.appendChild(oIMGTrash);

        let oSpan = document.createElement("span");

        oSpan.classList = "text-muted";
        oSpan.innerText = "$" + oProductoEnCarrito.calcularSubtotal();

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
    oStrongPrecioFinal.id = ETIQUETA_PRECIO_TOTAL;

    oListItemTotal.appendChild(oStrongPrecioFinal);

}

// Guardo los productos disponibles y los productos del carrito en el storage
function guardarEnStorage() {

    // Guardo en el storage los productos como array de objetos Producto
    localStorage.setItem(PRODUCTOS_DISPONIBLES_KEY, JSON.stringify(listaDeProductos));

    // Guardo en el storage el carrito como array de objetos ProductoEnCarrito
    localStorage.setItem(PRODUCTOS_CARRITO_KEY, JSON.stringify(oCarrito.obtenerListaDeProductosDelCarrito()));
}

// Carga en el objeto Global oCarrito, el array de productos carrito almacenados en el storage
function cargarCarritoDelStorage() {

    let productosEnCarrito = JSON.parse(localStorage.getItem(PRODUCTOS_CARRITO_KEY));

    oCarrito = new Carrito();

    // Cargo todos los productos del storage en el array listaDeProductos para tener los metodos
    for (let i = 0; i < productosEnCarrito.length; i++) {

        let oProductoEnCarrito = productosEnCarrito[i];

        oCarrito.agregarProductoAlCarrito(oProductoEnCarrito, oProductoEnCarrito.cantidad);
    }

}

/*************************************************************************************************/
/*                                                                                               */
/*                                       INICIO DEL PROGRAMA                                     */
/*                                                                                               */
/*************************************************************************************************/

agregarEventos();