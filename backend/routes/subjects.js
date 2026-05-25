const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

router.get('/', async (req, res) => {
  const { department_id, year, semester } = req.query

  if (!department_id) {
    return res.status(400).json({ error: 'department_id is required' })
  }

  let query = supabase
    .from('subjects')
    .select('*, departments(name, code)')
    .eq('department_id', department_id)

  if (year) query = query.eq('year', parseInt(year, 10))
  if (semester) query = query.eq('semester', parseInt(semester, 10))

  const { data, error } = await query.order('name')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*, departments(name, code)')
    .eq('id', req.params.id)
    .single()

  if (error) {
    return res.status(404).json({ error: error.message })
  }

  res.json(data)
})

module.exports = router
