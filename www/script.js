/* Implementación de las funciones por el lado del servidor */

let tasks = [];

console.log("hellooooo")

async function add(task) {
  try {
    const response = await fetch('/tasks/add', { // Update the URL to include the port number
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    });
    const newTask = await response.json();
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
  }
}

async function remove(task) {
  try {
    const response = await fetch(`http://localhost:80/${task.id}`, { // Update the URL to include the port number
      method: 'POST'
    });
    if (response.ok) {
      console.log('Task removed successfully');
    } else {
      console.error('Error removing task:', response.status);
    }
  } catch (error) {
    console.error('Error removing task:', error);
  }
}

async function toggleDone(task) {
  try {
    const response = await fetch(`http://localhost:80/${task.id}`, { // Update the URL to include the port number
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ done: !task.done })
    });
    if (response.ok) {
      console.log('Task status updated successfully');
    } else {
      console.error('Error updating task status:', response.status);
    }
  } catch (error) {
    console.error('Error updating task status:', error);
  }
}
