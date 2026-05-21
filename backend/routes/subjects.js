// routes/subjects.js
// GET /api/subjects?department_id=xxx&year=1&semester=2

const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// Public route — no login needed to browse subjects
router.get('/', async (req, res) => {

  // Read filters from URL query parameters
  const { department_id, year, semester } = req.query

  // department_id is required — can't fetch subjects without knowing which department
  if (!department_id) {
    return res.status(400).json({ error: 'department_id is required' })
  }

  let query = supabase
    .from('subjects')
    .select(`
      *,
      departments ( name, code )
    `)
    .eq('department_id', department_id)

  // Add optional filters
  if (year)     query = query.eq('year', parseInt(year))
  if (semester) query = query.eq('semester', parseInt(semester))

  const { data, error } = await query.order('name')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

module.exports = router