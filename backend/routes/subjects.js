const express = require('express')
const router  = express.Router()
const supabase = require('../supabase')

// GET /api/subjects?department_id=&year=&semester=
router.get('/', async (req, res) => {
  const { department_id, year, semester } = req.query

  let query = supabase
    .from('subjects')
    .select('*, departments(name, code)')

  if (department_id) query = query.eq('department_id', department_id)
  if (year)          query = query.eq('year', parseInt(year))
  if (semester)      query = query.eq('semester', parseInt(semester))

  const { data, error } = await query.order('name')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/subjects/:id — get single subject by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*, departments(name, code)')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router