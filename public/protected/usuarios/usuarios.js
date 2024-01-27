let idEliminar;
let cedulaEliminar;

let cargoActual ;
let departamentoActual;
let contactarUsuario;
let idEditar;
let correoActualizar;
let telefonoActualizar;
document.addEventListener('DOMContentLoaded', async () => {
  const storedDashboardFecha = localStorage.getItem('dashboardFecha');
  const storedIdAsignacionUser = localStorage.getItem('idAsignacionUser');
  const storedAvatarUrl = localStorage.getItem('avatarUrl');
  const items = document.querySelectorAll("#IconosAside li");
  var iconoTercero = document.querySelector('#IconosAside li:nth-child(3)');
  iconoTercero.classList.add('seleccionado');
  cargarCargos()
  cargarDepartamentos()
  await getAndShowAdministradores(); // Llama a la función para obtener y mostrar administradores

  items.forEach((item) => {
    const tooltipText = item.querySelector("a").getAttribute("data-tooltip");
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerText = tooltipText;
    item.appendChild(tooltip);
  });

  const logoutButton = document.querySelector('.salir');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      const confirmLogout = confirm('¿Estás seguro de cerrar sesión?');
      if (confirmLogout) {
        localStorage.removeItem('nombreData');
        window.location.href = '../../index.html'; // Redirige y reemplaza la entrada en el historial
        window.history.replaceState(null, '', '../../index.html');
      }
    });
  } else {
    console.error('No se encontró el botón de cerrar sesión');
  }

  if (storedAvatarUrl) {
    // Obtener el elemento de la imagen por su ID
    const imagenColaboradorElement = document.getElementById('imagenColaborador');

    // Establecer la URL de la imagen como el src
    imagenColaboradorElement.src = storedAvatarUrl;
    imagenColaboradorElement.alt = 'Avatar';
  } else {
    console.error('No se encontró la imagen del avatar');
  }

  console.log(storedDashboardFecha);
  console.log(storedIdAsignacionUser);

  
});

async function getAdministradores() {
  try {
    const response = await fetch('/getAdministradores');

    if (!response.ok) {
      throw new Error(`Error al obtener información de administradores. Código de estado: ${response.status}`);
    }

    const administradores = await response.json();
    console.log('Respuesta de administradores:', administradores);

    return administradores;
  } catch (error) {
    console.error('Error al obtener información de administradores:', error);
    return [];
  }
}

async function getAndShowAdministradores() {
  try {
    const administradores = await getAdministradores();

    $('#tablaUsuarios').DataTable({
      "language": {
        "url": "//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      },
      destroy: true,
      data: administradores,
      columns: [
        { data: 'imagen_colaborador', title: 'Avatar', render: function(data) {
          return `<img src="${data}" class="avatar-img" alt="Avatar">`;
        }},
        { data: 'cedula', title: 'Cédula' },
        { data: 'nombre_colaborador', title: 'Nombre' },
        { data: 'apellido_colaborador', title: 'Apellido' },
        { data: 'correo_colaborador', title: 'Correo' },
        { data: 'telefono_colaborador', title: 'Id Telegram' },
        { data: 'nombre_departamento', title: 'Departamento' },
        { data: 'nombre_cargo', title: 'Cargo' },
        {
          title: 'Acciones',
          render: function(data, type, row) {
            return `
  <i class="material-icons btn-opciones" style="cursor: pointer;" onclick="mostrarOpciones('${row.id_colaborador}', '${row.cedula}', '${row.telefono_colaborador}')">more_vert</i>
`;

          },
        },
      ],
      pageLength: 6, // Mostrar solo 7 registros por página
      lengthMenu: [6], // Deshabilitar la opción de mostrar más registros
      // Puedes agregar otras opciones y configuraciones según tus necesidades
    });

  } catch (error) {
    console.error('Error al obtener y mostrar administradores:', error);
  }
}

function mostrarOpciones(idColaborador, cedula,telefonoEnviar) {
  cedulaEliminar=cedula
  // Actualizar el título del modal con la cédula
  document.getElementById('opcionesModalLabel').textContent = `Opciones para ${cedula}`;
  const modal = document.getElementById('modal');
  modal.style.display = 'block';

  // Almacenar el id_colaborador en la variable idEliminar
  idEliminar = idColaborador;
  contactarUsuario=telefonoEnviar;
  
  console.log("Id:", idEliminar)
  
}

function cerrarModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  document.getElementById('mensajeInput').value = '';

}

