import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import logo from '../assets/drivn_logo.png'
import { LockClosedIcon } from '@heroicons/react/24/outline'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const { signInUser } = UserAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setIsVisible(true)
  }, [])

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />

      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-6 md:py-12">
        <div className="relative w-full max-w-md">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_50%)]"></div>
          
          <form
            onSubmit={handleSignIn}
            className={`relative bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl px-8 py-10 border border-gray-800/50 transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50"></div>
                <img
                  src={logo}
                  alt="drivn"
                  className="relative w-24 h-24"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                Welcome <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Back</span>
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                New to drivn?{' '}
                <Link
                  to="/signup"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500
                           border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                           outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-500
                             border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                             outline-none transition-all"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white
                         bg-gradient-to-r from-red-500 to-orange-500
                         hover:from-red-600 hover:to-orange-600
                         transform hover:scale-[1.02] active:scale-[0.98]
                         transition-all duration-200 shadow-lg shadow-red-500/20
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-center text-sm">
                  {error}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignIn
