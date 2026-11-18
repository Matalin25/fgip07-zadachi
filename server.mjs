import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const routes = new Map([['/', './index.html']]);

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const url = new URL(request.url, 'http://localhost');
  const route = url.pathname.replace(/\/$/, '') || '/';
  if (route === '/health') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      .end(request.method === 'HEAD' ? undefined : 'ok');
    return;
  }
  const target = routes.get(route);
  if (!target) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      .end(request.method === 'HEAD' ? undefined : 'Страница не найдена');
    return;
  }
  try {
    const body = await readFile(new URL(target, import.meta.url));
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': body.length,
      'X-Content-Type-Options': 'nosniff'
    }).end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      .end(request.method === 'HEAD' ? undefined : 'Не удалось открыть сборку');
  }
}).listen(Number(process.env.PORT || 8080), '0.0.0.0');
