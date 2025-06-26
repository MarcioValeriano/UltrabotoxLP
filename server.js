const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 5000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon'
};

const memoryCache = {};
const preloadFiles = ['./index.html'];
preloadFiles.forEach(file => {
  fs.readFile(file, (err, data) => {
    if (!err) memoryCache[file] = data;
  });
});

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';

  const extname = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  if (['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.mp4', '.webm'].includes(extname)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
  } else if (extname === '.html') {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora
  }

  // Função para determinar compressão com streams
  const streamWithCompression = (stream) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    res.setHeader('Content-Type', mimeType);

    if (acceptEncoding.includes('br')) {
      res.setHeader('Content-Encoding', 'br');
      const brotli = zlib.createBrotliCompress();
      stream.pipe(brotli).pipe(res);
    } else if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
      const gzip = zlib.createGzip();
      stream.pipe(gzip).pipe(res);
    } else {
      stream.pipe(res);
    }
  };

  // Tamanho do arquivo para decidir usar stream + compressão
  const useStream = ['.mp4', '.webm', '.png', '.jpg', '.jpeg', '.webp'].includes(extname);

  // Se arquivo está no cache em memória e não é stream, serve com compressão buffer
  if (!useStream && memoryCache[filePath]) {
    const buffer = memoryCache[filePath];
    const acceptEncoding = req.headers['accept-encoding'] || '';
    res.setHeader('Content-Type', mimeType);

    if (acceptEncoding.includes('br')) {
      res.setHeader('Content-Encoding', 'br');
      zlib.brotliCompress(buffer, (err, result) => {
        if (err) return res.end(buffer);
        res.end(result);
      });
    } else if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
      zlib.gzip(buffer, (err, result) => {
        if (err) return res.end(buffer);
        res.end(result);
      });
    } else {
      res.end(buffer);
    }
    return;
  }

  // Arquivos grandes: stream + compressão
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('404 - Arquivo não encontrado');
    }

    if (useStream) {
      res.writeHead(200);
      const fileStream = fs.createReadStream(filePath);
      streamWithCompression(fileStream);
    } else {
      // Arquivos pequenos, lê do disco e serve comprimido e cacheia
      fs.readFile(filePath, (error, content) => {
        if (error) {
          res.writeHead(500);
          return res.end('Erro interno do servidor: ' + error.code);
        }
        memoryCache[filePath] = content;
        const acceptEncoding = req.headers['accept-encoding'] || '';
        res.setHeader('Content-Type', mimeType);

        if (acceptEncoding.includes('br')) {
          res.setHeader('Content-Encoding', 'br');
          zlib.brotliCompress(content, (err, result) => {
            if (err) return res.end(content);
            res.end(result);
          });
        } else if (acceptEncoding.includes('gzip')) {
          res.setHeader('Content-Encoding', 'gzip');
          zlib.gzip(content, (err, result) => {
            if (err) return res.end(content);
            res.end(result);
          });
        } else {
          res.end(content);
        }
      });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`✅ Streaming com compressão Brotli e gzip ativados!`);
});
