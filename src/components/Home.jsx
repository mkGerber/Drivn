import React, {useEffect} from 'react';
import Navbar from './Navbar';
import {HomeIcon, UserIcon, WrenchIcon, CurrencyDollarIcon, UsersIcon} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const Home = () => {
  const {session} = UserAuth();
  const navigate = useNavigate();
  

  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen">
        
        <div className="text-center px-4 pt-14">
          <p className="bg-gray-900 dark:bg-gray-800 border rounded-3xl p-2 inline-block mb-12 opacity-90 text-white" style={{border: '1px solid #e45a41'}}>The ultimate garage manager</p>
          <h1 className="text-4xl font-bold mb-4 leading-tight text-black dark:text-white">
            Track your build.
          </h1>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-700 bg-clip-text text-transparent inline-block leading-tight pb-5">
            Share your journey.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
            Welcome to a platform where you can track your progress, share your
            journey, and connect with others who are on a similar path. Join our
            community and start building today! 
          </p>
          <a
            href="#features"
            className="button2"
            onClick = {() => navigate('/garage')}
          >
            Start Your Garage {">"}
          </a>
        </div>

        <div className="bg-gray-900 dark:bg-gray-800 mt-10 w-full px-6 py-14">
          <div
            id="features"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {/* Feature 1 */}
            <div className="bg-gray-950 dark:bg-gray-900 rounded-xl p-8 flex flex-col justify-between">
              <WrenchIcon
                className="w-12 h-12 mb-5 p-2 rounded-lg bg-gray-900 dark:bg-gray-800"
                style={{ color: '#e45a41' }}
              />
              <h2 className="font-bold text-xl text-white mb-2">
                Track Modifications
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Log every part, tune, and upgrade. Keep a detailed history of your build’s evolution.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-950 dark:bg-gray-900 rounded-xl p-8 flex flex-col justify-between">
              <CurrencyDollarIcon
                className="w-12 h-12 mb-5 p-2 rounded-lg bg-gray-900 dark:bg-gray-800"
                style={{ color: '#58f334' }}
              />
              <h2 className="font-bold text-xl text-white mb-2">
                Cost Analysis
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Visualize your spending. See exactly how much went into performance vs aesthetics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-950 dark:bg-gray-900 rounded-xl p-8 flex flex-col justify-between">
              <UsersIcon
                className="w-12 h-12 mb-5 p-2 rounded-lg bg-gray-900 dark:bg-gray-800"
                style={{ color: '#3480f3' }}
              />
              <h2 className="font-bold text-xl text-white mb-2">
                Community Inspiration
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Browse other builds to get ideas. See what parts others are running on your chassis.
              </p>
            </div>
          </div>
        </div>

      </div>
      <footer className="bg-white dark:bg-gray-900 text-black dark:text-white text-center p-4 border-t border-gray-200 dark:border-gray-700">
        <p>&copy; 2025 Drivn. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