async function getAdministradoresPorUsuario(id_usuario) {

  console.log("Id recibida en getAdmin: ", id_usuario)
  try {
    const response = await fetch('/getAdministradoresPorUsuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_usuario }),
    });

    if (!response.ok) {
      throw new Error(`Error al obtener administradores. Código de estado: ${response.status}`);
    }

    const administradores = await response.json();
    const administrador = administradores.length > 0 ? administradores[0] : {};
    actualizarModalAdministrador(administrador)
    
  
    console.log('Administradores por usuario:', administradores);
  } catch (error) {
    console.error('Error al obtener administradores por usuario:', error);
  }
}
function actualizarModalAdministrador(administrador) {
  document.getElementById('cedula').value = administrador.cedula || '';
  document.getElementById('nombre_colaborador').value = administrador.nombre_colaborador || '';
  document.getElementById('apellido_colaborador').value = administrador.apellido_colaborador || '';
  document.getElementById('correo_colaborador').value = administrador.correo_colaborador || '';
  document.getElementById('telefono_colaborador').value = administrador.telefono_colaborador || '';

  const cargoSelect = document.getElementById('nombre_cargo');
  const cargoOption = Array.from(cargoSelect.options).find(option => option.text === administrador.nombre_cargo);
  if (cargoOption) {
    cargoOption.selected = true;
    cargoActual = cargoSelect.value;
    console.log('Id del cargo seleccionado:', cargoActual);
  }

  const departamentoSelect = document.getElementById('nombre_departamento');
  const departamentoOption = Array.from(departamentoSelect.options).find(option => option.text === administrador.nombre_departamento);

  if (!departamentoOption) {
    const similarDepartamentoOption = Array.from(departamentoSelect.options).find(option => option.text.includes(administrador.nombre_departamento));
    if (similarDepartamentoOption) {
      similarDepartamentoOption.selected = true;
      departamentoActual = similarDepartamentoOption.value;
      console.log('Id del departamento seleccionado:', departamentoActual);
    }
  } else {
    departamentoOption.selected = true;
    departamentoActual = departamentoOption.value;
  }

  // Agregar event listeners para los cambios en los elementos select
  cargoSelect.addEventListener('change', function () {
    cargoActual = cargoSelect.value;
    console.log('Cargo seleccionado ha cambiado:', cargoActual);
  });

  departamentoSelect.addEventListener('change', function () {
    departamentoActual = departamentoSelect.value;
    console.log('Departamento seleccionado ha cambiado:', departamentoActual);
  });

  // Agregar event listeners para los cambios en los otros campos
  document.getElementById('correo_colaborador').addEventListener('input', function () {
    correoActualizar = this.value;
    console.log('Correo ha cambiado:', correoActualizar);
  });

  document.getElementById('telefono_colaborador').addEventListener('input', function () {
    telefonoActualizar = this.value;
    console.log('Teléfono ha cambiado:', telefonoActualizar);
  });

  // Establecer valores iniciales
  idEditar = administrador.id_colaborador;
  correoActualizar = administrador.correo_colaborador;
  telefonoActualizar = administrador.telefono_colaborador;

  console.log("Id a editar: ", idEditar);
  console.log("Correo actualizar: ", correoActualizar);
  console.log("Teléfono: ", telefonoActualizar);
  console.log("Id dep: ", departamentoActual);
}

document.getElementById('btnGuardar').addEventListener('click', async function () {
  try {
  
    await actualizarColaborador(idEditar, correoActualizar, telefonoActualizar, departamentoActual);


    await actualizarCargoUsuario(idEditar, cargoActual);


    console.log('Ambas actualizaciones completadas con éxito');
    alert('Actualizaciones completadas con éxito');


  } catch (error) {
    console.error('Error al actualizar colaborador o cargo de usuario:', error);
    alert('Hubo un error al actualizar algun campo');
  }
});


