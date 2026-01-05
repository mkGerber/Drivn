import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as SearchSolid,
  ShoppingBagIcon as BagSolid,
  UserCircleIcon as UserSolid,
} from '@heroicons/react/24/solid';

const Navbar = () => {
  const { session } = UserAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* ===================== */}
      {/* Desktop Top Navbar */}
      {/* ===================== */}
      <nav className="hidden md:block w-full text-white border-b border-gray-700/50 sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md">
        <div className="h-16 flex items-center justify-between px-6 max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold hover:opacity-90 transition">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Drivn
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-4">
            <Link
              to="/garage"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isActive('/garage')
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 !text-white shadow-lg shadow-red-500/50'
                  : '!text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              My Garage
            </Link>
            <Link
              to="/explore"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isActive('/explore')
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 !text-white shadow-lg shadow-blue-500/50'
                  : '!text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Explore
            </Link>
            <Link
              to="/marketplace"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isActive('/marketplace')
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 !text-white shadow-lg shadow-green-500/50'
                  : '!text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Marketplace
            </Link>

            {session ? (
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive('/profile')
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 !text-white shadow-lg shadow-purple-500/50'
                    : '!text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Profile
              </Link>
            ) : (
              <Link
                to="/signin"
                className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 shadow-lg shadow-red-500/50 transition-all"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ===================== */}
      {/* Mobile Bottom Navbar */}
      {/* ===================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50">
        <div className="flex justify-around items-center h-16 text-white">
          <Link
            to="/garage"
            className={`flex flex-col items-center text-xs transition-all ${
              isActive('/garage')
                ? 'text-red-400 scale-110'
                : 'text-gray-400'
            }`}
          >
            {isActive('/garage') ? (
              <HomeSolid className="h-6 w-6" />
            ) : (
              <HomeIcon className="h-6 w-6" />
            )}
            <span className="mt-1 font-medium">Garage</span>
          </Link>

          <Link
            to="/explore"
            className={`flex flex-col items-center text-xs transition-all ${
              isActive('/explore')
                ? 'text-blue-400 scale-110'
                : 'text-gray-400'
            }`}
          >
            {isActive('/explore') ? (
              <SearchSolid className="h-6 w-6" />
            ) : (
              <MagnifyingGlassIcon className="h-6 w-6" />
            )}
            <span className="mt-1 font-medium">Explore</span>
          </Link>

          <Link
            to="/marketplace"
            className={`flex flex-col items-center text-xs transition-all ${
              isActive('/marketplace')
                ? 'text-green-400 scale-110'
                : 'text-gray-400'
            }`}
          >
            {isActive('/marketplace') ? (
              <BagSolid className="h-6 w-6" />
            ) : (
              <ShoppingBagIcon className="h-6 w-6" />
            )}
            <span className="mt-1 font-medium">Market</span>
          </Link>

          {session ? (
            <Link
              to="/profile"
              className={`flex flex-col items-center text-xs transition-all ${
                isActive('/profile')
                  ? 'text-purple-400 scale-110'
                  : 'text-gray-400'
              }`}
            >
              {isActive('/profile') ? (
                <UserSolid className="h-6 w-6" />
              ) : (
                <UserCircleIcon className="h-6 w-6" />
              )}
              <span className="mt-1 font-medium">Profile</span>
            </Link>
          ) : (
            <Link
              to="/signin"
              className="flex flex-col items-center text-xs text-gray-400 transition-all hover:text-red-400"
            >
              <UserCircleIcon className="h-6 w-6" />
              <span className="mt-1 font-medium">Login</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind bottom nav */}
      <div className="md:hidden h-16" />
    </>
  );
};

export default Navbar;
