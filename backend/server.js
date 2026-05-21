// server.js is the ENTRY POINT of our backend
// This is the first file that runs when we start the server

const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Create the express app
// 'app' is our server object — everything is attached to it
const app = express()

// ─── MIDDLEWARE ───────────────────────────────────────────────
// Middleware = code that runs on EVERY request before hitting routes
// Think of it like a security check at an airport — every passenger goes through it

app.use(cors())           // allow frontend (different port) to talk to backend
app.use(express.json())   // automatically parse incoming JSON data

// ─── ROUTES ───────────────────────────────────────────────────
// Each line connects a URL path to a route file
// e.g. any request to /api/departments goes to routes/departments.js

app.use('/api/auth',        require('./routes/auth'))
app.use('/api/departments', require('./routes/departments'))
app.use('/api/subjects',    require('./routes/subjects'))
app.use('/api/materials',   require('./routes/materials'))

// ─── HEALTH CHECK ─────────────────────────────────────────────
// Visit http://localhost:5000 to confirm server is running fine
app.get('/', (req, res) => {
  res.json({
    message: '🎓 StudyVault API is running!',
    version: '1.0.0',
    status: 'healthy'
  })
})

// ─── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})