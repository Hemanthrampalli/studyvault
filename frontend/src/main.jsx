// main.jsx
// The very first file React runs
// It mounts our App component into the HTML page

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // loads Tailwind styles
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)