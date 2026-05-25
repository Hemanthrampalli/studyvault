const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/departments', require('./routes/departments'))
app.use('/api/subjects', require('./routes/subjects'))
app.use('/api/materials', require('./routes/materials'))

app.get('/', (req, res) => {
  res.json({
    message: 'StudyVault API is running',
    version: '1.0.0',
    status: 'healthy',
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
