import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import supabase from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import logo from '../assets/drivn_logo.png'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const { signUpNewUser } = UserAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const resizeFile = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) =>
    new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target.result
        img.onload = () => {
          let { width, height } = img
          const canvas = document.createElement('canvas')

          if (width > height && width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          } else if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }

          canvas.width = width
          canvas.height = height
          canvas.getContext('2d').drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) =>
              resolve(new File([blob], file.name, { type: 'image/jpeg' })),
            'image/jpeg',
            quality
          )
        }
      }
    })

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!username.trim()) {
      setError('Username is required')
      setLoading(false)
      return
    }

    try {
      const result = await signUpNewUser(email, password)

      if (!result.success) {
        setError(result.error?.message || 'Failed to create account')
        return
      }

      await new Promise((r) => setTimeout(r, 500))
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user?.id) {
        setError('Failed to get user session')
        return
      }

      let avatarUrl = null

      if (avatarFile) {
        setUploading(true)
        try {
          const resized = await resizeFile(avatarFile)
          const path = `${session.user.id}/${uuidv4()}`

          const { data, error } = await supabase.storage
            .from('avatar-photos')
            .upload(path, resized)

          if (!error) {
            avatarUrl = supabase.storage
              .from('avatar-photos')
              .getPublicUrl(data.path).data.publicUrl
          }
        } finally {
          setUploading(false)
        }
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: session.user.id,
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
      })

      if (profileError) {
        setError(
          'Account created, but profile failed to save. You can update it later.'
        )
      }

      navigate('/garage')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />

      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-6 md:py-12">
        <div className="relative w-full max-w-md">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_50%)]"></div>
          
          <form
            onSubmit={handleSignUp}
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
                Start Your <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Journey</span>
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500
                             border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                             outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500
                             border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                             outline-none transition-all"
                />
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center py-4">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Profile Photo (Optional)
                </label>
                <label className="relative w-24 h-24 rounded-full overflow-hidden
                                  border-2 border-dashed border-gray-600
                                  hover:border-red-500 cursor-pointer transition-all
                                  group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-800 group-hover:bg-gray-700 transition-colors">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500
                             border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                             outline-none resize-none transition-all"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading || uploading}
              className="mt-6 w-full py-3 rounded-lg font-semibold text-white
                         bg-gradient-to-r from-red-500 to-orange-500
                         hover:from-red-600 hover:to-orange-600
                         transform hover:scale-[1.02] active:scale-[0.98]
                         transition-all duration-200 shadow-lg shadow-red-500/20
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading avatar...
                </span>
              ) : loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

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

export default Signup
