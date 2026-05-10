const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const root = __dirname;
const port = process.env.PORT || 8765;

function networkHosts() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(address => address && address.family === 'IPv4' && !address.internal)
    .map(address => address.address);
}
let confirmed = false;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png' };
function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
  res.end(body);
}
http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/confirm' && req.method === 'POST') { confirmed = true; return send(res, 200, JSON.stringify({ confirmed })); }
  if (url.pathname === '/reset' && req.method === 'POST') { confirmed = false; return send(res, 200, JSON.stringify({ confirmed })); }
  if (url.pathname === '/status') return send(res, 200, JSON.stringify({ confirmed }));
  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = path.normalize(path.join(root, requested));
  if (!file.startsWith(root)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    send(res, 200, data, types[path.extname(file)] || 'application/octet-stream');
  });
}).listen(port, '0.0.0.0', () => {
  console.log(`Mockup paiement e-EUR disponible sur http://localhost:${port}/index.html`);
  networkHosts().forEach(host => console.log(`Depuis un autre appareil du meme Wi-Fi : http://${host}:${port}/index.html`));
  console.log('En ligne, utilisez l\'URL publique fournie par votre hebergeur.');
});
