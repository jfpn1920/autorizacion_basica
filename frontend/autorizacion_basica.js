//---------------------------------------//
//--|funcionalidad_autorizacion_basica|--//
//---------------------------------------//
const formulario = document.getElementById("formulario");
const inputSolicitante = document.getElementById("solicitante");
const selectTipo = document.getElementById("tipo");
const inputDetalle = document.getElementById("detalle");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("lista");
const textoVacio = document.getElementById("vacio");
const botonesFiltro = document.querySelectorAll(".filtro");
const contPendiente = document.getElementById("contPendiente");
const contAceptada = document.getElementById("contAceptada");
const contRechazada = document.getElementById("contRechazada");
const contTodas = document.getElementById("contTodas");
//-------------------//
//--|datos_ejemplo|--//
//-------------------//
const ejemplos = [
    {
        id: 1,
        solicitante: "Laura Gómez",
        tipo: "Permiso",
        detalle: "Salir temprano el viernes",
        estado: "pendiente",
        fecha: ""
    },
    {
        id: 2,
        solicitante: "Andrés Ruiz",
        tipo: "Compra",
        detalle: "Una impresora para la oficina",
        estado: "pendiente",
        fecha: ""
    },
    {
        id: 3,
        solicitante: "Marta Peña",
        tipo: "Vacaciones",
        detalle: "Del 10 al 20 de diciembre",
        estado: "pendiente",
        fecha: ""
    }
];
//--------------------------//
//--|almacenamiento_local|--//
//--------------------------//
const CLAVE = "autorizacion_estado";
function nuevoEstado() {
    return {
        solicitudes: ejemplos,
        filtro: "pendiente",
        borrador: { solicitante: "", tipo: "Permiso", detalle: "" }
    };
}
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        if (guardado) {
            return JSON.parse(guardado);
        }
        return nuevoEstado();
    } catch (error) {
        return nuevoEstado();
    }
}
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
let estado = leerEstado();
//--------------------------//
//--|acciones_solicitudes|--//
//--------------------------//
function agregarSolicitud(evento) {
    evento.preventDefault();
    const solicitante = inputSolicitante.value.trim();
    const detalle = inputDetalle.value.trim();
    if (solicitante.length < 3) {
        mensaje.textContent = "Escribe el nombre del solicitante.";
        return;
    }
    if (detalle.length < 5) {
        mensaje.textContent = "Describe la solicitud (mínimo 5 letras).";
        return;
    }
    estado.solicitudes.unshift({
        id: Date.now(),
        solicitante: solicitante,
        tipo: selectTipo.value,
        detalle: detalle,
        estado: "pendiente",
        fecha: new Date().toLocaleDateString("es-CO")
    });
    estado.filtro = "pendiente";
    estado.borrador = { solicitante: "", tipo: "Permiso", detalle: "" };
    guardarEstado();
    formulario.reset();
    mensaje.textContent = "";
    dibujarPantalla();
}
function cambiarEstado(id, nuevoEstadoSolicitud) {
    const solicitud = estado.solicitudes.find((s) => s.id === id);
    solicitud.estado = nuevoEstadoSolicitud;
    guardarEstado();
    dibujarPantalla();
}
function eliminarSolicitud(id) {
    estado.solicitudes = estado.solicitudes.filter((s) => s.id !== id);
    guardarEstado();
    dibujarPantalla();
}
function contar(tipoEstado) {
    return estado.solicitudes.filter((s) => s.estado === tipoEstado).length;
}
//----------------------//
//--|creacion_botones|--//
//----------------------//
function crearBoton(texto, clase, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = clase;
    boton.addEventListener("click", accion);
    return boton;
}
//--------------//
//--|pantalla|--//
//--------------//
function dibujarPantalla() {
    contPendiente.textContent = contar("pendiente");
    contAceptada.textContent = contar("aceptada");
    contRechazada.textContent = contar("rechazada");
    contTodas.textContent = estado.solicitudes.length;
    botonesFiltro.forEach((boton) => {
        boton.classList.toggle("activo", boton.dataset.filtro === estado.filtro);
    });
    const visibles = [];
    estado.solicitudes.forEach((solicitud) => {
        if (estado.filtro === "todas" || solicitud.estado === estado.filtro) {
            visibles.push(solicitud);
        }
    });
    lista.innerHTML = "";
    visibles.forEach((solicitud) => {
        const item = document.createElement("li");
        item.className = "item";
        const cabecera = document.createElement("div");
        cabecera.className = "item-cabecera";
        const nombre = document.createElement("span");
        nombre.className = "item-nombre";
        nombre.textContent = solicitud.solicitante;
        const etiqueta = document.createElement("span");
        etiqueta.className = "estado " + solicitud.estado;
        etiqueta.textContent = solicitud.estado;
        cabecera.appendChild(nombre);
        cabecera.appendChild(etiqueta);
        const detalle = document.createElement("p");
        detalle.className = "item-detalle";
        let texto = solicitud.tipo + ": " + solicitud.detalle;
        if (solicitud.fecha) {
            texto = texto + " (" + solicitud.fecha + ")";
        }
        detalle.textContent = texto;
        const acciones = document.createElement("div");
        acciones.className = "acciones";
        if (solicitud.estado === "pendiente") {
            acciones.appendChild(crearBoton("Aceptar", "btn-aceptar", () => cambiarEstado(solicitud.id, "aceptada")));
            acciones.appendChild(crearBoton("Rechazar", "btn-rechazar", () => cambiarEstado(solicitud.id, "rechazada")));
        } else {
            acciones.appendChild(crearBoton("Deshacer", "btn-neutro", () => cambiarEstado(solicitud.id, "pendiente")));
        }
        acciones.appendChild(crearBoton("Eliminar", "btn-neutro", () => eliminarSolicitud(solicitud.id)));
        item.appendChild(cabecera);
        item.appendChild(detalle);
        item.appendChild(acciones);
        lista.appendChild(item);
    });
    textoVacio.hidden = visibles.length > 0;
    textoVacio.textContent = "No hay solicitudes en esta vista.";
}
//-------------//
//--|eventos|--//
//-------------//
formulario.addEventListener("submit", agregarSolicitud);
botonesFiltro.forEach((boton) => {
    boton.addEventListener("click", () => {
        estado.filtro = boton.dataset.filtro;
        guardarEstado();
        dibujarPantalla();
    });
});
formulario.addEventListener("input", () => {
    estado.borrador = {
        solicitante: inputSolicitante.value,
        tipo: selectTipo.value,
        detalle: inputDetalle.value
    };
    guardarEstado();
});
//--------------//
//--|arranque|--//
//--------------//
inputSolicitante.value = estado.borrador.solicitante;
selectTipo.value = estado.borrador.tipo;
inputDetalle.value = estado.borrador.detalle;
dibujarPantalla();