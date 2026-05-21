// App.jsx
// Defines all the pages/routes of our app
// React Router reads the URL and shows the matching page

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Import all pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Browse from './pages/Browse'
import Subject from './pages/Subject'
import Profile from './pages/Profile'

export default function App() {
  return (
    // AuthProvider wraps everything so all pages can access user state
    <AuthProvider>
      <BrowserRouter>
        {/* Navbar shows on every page */}
        <Navbar />

        <Routes>
          {/* Public routes — anyone can visit */}
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse"   element={<Browse />} />

          {/* subject_id comes from URL e.g. /subject/abc-123 */}
          <Route path="/subject/:subject_id" element={<Subject />} />

          {/* Protected route — must be logged in */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}