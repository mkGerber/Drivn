import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { PlusIcon } from '@heroicons/react/24/outline';
import supabase from '../supabaseClient';
import { Link } from 'react-router-dom';
import stockCarImage from '../assets/stock-car.jpg';
import { UserAuth } from '../context/AuthContext';

const Garage = () => {
  const { session } = UserAuth();
  if (!session) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <Navbar />

        <div className="max-w-xl mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">
            Your Garage Awaits
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign up or log in to start tracking your vehicles, mileage, and mods.
          </p>

          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <button className="button2">
                Sign Up
              </button>
            </Link>

            <Link to="/signin">
              <button className="button2 outline">
                Log In
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [userCars, setUserCars] = useState([]);
  const [coverImages, setCoverImages] = useState({});
  const [loading, setLoading] = useState(true);
  

  
  

  useEffect(() => {
    if (!session) return; // wait until session exists

    const fetchUserCars = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error) setUserCars(data || []);
      setLoading(false);
    };

    const fetchCoverImages = async () => {
      const { data, error } = await supabase
        .from('car_images')
        .select('car_id, image_url')
        .eq('is_cover', true);

      if (!error) {
        const map = {};
        data.forEach((img) => (map[img.car_id] = img.image_url));
        setCoverImages(map);
      }
    };

    fetchUserCars();
    fetchCoverImages();
  }, [session]); // ✅ Add session as dependency


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Garage</h1>

          <Link to="/addvehicle">
            <button className="button2 flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Add Vehicle
            </button>
          </Link>
        </div>

        {/* Loading */}
        {loading && <p className="text-gray-600 dark:text-gray-400">Loading vehicles...</p>}

        {/* Empty State */}
        {!loading && userCars.length === 0 && (
          <div className="text-center mt-24 text-gray-600 dark:text-gray-400">
            <p className="text-xl">Your garage is empty</p>
            <p className="text-sm mt-2">
              Add your first vehicle to get started
            </p>
          </div>
        )}

        {/* BIG VEHICLE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {userCars.map((car) => (
            <Link key={car.id} to={`/vehicle/${car.id}`}>
              <div className="group bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition">
                {/* Image */}
                <div className="relative">
                  <img
                    src={coverImages[car.id] || stockCarImage}
                    alt={`${car.make} ${car.model}`}
                    className="h-[340px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-6">
                    <span className="text-sm text-gray-200">
                      View vehicle →
                    </span>
                  </div>

                  {car.for_sale && (
                    <span className="absolute top-4 right-4 bg-green-700 text-white text-sm px-3 py-1 rounded-full">
                      $ LISTED FOR SALE $
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-6 space-y-2">
                  <h2 className="text-xl font-semibold">
                    {car.year} {car.make} {car.model}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{car.trim}</p>

                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-300 dark:border-gray-700">
                    <span>{car.current_mileage} miles</span>
                    <span className="uppercase tracking-wide">
                      {car.transmission}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Garage;
