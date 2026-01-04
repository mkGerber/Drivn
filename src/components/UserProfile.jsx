import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import { Link } from 'react-router-dom';
import stockCarImage from '../assets/stock-car.jpg';
import { ArrowRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [coverImages, setCoverImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, bio')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch user's vehicles
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (carsError) {
          console.error('Error fetching vehicles:', carsError);
        } else {
          setUserCars(carsData || []);
        }

        // Fetch cover images
        if (carsData && carsData.length > 0) {
          const carIds = carsData.map(car => car.id);
          const { data: imagesData, error: imagesError } = await supabase
            .from('car_images')
            .select('car_id, image_url')
            .eq('is_cover', true)
            .in('car_id', carIds);

          if (!imagesError && imagesData) {
            const map = {};
            imagesData.forEach((img) => (map[img.car_id] = img.image_url));
            setCoverImages(map);
          }
        }
      } catch (err) {
        console.error('Error in fetchProfile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-white text-xl mb-4">User not found</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white -mt-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6 md:py-12">
        {/* Hero Header */}
        <div
          className={`mb-8 transform transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(228,90,65,0.1),transparent_50%)]"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Avatar */}
              <div className="w-32 h-32 flex-shrink-0 rounded-full bg-gray-700 overflow-hidden border-4 border-gray-700">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 w-full text-center sm:text-left">
                <h1 className="text-4xl font-extrabold text-white mb-2">
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    @{profile.username || 'user'}
                  </span>
                </h1>

                {profile.bio && (
                  <p className="text-gray-300 text-base mt-3 max-w-2xl bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                    {profile.bio}
                  </p>
                )}

                <div className="mt-6 flex items-center gap-6">
                  <div className="bg-gray-900/50 rounded-xl px-6 py-3 border border-gray-700/50">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      {userCars.length}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {userCars.length === 1 ? 'Vehicle' : 'Vehicles'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Garage Section */}
        <div
          className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <HomeIcon className="w-6 h-6 text-red-400" />
            <h2 className="text-3xl font-bold text-white">Garage</h2>
          </div>

          {userCars.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <HomeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl font-semibold text-white mb-2">No vehicles yet</p>
              <p className="text-gray-400">This garage is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userCars.map((car, index) => (
                <Link
                  key={car.id}
                  to={`/vehicle/${car.id}`}
                  className={`transform transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
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

                      {/* Year Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg">
                          {car.year}
                        </span>
                      </div>

                      {/* For Sale Badge */}
                      {car.for_sale && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                            ${car.asking_price ? Number(car.asking_price).toLocaleString() : ''} FOR SALE
                          </span>
                        </div>
                      )}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

