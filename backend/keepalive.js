const https = require('https')
const BACKEND_URL = process.env.RENDER_URL || ''
if (BACKEND_URL) {
  setInterval(() => {
    https.get(BACKEND_URL, (res) => {
      console.log(`Keep-alive ping: ${res.statusCode}`)
    }).on('error', (err) => {
      console.log('Keep-alive error:', err.message)
    })
  }, 14 * 60 * 1000)
}
require('./keepalive')