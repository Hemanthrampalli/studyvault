const http = require('http')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'dist')
const port = Number(process.env.PORT || 5173)
const host = process.env.HOST || '127.0.0.1'

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent(req.url.split('?')[0])
  let filePath = path.join(root, requestPath === '/' ? 'index.html' : requestPath)

  if (!filePath.startsWith(root)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(root, 'index.html')
  }

  res.writeHead(200, {
    'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
  })
  fs.createReadStream(filePath).pipe(res)
})

server.listen(port, host, () => {
  console.log(`StudyVault preview running at http://${host}:${port}`)
})
