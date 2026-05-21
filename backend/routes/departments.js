
// routes/departments.js
// GET /api/departments → returns all departments

const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// Public route — no login needed to see departments
router.get('/', async (req, res) => {

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

module.exports = router