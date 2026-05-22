const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// GET /api/departments
// async keyword is required because we use await inside
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)

  } catch (err) {
    console.log('Departments error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router