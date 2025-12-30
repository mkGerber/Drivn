import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import logo from '../assets/drivn_logo.png'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signInUser } = UserAuth()
  const navigate = useNavigate()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signInUser(email, password)
      if (result.success) {
        navigate('/garage')
      } else {
        setError(result.error || 'Invalid email or password')
      }
    } catch {
      setError('An error occurred while signing in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="flex justify-center pt-24 px-4">
        <form
          onSubmit={handleSignIn}
          className="w-full max-w-md bg-white/80 dark:bg-gray-800/80
                     backdrop-blur-lg rounded-2xl shadow-xl px-6 py-8"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={logo}
              alt="drivn"
              className="w-20 h-20 mb-3"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              New to drivn?{' '}
              <Link
                to="/signup"
                className="text-blue-600 dark:text-blue-400 font-medium"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 mt-4 rounded-lg bg-gray-100 dark:bg-gray-700
                       text-gray-900 dark:text-white placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 mt-4 rounded-lg bg-gray-100 dark:bg-gray-700
                       text-gray-900 dark:text-white placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 rounded-lg font-semibold text-white
                       bg-gradient-to-r from-blue-600 to-blue-500
                       hover:from-blue-500 hover:to-blue-400
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Error */}
          {error && (
            <p className="text-red-600 dark:text-red-400 text-center mt-4 text-sm">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default SignIn
