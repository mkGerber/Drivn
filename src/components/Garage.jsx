import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { PlusIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import supabase from '../supabaseClient';
import { Link } from 'react-router-dom';
import stockCarImage from '../assets/notfound.jpg';
import { UserAuth } from '../context/AuthContext';

const Garage = () => {
  const { session } = UserAuth();
  const [userCars, setUserCars] = useState([]);
  const [coverImages, setCoverImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ totalMileage: 0, totalMaintenanceCosts: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchUserCars = async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setUserCars(data || []);
        // Calculate stats
        const totalMileage = (data || []).reduce((sum, car) => sum + (Number(car.current_mileage) || 0), 0);
        
        // Fetch maintenance logs for all vehicles
        if (data && data.length > 0) {
          const carIds = data.map(car => car.id);
          const { data: logsData, error: logsError } = await supabase
            .from('vehicle_logs')
            .select('cost')
            .in('vehicle_id', carIds);

          if (!logsError && logsData) {
            const totalMaintenanceCosts = logsData.reduce((sum, log) => sum + (Number(log.cost) || 0), 0);
            setStats({ totalMileage, totalMaintenanceCosts });
          } else {
            setStats({ totalMileage, totalMaintenanceCosts: 0 });
          }
        } else {
          setStats({ totalMileage, totalMaintenanceCosts: 0 });
        }
      }
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
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-block p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-6">
                <StarIcon className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Your Garage Awaits
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Sign up or log in to start tracking your vehicles, mileage, and mods.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105">
                  Sign Up
                </button>
              </Link>
              <Link to="/signin">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  Log In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black -mt-0">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(228,90,65,0.1),transparent_50%)]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:py-12">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2">
                  My <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Garage</span>
                </h1>
                <p className="text-gray-400 text-lg">
                  {userCars.length === 0 
                    ? 'Start building your collection' 
                    : `${userCars.length} vehicle${userCars.length !== 1 ? 's' : ''} in your collection`}
                </p>
              </div>

              <Link to="/addvehicle">
                <button className="group px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  <PlusIcon className="w-5 h-5" />
                  Add Vehicle
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Stats */}
            {!loading && userCars.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    {userCars.length}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Vehicles</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    {stats.totalMileage.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Total Miles</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 col-span-2 md:col-span-1">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                    ${stats.totalMaintenanceCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Total Maintenance</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
            <p className="text-gray-400">Loading your garage...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && userCars.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div
            className={`text-center transform transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-block p-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl mb-6">
              <StarIcon className="w-20 h-20 text-red-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Garage is Empty
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
              Start building your collection by adding your first vehicle. Track maintenance, share your build, and connect with the community.
            </p>
            <Link to="/addvehicle">
              <button className="group px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto">
                <PlusIcon className="w-6 h-6" />
                Add Your First Vehicle
                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Vehicle Grid */}
      {!loading && userCars.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userCars.map((car, index) => (
              <Link
                key={car.id}
                to={`/vehicle/${car.id}`}
                className={`transform transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20">
                  {/* Image Container */}
                  <div className="relative h-[380px] overflow-hidden">
                    <img
                      src={coverImages[car.id] || stockCarImage}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Hover Text */}
                    <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <span>View Details</span>
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* For Sale Badge */}
                    {car.for_sale && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                          FOR SALE
                        </span>
                      </div>
                    )}

                    {/* Year Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg">
                        {car.year}
                      </span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
                    <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                      {car.make} {car.model}
                    </h2>
                    {car.trim && (
                      <p className="text-gray-400 mb-4">{car.trim}</p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mileage</div>
                        <div className="text-lg font-semibold text-white">
                          {car.current_mileage?.toLocaleString() || '0'} mi
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transmission</div>
                        <div className="text-lg font-semibold text-white uppercase">
                          {car.transmission || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Garage;
