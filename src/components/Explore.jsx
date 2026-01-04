import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import { Link } from 'react-router-dom';
import notFound from '../assets/notfound.jpg';
import { UserAuth } from '../context/AuthContext';
import { MagnifyingGlassIcon, FunnelIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const Explore = () => {
  const { session } = UserAuth();

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverImages, setCoverImages] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  // Filters / Sort
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [transmissionFilter, setTransmissionFilter] = useState('all');

  

  const fetchVehicles = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('public', true)
      .neq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  const fetchCoverImages = async () => {
    const { data, error } = await supabase
      .from('car_images')
      .select('car_id, image_url')
      .eq('is_cover', true);

    if (!error && data) {
      const map = {};
      data.forEach(img => {
        map[img.car_id] = img.image_url;
      });
      setCoverImages(map);
    }
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchVehicles();
    fetchCoverImages();
  }, [session]);

  // Filter + sort logic
  useEffect(() => {
    if (!session) return;

    let result = [...vehicles];

    // Helper to normalize transmission values
    const normalizeTransmission = (value = '') => {
      const v = value.toLowerCase();

      if (
        v.includes('auto') ||
        v.includes('automatic') ||
        v.includes('at') ||
        v.includes('cvt') ||
        v.includes('dct')
      ) {
        return 'automatic';
      }

      if (
        v.includes('manual') ||
        v.includes('mt') ||
        v.includes('stick') ||
        v.includes('speed')
      ) {
        return 'manual';
      }

      return 'other';
    };

    // Search (make + model)
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(car =>
        `${car.make} ${car.model}`.toLowerCase().includes(s)
      );
    }

    // Transmission filter (fuzzy)
    if (transmissionFilter !== 'all') {
      result = result.filter(car =>
        normalizeTransmission(car.transmission) === transmissionFilter
      );
    }

    // Sort
    switch (sortBy) {
      case 'mileage-low':
        result.sort(
          (a, b) => (a.current_mileage ?? 0) - (b.current_mileage ?? 0)
        );
        break;

      case 'year-new':
        result.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;

      default:
        result.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }

    setFilteredVehicles(result);
  }, [vehicles, search, sortBy, transmissionFilter, session]);


  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Explore Builds</h1>
            <p className="text-xl text-gray-400 mb-8">Sign in to discover amazing vehicles</p>
            <Link to="/signin">
              <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300 hover:scale-105">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white -mt-0">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(228,90,65,0.1),transparent_50%)]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:py-12">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              Explore <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Builds</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Discover amazing vehicles from the community
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  {vehicles.length}
                </div>
                <div className="text-gray-400 text-sm mt-1">Total Vehicles</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {filteredVehicles.length}
                </div>
                <div className="text-gray-400 text-sm mt-1">Showing</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  {vehicles.filter(v => v.for_sale).length}
                </div>
                <div className="text-gray-400 text-sm mt-1">For Sale</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div
          className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transform transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by make or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
              />
            </div>

            {/* Transmission Filter */}
            <select
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Transmissions</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="newest">Newest</option>
              <option value="mileage-low">Lowest Mileage</option>
              <option value="year-new">Newest Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
            <p className="text-gray-400">Loading vehicles...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredVehicles.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <p className="text-2xl font-bold text-white mb-2">No vehicles found</p>
            <p className="text-gray-400">
              {search || transmissionFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Invite your friends to share their builds!'}
            </p>
          </div>
        </div>
      )}

      {/* Vehicle Grid */}
      {!loading && filteredVehicles.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((car, index) => (
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
                  <div className="relative h-[300px] overflow-hidden">
                    <img
                      src={coverImages[car.id] || notFound}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Hover Text */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                          FOR SALE
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-5 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
                    <h2 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                      {car.make} {car.model}
                    </h2>
                    {car.trim && (
                      <p className="text-gray-400 text-sm mb-3">{car.trim}</p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700/50">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mileage</div>
                        <div className="text-sm font-semibold text-white">
                          {car.current_mileage?.toLocaleString() || '0'} mi
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transmission</div>
                        <div className="text-sm font-semibold text-white uppercase">
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

export default Explore;
