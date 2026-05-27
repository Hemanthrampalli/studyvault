const express = require('express')
const router = express.Router()
const supabase = require('../supabase')
const requireAuth = require('../middleware/auth')

function buildProfilePayload(body, user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: body.name,
  }

  if (body.department_id) payload.department_id = body.department_id
  if (body.year) payload.year = parseInt(body.year, 10)
  if (body.roll_number) payload.roll_number = body.roll_number

  return payload
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' })
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (authError) {
      return res.status(400).json({ error: authError.message })
    }

    const profilePayload = buildProfilePayload(req.body, authData.user)

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })

    if (profileError) {
      return res.status(500).json({ error: profileError.message })
    }

    res.json({
      message: 'Account created successfully',
      user: authData.user,
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, departments(name, code)')
      .eq('id', data.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      return res.status(500).json({ error: profileError.message })
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        profile: profile || {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email,
        },
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

router.get('/profile', requireAuth, async (req, res) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, departments(name, code)')
    .eq('id', req.user.id)
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(profile)
})

router.patch('/profile', requireAuth, async (req, res) => {
  const allowedFields = ['name', 'department_id', 'year', 'roll_number', 'settings']
  const payload = {}

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      payload[field] = field === 'year' && req.body[field] ? parseInt(req.body[field], 10) : req.body[field]
    }
  })

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', req.user.id)
    .select('*, departments(name, code)')
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})
 // PATCH /api/auth/profile — update logged in user's profile
router.patch('/profile', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Not logged in' })

  const token = authHeader.split(' ')[1]

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' })

  const { name, department_id, year, roll_number } = req.body

  const updates = {}
  if (name)          updates.name          = name
  if (department_id) updates.department_id = department_id
  if (year)          updates.year          = parseInt(year)
  if (roll_number)   updates.roll_number   = roll_number

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (updateError) {
    return res.status(500).json({ error: updateError.message })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, departments(name, code)')
    .eq('id', user.id)
    .single()

  res.json(profile)
  
})

module.exports = router

module.exports = router
