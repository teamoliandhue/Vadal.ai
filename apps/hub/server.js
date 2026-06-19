/* Vadal.ai — project dashboard. Zero-dependency static server.
   Serves files in this dir (index.html, design-system.html, ds-tokens.css …); re-reads on
   each hit so edits show up on refresh. Clean URLs: /design-system → design-system.html.
   Unknown paths fall back to index.html. (On Vercel the dir is served statically + vercel.json.) */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3002;
const DIR = __dirname;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };

http
  .createServer((req, res) => {
    let p = decodeURIComponent((req.url || "/").split("?")[0]);
    if (p === "/") p = "/index.html";
    let file = path.join(DIR, p);
    // clean URL: /design-system → design-system.html
    if (!path.extname(file) && fs.existsSync(file + ".html")) file += ".html";
    // stay inside DIR; fall back to index.html if missing
    if (!file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIR, "index.html");
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(500); res.end("hub: could not read file"); return; }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`Vadal hub → http://localhost:${PORT}`));
