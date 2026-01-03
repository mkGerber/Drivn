import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import { Link } from 'react-router-dom';
import stockCarImage from '../assets/stock-car.jpg';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [coverImages, setCoverImages] = useState({});
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <Navbar />
        <div className="p-6">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <Navbar />
        <div className="p-6">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <h1 className="text-2xl font-semibold mb-2">
                @{profile.username || 'user'}
              </h1>

              {profile.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md">
                  {profile.bio}
                </p>
              )}

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {userCars.length} {userCars.length === 1 ? 'vehicle' : 'vehicles'}
              </div>
            </div>
          </div>
        </div>

        {/* Garage Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Garage</h2>

          {userCars.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <p className="text-lg">No vehicles in this garage yet</p>
            </div>
          ) : (
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
                          ${car.asking_price ? Number(car.asking_price).toFixed(0) : ''} FOR SALE
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
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

