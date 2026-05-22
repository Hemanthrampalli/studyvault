const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// ─── REGISTER ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  console.log('Register attempt:', req.body)

  const { name, email, password, department_id, year, roll_number } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' })
  }

  try {
    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (authError) {
      console.log('Auth error:', authError)
      return res.status(400).json({ error: authError.message })
    }

    console.log('User created:', authData.user.id)

    // Step 2: Wait for trigger to create profile row
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Step 3: Update profile with extra details
    const profileUpdate = { name }

    if (department_id && department_id !== '') {
      profileUpdate.department_id = department_id
    }
    if (year && year !== '') {
      profileUpdate.year = parseInt(year)
    }
    if (roll_number && roll_number !== '') {
      profileUpdate.roll_number = roll_number
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', authData.user.id)

    if (profileError) {
      console.log('Profile update error:', profileError)
    }

    res.json({
      message: 'Account created successfully!',
      user: authData.user
    })

  } catch (err) {
    console.log('Register catch error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ─── LOGIN ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    // Fetch full profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, departments(name, code)')
      .eq('id', data.user.id)
      .single()

    res.json({
      token: data.session.access_token,
      user: {
        id:      data.user.id,
        email:   data.user.email,
        profile
      }
    })

  } catch (err) {
    console.log('Login error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ─── GET PROFILE ──────────────────────────────────────────────
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