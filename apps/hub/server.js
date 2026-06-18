/* Vadal.ai — project dashboard. Zero-dependency static server.
   Serves index.html for every request; re-reads on each hit so edits
   show up on refresh without a restart. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3002;
const FILE = path.join(__dirname, "index.html");

http
  .createServer((req, res) => {
    fs.readFile(FILE, (err, html) => {
      if (err) {
        res.writeHead(500);
        res.end("hub: could not read index.html");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    });
  })
  .listen(PORT, () => {
    console.log(`Vadal hub → http://localhost:${PORT}`);
  });
