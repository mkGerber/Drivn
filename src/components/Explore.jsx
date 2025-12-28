import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import supabase from '../supabaseClient';
import { Link } from 'react-router-dom';
import notFound from '../assets/notfound.jpg'
import { UserAuth } from '../context/AuthContext';

const Explore = () => {
  //Get vehicles from all users - Limit to 20 for now
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverImages, setCoverImages] = useState([]);
  const { session } = UserAuth();

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('public', true)
      .neq('user_id', session.user.id)
      .limit(20)
      .order('created_at', { ascending: false });
    if (data) {
      setVehicles(data);
    } else {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
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

  useEffect(() => {
    fetchVehicles();
    fetchCoverImages();
  }, []);



  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <Navbar />
        {/* Loading */}
        {loading && <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">Loading Vehicles...</p>}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <div className="text-center mt-24 text-gray-600 dark:text-gray-400">
            <p className="text-xl">There are no vehicles to explore</p>
            <p className="text-sm mt-2">
              Invite your friends!
            </p>
          </div>
        )}

        {/* BIG VEHICLE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 m-10">
          {vehicles.map((car) => (
            <Link key={car.id} to={`/vehicle/${car.id}`}>
              <div className="group bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition">
                {/* Image */}
                <div className="relative">
                  <img
                    src={coverImages[car.id] || notFound}
                    alt={`${car.make} ${car.model}`}
                    className="h-[340px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-6">
                    <span className="text-sm text-gray-200">
                      View vehicle →
                    </span>
                  </div>
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
    
  )
}

export default Explore