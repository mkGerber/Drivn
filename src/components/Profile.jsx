import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from './Navbar';
import supabase from '../supabaseClient';

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

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 mt-10">

        {/* Profile Header */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-6">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-neutral-700 overflow-hidden">
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

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
                <label className="block text-sm mb-1">Avatar URL</label>
                <input
                  type="text"
                  value={profile.avatar_url || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, avatar_url: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-transparent"
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
