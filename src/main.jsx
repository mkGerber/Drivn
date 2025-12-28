import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { ThemeContextProvider } from './context/ThemeContext.jsx'

// Load theme early to prevent flash
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeContextProvider>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </ThemeContextProvider>
  </StrictMode>,
)
