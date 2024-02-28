// Simulación de datos (puedes reemplazar esto con datos reales de tu servidor o base de datos)
var incidentes = [];

// Función para obtener datos desde la ruta /conocimiento_incidentes
async function obtenerIncidentesDesdeServidor() {
  try {
      const response = await fetch('/conocimiento_incidentes');

      if (!response.ok) {
          throw new Error(`Error al obtener datos desde el servidor. Código de estado: ${response.status}`);
      }

      const data = await response.json();
      incidentes = data;
      mostrarIncidentes();
  } catch (error) {
      console.error('Error al obtener datos desde el servidor:', error.message);
  }
}
// Función para mostrar los incidentes en tarjetas
function mostrarIncidentes(incidentesToShow) {
    var incidentListDiv = document.getElementById("incidentList");

    // Limpiar la lista antes de mostrar los nuevos incidentes
    incidentListDiv.innerHTML = "";

    var incidentsToDisplay = incidentesToShow || incidentes;

    // Recorrer la lista de incidentes y crear tarjetas para cada uno
    incidentsToDisplay.forEach(function(incidente) {
        var cardDiv = document.createElement("div");
        cardDiv.className = "card";

        var cardContent = "<strong>ID:</strong> " + incidente.id_conocimiento_incidente + "<br>" +
                          "<strong>Título:</strong> " + incidente.titulo_conocimiento_incidente + "<br>" +
                          "<strong>Contenido:</strong> " + incidente.contenido_conocimiento_incidente;

        cardDiv.innerHTML = cardContent;
        incidentListDiv.appendChild(cardDiv);
    });
}

// Llamar a la función para obtener incidentes al cargar la página
obtenerIncidentesDesdeServidor();