async function eliminarUsuario(idUsuario) {
  console.log("Id a eliminar: ", idUsuario)
  try {
    const response = await fetch('/eliminarUsuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_usuario: idUsuario }),
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar usuario. Código de estado: ${response.status}`);
      
    }

    const result = await response.json();
    if (result.success) {
      console.log('Usuario eliminado exitosamente');
      alert(`Usuario eliminado con exito.`);
      await getAndShowAdministradores();
    } else {
      console.error('Error al eliminar usuario:', result.error);
      
      alert(`Hubo un error al eliminar al usuario`);
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
  }
}

function eliminar() {
  if (confirm(`¿Estás seguro de eliminar al usuario con CI: ${cedulaEliminar}?`)) {
    try {
      eliminarUsuario(idEliminar);
      
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      alert('Hubo un error al eliminar el usuario. Por favor, intenta nuevamente.');
    }
  }
}


function mostrarModalEditar(){
 
  const modal = document.getElementById('modalEditar');
  modal.style.display = 'block';

  getAdministradoresPorUsuario(idEliminar);


}


function cerrarModalEditar() {
  const modal = document.getElementById('modalEditar');
  modal.style.display = 'none';
    cerrarModal()

  document.getElementById('mensajeInput').value = '';

}


async function cargarCargos() {
  try {
    const response = await fetch('/getCargos');
    if (!response.ok) {
      throw new Error(`Error al obtener opciones de cargo. Código de estado: ${response.status}`);
    }

    const cargos = await response.json();
    const cargoSelect = document.getElementById('nombre_cargo');
    cargoSelect.innerHTML = ''; // Limpiar opciones actuales

    if (cargos.length > 0) {
      cargos.forEach(cargo => {
        const optionElement = document.createElement('option');
        optionElement.value = cargo.id_cargo;
        optionElement.text = cargo.nombre_cargo;
        cargoSelect.appendChild(optionElement);
      });
    }
  } catch (error) {
    console.error(`Error al cargar opciones de cargo: ${error}`);
  }
}

async function cargarDepartamentos() {
  try {
    const response = await fetch('/getDepartamentos');
    if (!response.ok) {
      throw new Error(`Error al obtener opciones de departamento. Código de estado: ${response.status}`);
    }

    const departamentos = await response.json();
    const departamentoSelect = document.getElementById('nombre_departamento');
    departamentoSelect.innerHTML = ''; // Limpiar opciones actuales

    if (departamentos.length > 0) {
      departamentos.forEach(departamento => {
        const optionElement = document.createElement('option');
        optionElement.value = departamento.id_departamento;
        optionElement.text = departamento.nombre_departamento;
        departamentoSelect.appendChild(optionElement);
      });
    }
  } catch (error) {
    console.error(`Error al cargar opciones de departamento: ${error}`);
  }
}


async function actualizarColaborador(idColaborador, nuevoCorreo, nuevoTelefono, nuevoDepartamento) {
  console.log("ID del colaborador a actualizar: ", idColaborador);
  console.log("Correo actualizar: ", nuevoCorreo);
  console.log("Telefono: ", nuevoTelefono);
  console.log("Id dep: ", nuevoDepartamento);

  try {
    const response = await fetch('/actualizarColaborador', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_colaborador: idColaborador,
        correo_colaborador: nuevoCorreo,
        telefono_colaborador: nuevoTelefono,
        id_departamento: nuevoDepartamento,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar colaborador. Código de estado: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      console.log('Colaborador actualizado exitosamente');
      alert(`Colaborador actualizado con éxito.`);
      // Recarga la página después de una actualización exitosa
      location.reload();
    } else {
      console.error('Error al actualizar colaborador:', result.error);
      alert(`Hubo un error al actualizar al colaborador`);
    }
  } catch (error) {
    console.error('Error al actualizar colaborador:', error);
  }
}

async function actualizarCargoUsuario(idUsuario, nuevoCargo) {
  console.log("ID del usuario a actualizar: ", idUsuario);
  console.log("Nuevo cargo: ", nuevoCargo);

  try {
    const response = await fetch('/actualizarCargoUsuario', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tu_nuevo_valor: nuevoCargo,
        tu_id_usuario: idUsuario,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar cargo de usuario. Código de estado: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      console.log('Cargo de usuario actualizado exitosamente');
      alert(`Cargo de usuario actualizado con éxito.`);
      // Puedes realizar acciones adicionales después de una actualización exitosa si es necesario
    } else {
      console.error('Error al actualizar cargo de usuario:', result.error);
      alert(`Hubo un error al actualizar el cargo de usuario`);
    }
  } catch (error) {
    console.error('Error al actualizar cargo de usuario:', error);
  }
}






async function enviarMensajeTelegram(telefonoColaborador, mensajeTelegram) {
  const url = `/enviarMensajeTelegram`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ telefono_colaborador: telefonoColaborador, mensajeTelegram: mensajeTelegram })
    });

    if (!response.ok) {
      throw new Error('Error en la solicitud');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

function mostrarModal() {
  console.log("Mostrando modal");
  const modal = document.getElementById('modalMensaje');
  modal.style.display = 'block';
}

function cerrarModalya() {
  const modal = document.getElementById('modalMensaje');
  modal.style.display = 'none';
  document.getElementById('mensajeInput').value = '';
  filaSeleccionada = null;
  cerrarModal()
}


function informarDesdeModal() {

  var mensajeInput = document.getElementById('mensajeInput').value;

  enviarMensajeTelegram(contactarUsuario,mensajeInput)
  
  cerrarModalya(); 

}


function habilitarBoton() {
  var mensajeInput = document.getElementById('mensajeInput');
  var buttonInformarModal = document.getElementById('buttonInformarModal');

  // Habilitar el botón si el área de texto tiene contenido, deshabilitarlo si está vacío
  buttonInformarModal.disabled = mensajeInput.value.trim() === '';
}

