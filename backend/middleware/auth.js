// This middleware runs BEFORE protected routes
// It checks if the user is logged in by verifying their token
// 
// How tokens work:
// 1. User logs in → server gives them a token (long random string)
// 2. User sends this token with every future request
// 3. This middleware checks if the token is valid
// 4. If valid → allow request to continue
// 5. If invalid → block request with 401 error

const supabase = require('../supabase')

const requireAuth = async (req, res, next) => {

  // Token comes in request headers like this:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5c...
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not logged in. Please login first.' })
  }

  // Remove "Bearer " prefix to get just the token
  const token = authHeader.split(' ')[1]

  // Ask Supabase to verify this token
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Session expired. Please login again.' })
  }

  // Attach user info to request
  // Now any route using this middleware can access req.user
  req.user = user

  next() // everything ok — move to the actual route
}

module.exports = requireAuth