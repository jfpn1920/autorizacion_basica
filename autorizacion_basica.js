// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const formulario = document.getElementById('formulario');
const inputSolicitante = document.getElementById('solicitante');
const selectTipo = document.getElementById('tipo');
const inputDetalle = document.getElementById('detalle');
const mensaje = document.getElementById('mensaje');
const lista = document.getElementById('lista');
const textoVacio = document.getElementById('vacio');
const botonesFiltro = document.querySelectorAll('.filtro');
// ===== CLAVE DE LOCALSTORAGE =====
const CLAVE = 'autorizacion_estado';
// ===== SOLICITUDES DE EJEMPLO (solo se usan la primera vez) =====
const ejemplos = [
    { id: 1, solicitante: 'Laura Gómez', tipo: 'Permiso', detalle: 'Salir temprano el viernes', estado: 'pendiente', fecha: '' },
    { id: 2, solicitante: 'Andrés Ruiz', tipo: 'Compra', detalle: 'Una impresora para la oficina', estado: 'pendiente', fecha: '' },
    { id: 3, solicitante: 'Marta Peña', tipo: 'Vacaciones', detalle: 'Del 10 al 20 de diciembre', estado: 'pendiente', fecha: '' }
];
// ===== ESTADO POR DEFECTO =====
// solicitudes: lista completa | filtro: vista actual | borrador: lo escrito en el formulario
const estadoInicial = {
    solicitudes: ejemplos,
    filtro: 'pendiente',
    borrador: { solicitante: '', tipo: 'Permiso', detalle: '' }
};
// ===== LEER EL ESTADO GUARDADO =====
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        // Si hay datos guardados los usamos; si no, partimos del estado inicial
        return guardado ? { ...estadoInicial, ...JSON.parse(guardado) } : { ...estadoInicial };
    } catch (error) {
      return { ...estadoInicial }; // si algo falla, empezamos desde cero
    }
}
// Al cargar la página recuperamos todo lo guardado
let estado = leerEstado();
// ===== GUARDAR EL ESTADO =====
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
// ===== CREAR UNA SOLICITUD =====
function agregarSolicitud(evento) {
    evento.preventDefault();  // evita que la página se recargue
    const solicitante = inputSolicitante.value.trim();
    const detalle = inputDetalle.value.trim();
    // Validaciones: si algo está mal, mostramos el error y salimos
    if (solicitante.length < 3) return (mensaje.textContent = 'Escribe el nombre del solicitante.');
    if (detalle.length < 5) return (mensaje.textContent = 'Describe la solicitud (mínimo 5 letras).');
    estado.solicitudes.unshift({           // unshift la pone de primera en la lista
        id: Date.now(), solicitante, tipo: selectTipo.value, detalle, estado: 'pendiente',
        fecha: new Date().toLocaleDateString('es-CO')
    });
    estado.filtro = 'pendiente';           // mostramos las pendientes para verla
    estado.borrador = { ...estadoInicial.borrador };
    guardarEstado();
    formulario.reset();
    mensaje.textContent = '';
    dibujarPantalla();
}
// ===== ACEPTAR, RECHAZAR O DEJAR EN PENDIENTE =====
function cambiarEstado(id, nuevoEstado) {
    const solicitud = estado.solicitudes.find(s => s.id === id);
    solicitud.estado = nuevoEstado;
    guardarEstado();
    dibujarPantalla();
}
// ===== ELIMINAR UNA SOLICITUD =====
function eliminarSolicitud(id) {
    estado.solicitudes = estado.solicitudes.filter(s => s.id !== id);  // conserva todas menos esa
    guardarEstado();
    dibujarPantalla();  
}
// ===== CREAR UN BOTÓN (texto, clase y acción al hacer clic) =====
function crearBoton(texto, clase, accion) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = texto;
    boton.className = clase;
    boton.addEventListener('click', accion);
    return boton;
}
// ===== ACTUALIZAR TODO LO QUE SE VE EN PANTALLA =====
function dibujarPantalla() {
    // Contadores de cada filtro
    ['pendiente', 'aceptada', 'rechazada'].forEach(e => {
        const cantidad = estado.solicitudes.filter(s => s.estado === e).length;
        document.getElementById('cont' + e[0].toUpperCase() + e.slice(1)).textContent = cantidad;
    });
    document.getElementById('contTodas').textContent = estado.solicitudes.length;
    botonesFiltro.forEach(b => b.classList.toggle('activo', b.dataset.filtro === estado.filtro));
    // Solicitudes que se muestran según el filtro
    const visibles = estado.solicitudes.filter(s => estado.filtro === 'todas' || s.estado === estado.filtro);
    lista.innerHTML = '';
    visibles.forEach(solicitud => {
        const item = document.createElement('li');
        item.className = 'item';
        // Cabecera: nombre y etiqueta de estado
        item.innerHTML = '<div class="item-cabecera"><span class="item-nombre"></span><span></span></div><p class="item-detalle"></p>';
        item.querySelector('.item-nombre').textContent = solicitud.solicitante;
        const etiqueta = item.querySelector('.item-cabecera span:last-child');
        etiqueta.className = 'estado ' + solicitud.estado;
        etiqueta.textContent = solicitud.estado;
        item.querySelector('.item-detalle').textContent =
            `${solicitud.tipo}: ${solicitud.detalle}` + (solicitud.fecha ? ` (${solicitud.fecha})` : '');
        // Botones: pendientes se aceptan o rechazan; las demás se pueden deshacer
        const acciones = document.createElement('div');
        acciones.className = 'acciones';
        if (solicitud.estado === 'pendiente') {
            acciones.append(
                crearBoton('Aceptar', 'btn-aceptar', () => cambiarEstado(solicitud.id, 'aceptada')),
                crearBoton('Rechazar', 'btn-rechazar', () => cambiarEstado(solicitud.id, 'rechazada'))
            );
        } else {
            acciones.append(crearBoton('Deshacer', 'btn-neutro', () => cambiarEstado(solicitud.id, 'pendiente')));
        }
        acciones.append(crearBoton('Eliminar', 'btn-neutro', () => eliminarSolicitud(solicitud.id)));
        item.appendChild(acciones);
        lista.appendChild(item);
    });
    // Texto cuando no hay solicitudes en el filtro elegido
    textoVacio.hidden = visibles.length > 0;
    textoVacio.textContent = 'No hay solicitudes en esta vista.';
}
// ===== EVENTOS =====
formulario.addEventListener('submit', agregarSolicitud);
botonesFiltro.forEach(boton => boton.addEventListener('click', () => {
    estado.filtro = boton.dataset.filtro;
    guardarEstado();
    dibujarPantalla();
}));
// Guarda lo que se escribe en el formulario para no perderlo al refrescar
formulario.addEventListener('input', () => {
    estado.borrador = {
        solicitante: inputSolicitante.value, tipo: selectTipo.value, detalle: inputDetalle.value
    };
    guardarEstado();
});
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
inputSolicitante.value = estado.borrador.solicitante;  // recupera el borrador
selectTipo.value = estado.borrador.tipo;
inputDetalle.value = estado.borrador.detalle;
dibujarPantalla();                                      // dibuja las solicitudes guardadas