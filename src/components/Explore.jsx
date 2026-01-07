import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import { Link } from 'react-router-dom';
import notFound from '../assets/notfound.jpg';
import { UserAuth } from '../context/AuthContext';
import { MagnifyingGlassIcon, FunnelIcon, ArrowRightIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Explore = () => {
  const { session } = UserAuth();

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverImages, setCoverImages] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ totalMileage: 0, totalMaintenanceCosts: 0 });
  const [sponsors, setSponsors] = useState([]);
  const [randomizedSponsors, setRandomizedSponsors] = useState([]);

  // Filters / Sort
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [plateSearch, setPlateSearch] = useState('');

  

  const fetchVehicles = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    // Fetch all public vehicles for stats (no limit to get accurate totals)
    const { data: allVehicles, error: allError } = await supabase
      .from('cars')
      .select('id, current_mileage')
      .eq('public', true)
      .neq('user_id', session.user.id)
      .limit(10000); // High limit to ensure we get all vehicles

    // Fetch limited vehicles for display
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('public', true)
      .neq('user_id', session.user.id)
      .limit(20);

    if (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } else {
      setVehicles(data || []);
    }

    // Calculate stats from all vehicles
    let totalMileage = 0;
    let totalMaintenanceCosts = 0;

    if (!allError && allVehicles) {
      console.log('All vehicles fetched:', allVehicles.length);
      console.log('Vehicles data:', allVehicles);
      
      // Calculate total mileage
      if (Array.isArray(allVehicles) && allVehicles.length > 0) {
        for (let i = 0; i < allVehicles.length; i++) {
          const car = allVehicles[i];
          const mileage = Number(car?.current_mileage) || 0;
          totalMileage += mileage;
          console.log(`Car ${i + 1}: mileage = ${mileage}, running total = ${totalMileage}`);
        }
        console.log('Final total mileage:', totalMileage);
        
        // Fetch maintenance logs for all public vehicles
        const carIds = allVehicles.map(car => car.id).filter(id => id);
        console.log('Car IDs for maintenance logs:', carIds.length);
        
        if (carIds.length > 0) {
          const { data: logsData, error: logsError } = await supabase
            .from('vehicle_logs')
            .select('cost')
            .in('vehicle_id', carIds);

          if (!logsError && logsData) {
            console.log('Maintenance logs fetched:', logsData.length);
            for (let i = 0; i < logsData.length; i++) {
              const log = logsData[i];
              const cost = Number(log?.cost) || 0;
              totalMaintenanceCosts += cost;
            }
            console.log('Final total maintenance costs:', totalMaintenanceCosts);
          } else if (logsError) {
            console.error('Error fetching maintenance logs:', logsError);
          }
        }
      } else {
        console.warn('allVehicles is not an array or is empty:', allVehicles);
      }
    } else if (allError) {
      console.error('Error fetching all vehicles:', allError);
    }

    console.log('Setting stats:', { totalMileage, totalMaintenanceCosts });
    setStats({ totalMileage, totalMaintenanceCosts });

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

  const incrementCarVisits = async (carId) => {
    try {
      // Get current visits count first
      const { data: carData, error: fetchError } = await supabase
        .from('cars')
        .select('visits')
        .eq('id', carId)
        .single();
      
      if (!fetchError && carData) {
        const currentVisits = carData.visits || 0;
        await supabase
          .from('cars')
          .update({ visits: currentVisits + 1 })
          .eq('id', carId);
      }
    } catch (error) {
      console.error('Error incrementing car visits:', error);
    }
  };

  const fetchSponsors = async () => {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*');

    if (!error && data) {
      setSponsors(data || []);
      // Randomize sponsors
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setRandomizedSponsors(shuffled);
    }
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchVehicles();
    fetchCoverImages();
    fetchSponsors();
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

    // License plate search (fuzzy matching)
    if (plateSearch) {
      const plateQuery = plateSearch.toLowerCase().replace(/\s+/g, '').replace(/-/g, ''); // Remove spaces and dashes for matching
      result = result.filter(car => {
        if (!car.license_plate) return false;
        const carPlate = (car.license_plate || '').toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
        // Check if the plate contains the search query or is similar
        return carPlate.includes(plateQuery) || 
               plateQuery.includes(carPlate) ||
               calculateSimilarity(carPlate, plateQuery) > 0.6;
      });
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
  }, [vehicles, search, sortBy, transmissionFilter, plateSearch, session]);

  // Helper function to calculate similarity between two strings
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  // Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };


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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:py-12">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              Explore <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Builds</span>
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
                <div className="text-gray-400 text-sm mt-1">Total Builds</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {stats.totalMileage.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm mt-1">Total Miles</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  ${stats.totalMaintenanceCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-gray-400 text-sm mt-1">Total Maintenance</div>
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

          {/* License Plate Search */}
          <div className="mt-4 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by license plate (e.g., ABC123 or ABC-123)..."
              value={plateSearch}
              onChange={(e) => setPlateSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            {plateSearch && (
              <button
                onClick={() => setPlateSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                type="button"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            )}
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(() => {
              const items = [];
              
              // Helper function to get a random sponsor (cycles through randomized list)
              const getSponsorForIndex = (adIndex) => {
                if (randomizedSponsors.length === 0) return null;
                return randomizedSponsors[adIndex % randomizedSponsors.length];
              };

              filteredVehicles.forEach((car, index) => {
                // Add car card
                items.push(
                  <Link
                    key={car.id}
                    to={`/vehicle/${car.id}`}
                    onClick={() => incrementCarVisits(car.id)}
                    className={`transform transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 flex flex-col h-full">
                      {/* Image Container */}
                      <div className="relative h-[300px] overflow-hidden flex-shrink-0">
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
                      <div className="p-5 bg-gradient-to-b from-gray-800/50 to-gray-900/50 flex flex-col flex-grow">
                        <h2 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                          {car.make} {car.model}
                        </h2>
                        <p className="text-gray-400 text-sm mb-3 min-h-[1.25rem]">
                          {car.trim || '\u00A0'}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700/50 mt-auto">
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
                );

                // Add sponsor ad card after every 5 cars
                if ((index + 1) % 5 === 0 && randomizedSponsors.length > 0) {
                  const adIndex = Math.floor((index + 1) / 5) - 1;
                  const sponsor = getSponsorForIndex(adIndex);
                  
                  if (sponsor) {
                    // Ensure URL is absolute (starts with http:// or https://) if website_link exists
                    const websiteUrl = sponsor.website_link 
                      ? (sponsor.website_link.startsWith('http://') || sponsor.website_link.startsWith('https://')
                        ? sponsor.website_link
                        : `https://${sponsor.website_link}`)
                      : null;
                    
                    const CardContent = (
                      <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col h-full">
                        {/* Image Container */}
                        <div className="relative h-[300px] overflow-hidden flex-shrink-0">
                          {sponsor.image_url ? (
                            <img
                              src={sponsor.image_url}
                              alt={sponsor.company}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <div className="text-4xl font-extrabold text-white">
                                {sponsor.company.charAt(0)}
                              </div>
                            </div>
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Hover Text */}
                          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 text-white font-semibold">
                              <span>{websiteUrl ? 'Visit Website' : 'Sponsored'}</span>
                              {websiteUrl && <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </div>
                          </div>
                          
                          {/* AD Badge */}
                          <div className="absolute top-4 right-4">
                            <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-lg">
                              AD
                            </span>
                          </div>
                        </div>

                        {/* Info Section */}
                        <div className="p-5 bg-gradient-to-b from-gray-800/50 to-gray-900/50 flex flex-col flex-grow">
                          <h2 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                            {sponsor.company}
                          </h2>
                          <p className="text-gray-400 text-sm mb-3 min-h-[1.25rem]">
                            {sponsor.description || '\u00A0'}
                          </p>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700/50 mt-auto">
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sponsored</div>
                              <div className="text-sm font-semibold text-white">
                                Content
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trusted</div>
                              <div className="text-sm font-semibold text-white">
                                Partner
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    
                    items.push(
                      websiteUrl ? (
                        <div
                          key={`sponsor-${sponsor.id}-${adIndex}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Sponsor click - URL:', websiteUrl);
                            if (websiteUrl && websiteUrl !== '#') {
                              window.open(websiteUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className={`transform transition-all duration-700 cursor-pointer ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                          }`}
                          style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                        >
                          {CardContent}
                        </div>
                      ) : (
                        <div
                          key={`sponsor-${sponsor.id}-${adIndex}`}
                          className={`transform transition-all duration-700 ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                          }`}
                          style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                        >
                          {CardContent}
                        </div>
                      )
                    );
                  }
                }
              });

              return items;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
