// incidencias.js

document.addEventListener('DOMContentLoaded', () => {
    // Recupera las incidencias almacenadas en localStorage
    const storedIncidencias = localStorage.getItem('incidencias');
    const incidencias = storedIncidencias ? JSON.parse(storedIncidencias) : [];
    console.log(incidencias)
  
    // Muestra las incidencias en el HTML
    const incidenciasContainer = document.getElementById('incidenciasContainer');
  
    if (incidencias.length > 0) {
      incidencias.forEach(incidencia => {
        const incidenciaElement = document.createElement('div');
        incidenciaElement.className = 'incidencia';
        incidenciaElement.innerHTML = `
          <h3>${incidencia.incidente_nombre}</h3>
          <p>${incidencia.incidente_descrip}</p>
          <p>Fecha: ${incidencia.fecha_incidente}</p>
          <p>Colaborador: ${incidencia.nombre_colaborador} ${incidencia.apellido_colaborador}</p>
          <p>Estado: ${incidencia.id_estado === 2 ? 'Pendiente' : 'Cerrado'}</p>
        `;
        incidenciasContainer.appendChild(incidenciaElement);
      });
    } else {
      const mensajeElement = document.createElement('p');
      mensajeElement.textContent = 'No hay incidencias para mostrar';
      incidenciasContainer.appendChild(mensajeElement);
    }
  });
  