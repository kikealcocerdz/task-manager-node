
// Obtener referencia al botón de añadir y al campo de entrada de la tarea
const addButton = document.getElementById('fab-add');
const taskInput = document.getElementById('task-name');

// Agregar un evento de clic al botón de añadir
addButton.addEventListener('click', async () => {
  // Obtener el valor del campo de entrada de la tarea
  const taskName = taskInput.value.trim();

  // Verificar si el campo de entrada no está vacío
  if (taskName) {
    // Crear un objeto de tarea con el nombre de la tarea
    const task = { title: taskName };

    try {
      // Agregar la tarea utilizando la función add(task)
      await add(task);
      // Limpiar el campo de entrada después de agregar la tarea
      taskInput.value = '';
    } catch (error) {
      console.error('Error al agregar la tarea:', error);
    }
  } else {
    console.error('Por favor, ingresa un nombre de tarea válido.');
  }
});

async function add(task) {
  try {
    // Obtener el JSON actualizado de /tasks/get
    const response = await fetch('http://localhost:3000/tasks/get');
    if (!response.ok) {
      throw new Error('Error al obtener el JSON de tareas');
    }
    const currentTasks = await response.json();

    // Obtener el último ID usado en la lista de tareas
    const lastTask = currentTasks.tasks[currentTasks.tasks.length - 1];
    const lastTaskId = lastTask ? lastTask.id : 0;

    // Asignar el nuevo ID a la tarea
    task.id = lastTaskId + 1;

    // Agregar la nueva tarea al JSON actualizado
    task.completed = false; // Set the completed property to false
    currentTasks.tasks.push(task);

    // Enviar el JSON actualizado al servidor
    const updateResponse = await fetch('http://localhost:3000/taskslist/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(currentTasks)
    });

    if (updateResponse.ok) {
      console.log('Tarea agregada correctamente');
      updateTaskList(); // Actualizar la lista de tareas después de agregar la nueva tarea
    } else {
      console.error('Error al agregar la tarea:', updateResponse.statusText);
    }
  } catch (error) {
    console.error('Error al agregar la tarea:', error);
  }
}

async function remove(taskId) {
  try {
    const response = await fetch('http://localhost:3000/tasks/get');
    if (!response.ok) {
      throw new Error('Error al obtener el JSON de tareas');
    }
    const currentTasks = await response.json();

    // Encontrar la tarea con el ID especificado y eliminarla
    const indexToRemove = currentTasks.tasks.findIndex(task => task.id.toString() === taskId);
    if (indexToRemove !== -1) {
      console.log('Tarea encontrada en el índice:', indexToRemove);
      currentTasks.tasks.splice(indexToRemove, 1);

      // Enviar el JSON actualizado al servidor
      const updateResponse = await fetch('http://localhost:3000/taskslist/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentTasks)
      });

      if (updateResponse.ok) {
        console.log('Tarea eliminada correctamente');
        updateTaskList(); // Actualizar la lista de tareas después de eliminar la tarea
      } else {
        console.error('Error al eliminar la tarea:', updateResponse.statusText);
      }
    } else {
      console.error('No se encontró ninguna tarea con el ID especificado:', taskId);
    }
  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
  }
}


async function toggleDone(taskId) {
  try {
    // Obtener el JSON actualizado de /tasks/get
    const response = await fetch('http://localhost:3000/tasks/get');
    if (!response.ok) {
      throw new Error('Error al obtener el JSON de tareas');
    }
    const currentTasks = await response.json();

    // Encontrar la tarea con el ID especificado y actualizar su estado a completado
    const taskToUpdate = currentTasks.tasks.find(task => task.id.toString() === taskId);
    if (taskToUpdate) {
      taskToUpdate.completed = true;

      // Enviar el JSON actualizado al servidor
      const updateResponse = await fetch('http://localhost:3000/taskslist/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentTasks)
      });

      if (updateResponse.ok) {
        console.log('Estado de la tarea actualizado correctamente');
        updateTaskList(); // Actualizar la lista de tareas después de actualizar la tarea
      } else {
        console.error('Error al actualizar estado de la tarea:', updateResponse.statusText);
      }
    } else {
    }
  } catch (error) {
    console.error('Error al actualizar estado de la tarea:', error);
  }
}


async function update() {
  try {
    const response = await fetch('http://localhost:3000/tasks/get');
    console.log(response);
    if (response.ok) {
      const data = await response.json();
      const tasks = data.tasks; // Acceder al array de tareas dentro del objeto JSON
      displayTasks(tasks);
    } else {
      console.error('Error al obtener las tareas respuesta ok:', response.statusText);
    }
  } catch (error) {
    console.error('Error al obtener las tareas no encontradas:', error);
  }
}
let taskSelected = null;
let startX = 0;
let touchStartX = 0;
let selectedTask = null;
const removeThreshold = 150; // Umbral de movimiento para eliminar el div

let touchTimer;
let taskSelectedId;

function dragStart(event, taskItem) {
  // Almacenar el ID de la tarea seleccionada
  taskSelectedId = taskItem.id;
  event.preventDefault();
  taskSelected = event.currentTarget;
  startX = 0;
  touchStartX = event.touches[0].clientX;
  taskSelected.style.opacity = '0.5';

  // Iniciar el temporizador al tocar la tarea
  touchTimer = setTimeout(() => {
    // Llamar a toggleDone solo si el temporizador ha transcurrido más de 2 segundos
    toggleDone(taskSelectedId);
  }, 2000); // 2000 milisegundos = 2 segundos

  taskSelected.addEventListener('touchmove', dragMove);
  taskSelected.addEventListener('touchend', dragEnd);
}

function dragMove(event) {
  event.preventDefault();
  console.log(taskSelected.id)
  const touchX = event.touches[0].clientX;
  const offsetX = touchX - touchStartX;
  if (offsetX > 0) { // Solo permitir movimiento hacia la derecha
    if (Math.abs(offsetX) > removeThreshold) { // Verificar si se supera el umbral para eliminar el div
      // Llamar a la función para eliminar el div
      remove(taskSelected.id);
    }
    else {
      taskSelected.style.left = (startX + offsetX) + 'px'; // Restablecer la posición en relación con el desplazamiento
    }
  }
}

function dragEnd(event) {
  event.preventDefault();
  taskSelected.style.opacity = '1';
  taskSelected.removeEventListener('touchmove', dragMove);
  taskSelected.removeEventListener('touchend', dragEnd);

  // Detener el temporizador al levantar el dedo
  clearTimeout(touchTimer);

  // Calcular la cantidad de desplazamiento final
  const offsetX = taskSelected.offsetLeft - startX;

  // Regresar a la posición original si no se ha superado el umbral de eliminación
  if (Math.abs(offsetX) <= removeThreshold) {
    console.log("No se ha movido lo suficiente para activar la función.");
    taskSelected.style.left = startX + 'px';
  }
}


function displayTasks(tasks) {
  const taskListContainer = document.getElementById('task-list');
  // Limpiar el contenedor de tareas antes de volver a mostrarlas
  taskListContainer.innerHTML = '';
  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.textContent = task.title;
    taskItem.id = task.id;

    // Verificar si la tarea está completada y aplicar el estilo correspondiente
    if (task.completed) {
      taskItem.classList.add('completed-task'); // Agregar una clase CSS para el estilo de tarea completada
    }

    taskListContainer.appendChild(taskItem);
    taskItem.addEventListener('touchstart', (event) => dragStart(event, taskItem));
  });
}





// Llamar a la función `update` al cargar la página para mostrar las tareas iniciales
document.addEventListener('DOMContentLoaded', () => {
  update();
});
