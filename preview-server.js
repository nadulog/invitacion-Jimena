const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const root = __dirname;
const port = 5327;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".mp3": "audio/mpeg" };
http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = path.resolve(root, (pathname.endsWith("/") ? pathname + "index.html" : pathname).replace(/^\/+/, ""));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end("Not found");
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
}).listen(port, "0.0.0.0", () => {
  for (const nets of Object.values(os.networkInterfaces())) for (const n of nets) if (n.family === "IPv4" && !n.internal) console.log(`http://${n.address}:${port}`);
});
