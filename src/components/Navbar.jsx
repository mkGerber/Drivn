import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'

const Navbar = () => {
  const { session, signOut } = UserAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async (e) => {
    e.preventDefault()
    try {
      await signOut()
      setMenuOpen(false)
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <nav className="w-full text-white border-b border-b-gray-700 dark:border-b-gray-600 sticky top-0 z-50 bg-[#0a1120] dark:bg-gray-900">
      <div className="h-16 flex items-center justify-between px-6 max-w-7xl mx-auto">
        
        {/* Left: Logo */}
        <Link to="/" className="text-xl font-extrabold">
          BuildLog
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/garage" className="navigation-button">
            My Garage
          </Link>
          <Link to="/explore" className="navigation-button">
            Explore
          </Link>

          {session ? (
            <>
              <Link to="/profile" className="button2">
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="border px-4 py-1 rounded hover:bg-white hover:text-black dark:hover:bg-gray-700 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/signin" className="button2">
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a1120] dark:bg-gray-900 border-t border-gray-700 px-6 py-4 space-y-3">
          <Link
            to="/garage"
            onClick={() => setMenuOpen(false)}
            className="block py-2"
          >
            My Garage
          </Link>

          <Link
            to="/explore"
            onClick={() => setMenuOpen(false)}
            className="block py-2"
          >
            Explore
          </Link>

          {session ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block py-2"
              >
                Profile
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full text-left border px-4 py-2 rounded hover:bg-white hover:text-black dark:hover:bg-gray-700 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              onClick={() => setMenuOpen(false)}
              className="block py-2"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
