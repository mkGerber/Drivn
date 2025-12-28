import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from './Navbar';

const Profile = () => {
  const { session, signOut } = UserAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!session) {
      navigate('/signin');
    }
  }, [session, navigate]);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <Navbar />

      <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all">
        <h1 className="text-3xl font-bold mb-4 text-center">Your Profile</h1>

        {/* Profile Info */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <p className="text-gray-700 dark:text-gray-200 font-medium mb-2">Email:</p>
          <p className="text-lg font-semibold break-words">{session.user.email}</p>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full mb-4 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-purple-500 hover:to-blue-400 active:scale-95 transition-transform shadow-md"
        >
          Switch to {darkMode ? 'Light' : 'Dark'} Mode
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full px-6 py-3 rounded-xl font-medium border border-red-500 text-red-500 hover:bg-red-500 hover:text-white active:scale-95 transition-all shadow-sm"
        >
          Sign Out
        </button>
      </div>
      <div className="text-center mt-4 text-gray-600 dark:text-gray-400">More will be added soon!</div>
    </div>
  );
};

export default Profile;
