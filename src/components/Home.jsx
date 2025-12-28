import React from 'react';
import Navbar from './Navbar';
import {HomeIcon, UserIcon, WrenchIcon, CurrencyDollarIcon, UsersIcon} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Home = () => {
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

        <div className="bg-gray-900 dark:bg-gray-800 mt-10 rounded-lg w-full p-20">
          <div className="bg-gray-950 dark:bg-gray-900 rounded-lg w-10/12 mx-auto mt-14 p-14 min-h-56 flex flex-col justify-between">
            <WrenchIcon className="w-16 h-16 mb-6 bg-gray-900 dark:bg-gray-800 p-3 border border-none rounded-xl" style={{color: '#e45a41'}}/>
            <h2 className="font-bold pb-3 text-2xl text-white">Track Modifications </h2>
            <p className="text-gray-400 text-xl">Log every part, tune, and upgrade. Keep a detailed history of your build's evolution.</p>
          </div>
          <div className="bg-gray-950 dark:bg-gray-900 rounded-lg w-10/12 mx-auto mt-14 p-14 min-h-56 flex flex-col justify-between">
            <CurrencyDollarIcon className="w-16 h-16 mb-6 bg-gray-900 dark:bg-gray-800 p-3 border border-none rounded-xl" style={{color: '#58f334'}}/>
            <h2 className="font-bold pb-3 text-2xl text-white">Cost Analysis </h2>
            <p className="text-gray-400 text-xl">Visualize your spending. See exactly how much went into performance vs. aesthetics.</p>
          </div>
          <div className="bg-gray-950 dark:bg-gray-900 rounded-lg w-10/12 mx-auto mt-14 p-14 min-h-56 flex flex-col justify-between">
            <UsersIcon className="w-16 h-16 mb-6 bg-gray-900 dark:bg-gray-800 p-3 border border-none rounded-xl" style={{color: '#3480f3'}}/>
            <h2 className="font-bold pb-3 text-2xl text-white">Community Inspiration </h2>
            <p className="text-gray-400 text-xl">Browse other builds to get ideas. See what parts others are running on your chassis.</p>
          </div>
        </div>
      </div>
      <footer className="bg-white dark:bg-gray-900 text-black dark:text-white text-center p-4 border-t border-gray-200 dark:border-gray-700">
        <p>&copy; 2025 TBD. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
