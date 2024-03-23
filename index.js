const http = require('http');
const fs = require('fs');

const PORT = 3000;

const serveStaticFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function (err, data) {
      if (err) reject(err);
      resolve(data);
    });
  });
}

const writeStaticFile = async (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(err);
      resolve("File correctly saved");
    })
  })
}

const sendResponse = (response, content, contentType) => {
  response.writeHead(200, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*"
  });
  response.end(content);
}

const handleRequest = async (request, response) => {
  const url = request.url;
  if (request.method === "OPTIONS") {
    response.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    response.end();
    return;
  }

  if (request.method === "GET") {
    let content;
    let contentType;
    switch (url) {
      case "/":
      case "/index.html":
        content = await serveStaticFile("www/index.html");
        contentType = "text/html";
        break;
      case "/script.js":
        content = await serveStaticFile("www/script.js");
        contentType = "text/javascript";
        break;
      case "/style.css":
        content = await serveStaticFile("www/style.css");
        contentType = "text/css";
        break;
      case "/tasks/get":
        content = await serveStaticFile("tasks.json");
        contentType = "application/json";
        break;
      default:
        content = url + "Ruta no v&aacutelida\r\n";
        contentType = "text/html";
    }
    sendResponse(response, content, contentType);

  } else if (request.method === "POST" && request.url === "/taskslist/update") {
    let data = "";
    let messageResponse;
    request.on("data", chunk => {
      data += chunk;
    });

    request.on("end", async () => {
      try {
        content = await writeStaticFile("tasks.json", data);
        sendResponse(response, content, "text/plain");
      } catch (error) {
        console.error("Error al actualizar tasks.json:", error);
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.end("Error al actualizar tasks.json");
      }
    });

  } else {
    response.writeHead(405, { "Content-Type": "text/html" });
    response.write(`Método ${request.method} no permitido!\r\n`);
  }
}


const server = http.createServer(handleRequest);
server.listen(PORT);