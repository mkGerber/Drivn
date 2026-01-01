import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import notFound from '../assets/notfound.jpg';

const Marketplace = () => {
  const { session } = UserAuth();

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [coverImages, setCoverImages] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters / Sort
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [transmissionFilter, setTransmissionFilter] = useState('all');

  /* ================================
     Fetch Vehicles
  ================================= */
  const fetchVehicles = async () => {
    if (!session) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('public', true)
      .eq('for_sale', true)
      .neq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
      setFilteredVehicles([]);
      setCoverImages({});
      setLoading(false);
      return;
    }

    setVehicles(data);
    setFilteredVehicles(data);

    const carIds = data.map(car => car.id);
    fetchCoverImages(carIds);

    setLoading(false);
  };

  /* ================================
     Fetch Cover Images
  ================================= */
  const fetchCoverImages = async (carIds) => {
    if (!carIds || carIds.length === 0) return;

    const { data, error } = await supabase
      .from('car_images')
      .select('car_id, image_url')
      .eq('is_cover', true)
      .in('car_id', carIds);

    if (error) {
      console.error('Error fetching cover images:', error);
      return;
    }

    const map = {};
    data.forEach(img => {
      map[img.car_id] = img.image_url;
    });

    setCoverImages(map);
  };

  /* ================================
     Initial Load
  ================================= */
  useEffect(() => {
    fetchVehicles();
  }, [session]);

  /* ================================
     Filters + Sort
  ================================= */
  useEffect(() => {
    let result = [...vehicles];

    // Search
    if (search) {
      result = result.filter(car =>
        `${car.make} ${car.model}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Transmission
    if (transmissionFilter !== 'all') {
      result = result.filter(
        car => car.transmission === transmissionFilter
      );
    }

    // Sort
    switch (sortBy) {
      case 'mileage-low':
        result.sort((a, b) => a.current_mileage - b.current_mileage);
        break;
      case 'year-new':
        result.sort((a, b) => b.year - a.year);
        break;
      default:
        result.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }

    setFilteredVehicles(result);
  }, [vehicles, search, transmissionFilter, sortBy]);

  /* ================================
     Render
  ================================= */
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Navbar />

      {loading && (
        <p className="text-center mt-10 text-gray-600 dark:text-gray-400">
          Loading Vehicles...
        </p>
      )}

      {!loading && filteredVehicles.length === 0 && (
        <div className="text-center mt-24 text-gray-600 dark:text-gray-400">
          <p className="text-xl">There are no vehicles for sale</p>
          <p className="text-sm mt-2">Check back later!</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mx-10 mt-6 items-center">
        <input
          type="text"
          placeholder="Search by make or model"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 outline-none"
        />

        <select
          value={transmissionFilter}
          onChange={(e) => setTransmissionFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800"
        >
          <option value="all">All Transmissions</option>
          <option value="manual">Manual</option>
          <option value="automatic">Automatic</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800"
        >
          <option value="newest">Newest</option>
          <option value="mileage-low">Lowest Mileage</option>
          <option value="year-new">Newest Year</option>
        </select>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 m-10">
        {filteredVehicles.map(car => (
          <Link key={car.id} to={`/vehicle/${car.id}`}>
            <div className="group bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
              <div className="relative">
                <img
                  src={coverImages[car.id] || notFound}
                  alt={`${car.make} ${car.model}`}
                  className="h-[340px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <span className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                  {car.year}
                </span>

                <span className="absolute top-4 right-4 bg-green-700 text-white text-sm px-3 py-1 rounded-full">
                  ${car.asking_price}
                </span>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-6">
                  <span className="text-sm text-gray-200">
                    View vehicle →
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-2">
                <h2 className="text-xl font-semibold">
                  {car.year} {car.make} {car.model}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {car.trim}
                </p>

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
  );
};

export default Marketplace;
