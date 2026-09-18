import http from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'v2', 'backend', 'Code.gs');
const code = readFileSync(filePath, 'utf8');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (req.url === '/code') {
    res.writeHead(200);
    res.end(code);
    console.log('✅ Đã gửi code sang Browser Subagent thành công!');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8765, '127.0.0.1', () => {
  console.log('🚀 Code Server đang chạy tại http://127.0.0.1:8765/code');
});
