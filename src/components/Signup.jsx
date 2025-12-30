import React, { useState } from 'react'
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

  const { signUpNewUser } = UserAuth()
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="flex justify-center pt-24 px-4">
        <form
          onSubmit={handleSignUp}
          className="relative w-full max-w-md bg-white/80 dark:bg-gray-800/80
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
              Start your drivn journey
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="text-blue-600 dark:text-blue-400 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Inputs */}
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

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 mt-4 rounded-lg bg-gray-100 dark:bg-gray-700
                       text-gray-900 dark:text-white placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Avatar */}
          <div className="mt-4 flex flex-col items-center">
            <h3 className="mb-2">Upload Profile Photo</h3>
            <label className="relative w-20 h-20 rounded-full overflow-hidden
                              border-2 border-dashed border-gray-400
                              hover:border-blue-500 cursor-pointer transition">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                  Upload
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
          <textarea
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full p-3 mt-4 rounded-lg bg-gray-100 dark:bg-gray-700
                       text-gray-900 dark:text-white placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />

          {/* Button */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="mt-6 w-full py-3 rounded-lg font-semibold text-white
                       bg-gradient-to-r from-blue-600 to-blue-500
                       hover:from-blue-500 hover:to-blue-400
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading
              ? 'Uploading avatar...'
              : loading
              ? 'Creating account...'
              : 'Create Account'}
          </button>

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

export default Signup
