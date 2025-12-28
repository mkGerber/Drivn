import React, { useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Dashboard = () => {
  const { session, signOut } = UserAuth();
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

  if (!session) return null; // prevents render flicker

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <h2 className="mb-4">Welcome, {session.user.email}</h2>
        <div>
          <p
            onClick={handleSignOut}
            className="hover:cursor-pointer border border-gray-300 dark:border-gray-600 inline-block px-4 py-3 mt-4 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Sign out
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
