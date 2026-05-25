const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

router.get('/', async (req, res) => {
  const { department_id, year, semester } = req.query

  // department_id is now optional — search uses it without year/sem
  let query = supabase
    .from('subjects')
    .select(`
      *,
      departments ( name, code )
    `)

  if (department_id) query = query.eq('department_id', department_id)
  if (year)          query = query.eq('year', parseInt(year))
  if (semester)      query = query.eq('semester', parseInt(semester))

  const { data, error } = await query.order('name')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router