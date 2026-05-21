// AuthContext.jsx
// This is GLOBAL STATE for authentication
//
// Problem without context:
// If Login page sets the user, Browse page doesn't know about it
// We'd have to pass user info through every component as props — messy!
//
// Solution with context:
// Any component in the app can read/update the logged-in user
// without passing props through every level

import { createContext, useContext, useState, useEffect } from 'react'
import { getProfile } from '../api'

// Step 1: Create the context object
const AuthContext = createContext()

// Step 2: Create the Provider component
// Wrap the whole app with this so every component can access it
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)      // logged in user object
  const [loading, setLoading] = useState(true) // true while checking login status

  // On app load, check if user is already logged in
  // (they might have refreshed the page)
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      // Token exists — fetch their profile to restore session
      getProfile()
        .then(res => setUser(res.data))
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)  // no token — not logged in
    }
  }, [])

  // Called after successful login
  const login = (token, userData) => {
    localStorage.setItem('token', token)  // save token for future requests
    setUser(userData)
  }

  // Called on logout
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    // Step 3: Provide the values to all children
    // Any component can now call useAuth() to get these values
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Step 4: Custom hook for easy access
// Instead of importing useContext + AuthContext everywhere
// just call useAuth()
export function useAuth() {
  return useContext(AuthContext)
}