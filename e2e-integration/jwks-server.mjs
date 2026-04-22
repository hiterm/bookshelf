import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const jwks = fs.readFileSync(path.join(dir, 'test_jwks.json'), 'utf-8');

const port = process.env.JWKS_SERVER_PORT ?? 9999;
http.createServer((req, res) => {
  if (req.url === '/.well-known/jwks.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(jwks);
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(port, () => console.log(`JWKS server listening on :${port}`));
