import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const Profile = () => {
  const { session, signOut } = UserAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 mt-10">

        {/* Profile Header */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-6">

            {/* Avatar - Clickable */}
            <div 
              className="w-24 h-24 rounded-full bg-gray-300 dark:bg-neutral-700 overflow-hidden cursor-pointer relative group"
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
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {/* Overlay on hover only */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity flex items-center justify-center pointer-events-none">
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-sm">Uploading...</div>
                </div>
              )}
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={uploadImage}
              className="hidden"
            />

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  @{profile.username || 'username'}
                </h1>

                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 text-sm border border-gray-300 dark:border-neutral-700 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  Edit profile
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {session.user.email}
              </p>

              {profile.bio && (
                <p className="mt-3 text-sm max-w-md">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        {isEditing && (
          <div className="mt-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Edit profile</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveProfile(e);
                setIsEditing(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Upload Profile Photo</label>
                <input
                  type="file"
                  onChange={uploadImage}
                  className="block w-full text-sm text-gray-700 dark:text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:bg-gray-700 dark:file:bg-gray-600 file:text-white
                    hover:file:bg-gray-600 dark:hover:file:bg-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Bio</label>
                <textarea
                  rows="3"
                  value={profile.bio || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 text-sm border border-gray-300 dark:border-neutral-700 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Settings */}
        <div className="mt-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 space-y-3">
          <button
            onClick={toggleDarkMode}
            className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            Switch to {darkMode ? 'Light' : 'Dark'} mode
          </button>

          <button
            onClick={handleSignOut}
            className="w-full text-left text-sm px-3 py-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-neutral-800"
          >
            Sign out
          </button>
        </div>

        {/* Feedback */}
        <div className="mt-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Feedback</h2>

          <form onSubmit={submitFeedback}>
            <textarea
              rows="3"
              placeholder="Suggestions or feedback…"
              onChange={(e) => setSuggestions(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-neutral-700 rounded-md resize-none bg-transparent mb-3"
            />

            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
        </div>

      </div>
    </div>
  );



};

export default Profile;
