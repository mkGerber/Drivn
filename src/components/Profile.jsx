import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { PencilIcon, CameraIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [ suggestions, setSuggestions ] = useState("");
  console.log(suggestions);

  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error(error);
      } else if (data) {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  const saveProfile = async (e) => {
    e.preventDefault();

    const updates = {
      id: session.user.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      updated_at: new Date()
    };

    const {error} = await supabase
      .from('profiles')
      .upsert(updates);
    
    if (error) {
      console.error("Error updating profile: ", error);
      alert("Failed to save profile")
    } else {
      alert("Profile updated!");
    }
  };


  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    alert('Thank you for your feedback!');
    const newFeedback = {
      suggestion: suggestions,
    }
    const { data, error } = await supabase.from('suggestions').insert([newFeedback]).single();
    if (error) {
      console.error("Error submitting feedback:", error);
    } else {
      console.log("Feedback submitted successfully:", data);
    }
    setSuggestions('');
  }

  const uploadImage = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploading(true);

    try {
      const resizedFile = await resizeFile(selectedFile);
      const path = `${session.user.id}/${uuidv4()}`;

      const { data, error: uploadError } = await supabase.storage
        .from("avatar-photos")
        .upload(path, resizedFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Failed to upload image. Please try again.");
        return;
      }

      const publicUrl = supabase.storage
        .from("avatar-photos")
        .getPublicUrl(data.path).data.publicUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        alert("Failed to update profile. Please try again.");
        return;
      }

      // Update local state with new avatar URL
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      // Also refetch profile to ensure everything is in sync
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (updatedProfile) {
        setProfile(updatedProfile);
      }

    } catch (err) {
      console.error("Upload failed:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };


  const resizeFile = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let { width, height } = img;
          const canvas = document.createElement('canvas');

          if (width > height && width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          } else if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
            'image/jpeg',
            quality
          );
        };
      };
    });

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Header */}
        <div
          className={`mb-8 transform transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-gray-400 text-lg">Manage your account and preferences</p>
        </div>

        {/* Profile Header */}
        <div
          className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-6 transform transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={uploadImage}
            className="hidden"
          />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar - Clickable */}
            <div 
              className="w-32 h-32 flex-shrink-0 rounded-full bg-gray-700 overflow-hidden cursor-pointer relative group z-10 border-4 border-gray-700 hover:border-red-500 transition-all"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile photo"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {/* Overlay on hover only */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <CameraIcon className="w-8 h-8 text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mb-2"></div>
                    <div className="text-white text-sm">Uploading...</div>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    @{profile.username || 'username'}
                  </h1>
                  <p className="text-gray-400">
                    {session.user.email}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-red-500/50 flex items-center gap-2"
                >
                  <PencilIcon className="w-5 h-5" />
                  Edit Profile
                </button>
              </div>

              {profile.bio ? (
                <p className="text-gray-300 text-base max-w-md mx-auto sm:mx-0 bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-gray-500 text-sm italic">No bio yet. Add one in your profile settings!</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        {isEditing && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveProfile(e);
                setIsEditing(false);
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Profile Photo</label>
                <input
                  type="file"
                  onChange={uploadImage}
                  className="block w-full text-sm text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:bg-gray-700 file:text-white
                    hover:file:bg-gray-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  rows="4"
                  value={profile.bio || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-red-500/50"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Settings */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition border border-red-500/30 hover:border-red-500/50 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Feedback</h2>
          <p className="text-gray-400 mb-6">We'd love to hear your suggestions and feedback!</p>

          <form onSubmit={submitFeedback} className="space-y-4">
            <textarea
              rows="4"
              placeholder="Share your thoughts, suggestions, or report any issues..."
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              className="w-full p-4 border border-gray-700 rounded-lg resize-none bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
            />

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-blue-500/50 flex items-center gap-2"
            >
              Submit Feedback
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );



};

export default Profile;
