
/*************************************************************************************************/
/*                                                                                               */
/*                                            CLASE                                              */
/*                                                                                               */
/*************************************************************************************************/

class Usuario {
    constructor(usuario, password, recordar) {
        this.usuario = usuario;
        this.password = password;
        this.recordar = recordar;
    }
}

/*************************************************************************************************/
/*                                                                                               */
/*                                 FUNCIONES PRINCIPALES                                         */
/*                                                                                               */
/*************************************************************************************************/

// Asigna los eventos a los elementos
function agregarEventos() {

    // Asigno el evento al boton de Aceptar
    let btnAceptar = document.getElementById("btnAceptar");
    btnAceptar.addEventListener('click', ingresarUsuario);

    return 1;
}

// Hace el login del usuario 
function ingresarUsuario() {

    let usuario, password, recordar;

    // Obtengo el nombre de usuario ingresado
    let txtUsuario = document.getElementById("txtUsuario");
    usuario = txtUsuario.value.trim();

    // Obtengo la password ingresada
    let txtPassword = document.getElementById("txtPassword");
    password = txtPassword.value.trim();

    // Obtengo el check box de recordar usuario
    let chkRecordarUsuario = document.getElementById("chkRecordarUsuario");
    recordar = chkRecordarUsuario.checked;

    let oUsuario = new Usuario(usuario, password, recordar);

    // Si recordar esta seleccionado, guardo el usuario en el local storage
    if (recordar === true) {
        localStorage.setItem("usuario", JSON.stringify(oUsuario));
    } else {
        // Si no esta seleccionado, lo guardo en el session storage para que se borre cuando se cierre
        sessionStorage.setItem("usuario", JSON.stringify(oUsuario));
    }

    let oFormLogin = document.getElementById("frmLogin");
    
    // Obtengo la clave para saber si mostrar la pagina del carrito, si no está, muestro el index
    let mostrarCarrito = localStorage.getItem("mostrarPagina");
    localStorage.removeItem("mostrarPagina");
    
    if (mostrarCarrito == "null" || mostrarCarrito == null) {
        // Si la clave no está establecida, muestro el index
        oFormLogin.action = "../index.html";
    } else {
        // Si esta establecida, muestro la pagina del carrito
        oFormLogin.action = "../pages/carrito.html";
    }

}


/*************************************************************************************************/
/*                                                                                               */
/*                                   INICIO DEL PROGRAMA                                         */
/*                                                                                               */
/*************************************************************************************************/

agregarEventos();