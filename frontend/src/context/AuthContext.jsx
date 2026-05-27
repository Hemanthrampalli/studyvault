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

import { createContext, useCallback, useContext, useState, useEffect } from 'react'
import { getProfile } from '../api'

// Step 1: Create the context object
const AuthContext = createContext()
const SESSION_TOKEN_KEY = 'token'
const LAST_ACTIVITY_KEY = 'studyvault_last_activity'
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000
const ACTIVITY_EVENTS = ['click', 'keydown', 'mousedown', 'mousemove', 'scroll', 'touchstart', 'visibilitychange']

function getLastActivity() {
  const timestamp = Number(localStorage.getItem(LAST_ACTIVITY_KEY))
  return Number.isFinite(timestamp) ? timestamp : 0
}

function markActivity(timestamp = Date.now()) {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(timestamp))
}

function hasTimedOut() {
  const lastActivity = getLastActivity()
  return Boolean(lastActivity && Date.now() - lastActivity >= INACTIVITY_TIMEOUT_MS)
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY)
  localStorage.removeItem(LAST_ACTIVITY_KEY)
}

// Step 2: Create the Provider component
// Wrap the whole app with this so every component can access it
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)      // logged in user object
  const [loading, setLoading] = useState(true) // true while checking login status

  // Called after successful login
  const login = useCallback((token, userData) => {
    localStorage.setItem(SESSION_TOKEN_KEY, token)  // save token for future requests
    markActivity()
    setUser(userData)
  }, [])

  // Called on logout
  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
  }, [])

  // On app load, check if user is already logged in
  // (they might have refreshed the page)
  useEffect(() => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY)

    if (token) {
      if (hasTimedOut()) {
        clearStoredSession()
        setLoading(false)
        return
      }

      if (!getLastActivity()) {
        markActivity()
      }

      // Token exists — fetch their profile to restore session
      getProfile()
        .then(res => setUser(res.data))
        .catch(() => {
          // Token expired or invalid — clear it
          clearStoredSession()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)  // no token — not logged in
    }
  }, [])

  useEffect(() => {
    if (!user) return undefined

    let timeoutId
    let lastActivityWrite = 0

    function scheduleLogoutCheck(delay = INACTIVITY_TIMEOUT_MS) {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(checkForInactivity, Math.max(0, delay))
    }

    function checkForInactivity() {
      const lastActivity = getLastActivity()

      if (!lastActivity) {
        markActivity()
        scheduleLogoutCheck()
        return
      }

      const timeUntilLogout = INACTIVITY_TIMEOUT_MS - (Date.now() - lastActivity)
      if (timeUntilLogout <= 0) {
        logout()
        return
      }

      scheduleLogoutCheck(timeUntilLogout)
    }

    function handleActivity(event) {
      if (event.type === 'visibilitychange' && document.visibilityState !== 'visible') return

      const now = Date.now()
      if (now - lastActivityWrite > 30000) {
        markActivity(now)
        lastActivityWrite = now
      }

      scheduleLogoutCheck()
    }

    function handleStorage(event) {
      if (event.key === SESSION_TOKEN_KEY && !event.newValue) {
        setUser(null)
        return
      }

      if (event.key === LAST_ACTIVITY_KEY) {
        checkForInactivity()
      }
    }

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true })
    })
    window.addEventListener('storage', handleStorage)
    checkForInactivity()

    return () => {
      window.clearTimeout(timeoutId)
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity)
      })
      window.removeEventListener('storage', handleStorage)
    }
  }, [logout, user])

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
