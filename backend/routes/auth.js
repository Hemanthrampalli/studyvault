// routes/auth.js
// Handles user registration and login

const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// ─── REGISTER ─────────────────────────────────────────────────
// POST /api/auth/register
// Creates a new user account
router.post('/register', async (req, res) => {

  // Destructure all fields from request body
  // req.body contains the JSON data sent from frontend
  const { name, email, password, department_id, year, roll_number } = req.body

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' })
  }

  // Step 1: Create user in Supabase Auth
  // Supabase handles password hashing — never store plain text passwords!
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }  // saved in auth metadata
    }
  })

  if (authError) {
    return res.status(400).json({ error: authError.message })
  }

  // Step 2: Update their profile with extra details
  // Remember our trigger auto-created a profile row when they signed up
  // We just need to fill in the extra details
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name,
      department_id,
      year: year ? parseInt(year) : null,
      roll_number
    })
    .eq('id', authData.user.id)

  if (profileError) {
    return res.status(400).json({ error: profileError.message })
  }

  res.json({
    message: 'Account created successfully!',
    user: authData.user
  })
})

// ─── LOGIN ────────────────────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  // Supabase verifies email + password
  // Returns a session with an access_token if correct
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return res.status(400).json({ error: 'Invalid email or password' })
  }

  // Fetch their full profile to send back to frontend
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, departments(name, code)')
    .eq('id', data.user.id)
    .single()  // returns one object instead of array

  res.json({
    token: data.session.access_token,  // frontend stores this
    user: {
      id: data.user.id,
      email: data.user.email,
      profile  // includes name, role, department, year etc.
    }
  })
})

// ─── GET PROFILE ──────────────────────────────────────────────
// GET /api/auth/profile
// Returns logged in user's profile
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Not logged in' })

  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error) return res.status(401).json({ error: 'Invalid session' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, departments(name, code)')
    .eq('id', user.id)
    .single()

  res.json(profile)
})

module.exports = router