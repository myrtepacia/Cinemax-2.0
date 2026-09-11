/*
 * node serve.js   ->   http://localhost:4000
 *
 * The camera on admin-scanner.html needs a "secure context", which means
 * https or localhost. Opening the file by double-clicking gives you a
 * file:// address, and the browser refuses the camera there. Run this and
 * open the localhost address instead.
 *
 * Every other page works fine opened directly; this is only for the scanner.
 * Uses nothing but Node's own modules, so there is no npm install.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4000;
const ROOT = __dirname;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".md": "text/plain; charset=utf-8"
};

http
  .createServer((request, response) => {
    let name = decodeURIComponent(request.url.split("?")[0]);

    if (name === "/") {
      name = "/index.html";
    }

    const file = path.join(ROOT, name);

    // Keep the server inside this folder whatever the address asks for.
    if (!file.startsWith(ROOT)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    fs.readFile(file, (error, body) => {
      if (error) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("Not found: " + name);
        return;
      }

      response.writeHead(200, {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream"
      });
      response.end(body);
    });
  })
  .listen(PORT, () => {
    console.log("Cinemax running at http://localhost:" + PORT);
    console.log("Scanner:  http://localhost:" + PORT + "/admin-scanner.html");
    console.log("Press Ctrl+C to stop.");
  });
