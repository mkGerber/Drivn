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
      <nav className="hidden md:block w-full text-white border-b border-gray-700 sticky top-0 z-50 bg-[#0a1120] dark:bg-gray-900">
        <div className="h-16 flex items-center justify-between px-6 max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="text-xl font-extrabold">
            Drivn
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link to="/garage" className="navigation-button">
              My Garage
            </Link>
            <Link to="/explore" className="navigation-button">
              Explore
            </Link>
            <Link to="/marketplace" className="navigation-button">
              Marketplace
            </Link>

            {session ? (
              <Link to="/profile" className="button2">
                Profile
              </Link>
            ) : (
              <Link to="/signin" className="button2">
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ===================== */}
      {/* Mobile Bottom Navbar */}
      {/* ===================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a1120] dark:bg-gray-900 border-t border-gray-700">
        <div className="flex justify-around items-center h-16 text-white">
          <Link to="/" className="flex flex-col items-center text-xs">
            {isActive('/') ? (
              <HomeSolid className="h-6 w-6" />
            ) : (
              <HomeIcon className="h-6 w-6 opacity-70" />
            )}
            Home
          </Link>

          <Link to="/explore" className="flex flex-col items-center text-xs">
            {isActive('/explore') ? (
              <SearchSolid className="h-6 w-6" />
            ) : (
              <MagnifyingGlassIcon className="h-6 w-6 opacity-70" />
            )}
            Explore
          </Link>

          <Link to="/marketplace" className="flex flex-col items-center text-xs">
            {isActive('/marketplace') ? (
              <BagSolid className="h-6 w-6" />
            ) : (
              <ShoppingBagIcon className="h-6 w-6 opacity-70" />
            )}
            Market
          </Link>

          {session ? (
            <Link to="/profile" className="flex flex-col items-center text-xs">
              {isActive('/profile') ? (
                <UserSolid className="h-6 w-6" />
              ) : (
                <UserCircleIcon className="h-6 w-6 opacity-70" />
              )}
              Profile
            </Link>
          ) : (
            <Link to="/signin" className="flex flex-col items-center text-xs">
              <UserCircleIcon className="h-6 w-6 opacity-70" />
              Login
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
