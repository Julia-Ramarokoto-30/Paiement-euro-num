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
let confirmation = null;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
function cacheHeaders(file) {
  const ext = path.extname(file);
  if (['.png', '.jpg', '.jpeg'].includes(ext)) return { 'Cache-Control': 'public, max-age=31536000, immutable' };
  if (ext === '.html') return { 'Cache-Control': 'no-cache' };
  return {};
}
function send(res, status, body, type = 'application/json; charset=utf-8', headers = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', ...headers });
  res.end(body);
}
http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/confirm' && req.method === 'POST') {
    const amount = Number(url.searchParams.get('amount'));
    const balance = Number(url.searchParams.get('balance'));
    const accepted = Number.isFinite(amount) && Number.isFinite(balance) && balance >= amount;
    confirmation = { confirmed: true, accepted };
    return send(res, 200, JSON.stringify(confirmation));
  }
  if (url.pathname === '/reset' && req.method === 'POST') { confirmation = null; return send(res, 200, JSON.stringify({ confirmed: false })); }
  if (url.pathname === '/status') return send(res, 200, JSON.stringify(confirmation || { confirmed: false }));
  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = path.normalize(path.join(root, requested));
  if (!file.startsWith(root)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    send(res, 200, data, types[path.extname(file)] || 'application/octet-stream', cacheHeaders(file));
  });
}).listen(port, '0.0.0.0', () => {
  console.log(`Mockup paiement e-EUR disponible sur http://localhost:${port}/index.html`);
  networkHosts().forEach(host => console.log(`Depuis un autre appareil du meme Wi-Fi : http://${host}:${port}/index.html`));
  console.log('En ligne, utilisez l\'URL publique fournie par votre hebergeur.');
});
