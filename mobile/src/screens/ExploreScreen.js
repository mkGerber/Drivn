import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import VehicleCard from '../components/VehicleCard';

const ExploreScreen = ({ navigation }) => {
  const { session } = UserAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverImages, setCoverImages] = useState({});
  const [search, setSearch] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [plateSearch, setPlateSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('id, make, model, year, current_mileage, user_id, transmission, license_plate, created_at')
        .eq('public', true)
        .neq('user_id', session.user.id)
        .limit(30);

      if (error) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]);
      } else {
        setVehicles(data || []);
        const ids = (data || []).map((car) => car.id).filter(Boolean);
        if (ids.length > 0) {
          const { data: images, error: imagesError } = await supabase
            .from('car_images')
            .select('car_id, image_url')
            .eq('is_cover', true)
            .in('car_id', ids);

          if (imagesError) {
            console.error('Error fetching cover images:', imagesError);
            setCoverImages({});
          } else {
            const map = {};
            (images || []).forEach((img) => {
              map[img.car_id] = img.image_url;
            });
            setCoverImages(map);
          }
        } else {
          setCoverImages({});
        }
      }
      setLoading(false);
    };

    fetchVehicles();
  }, [session]);

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
    if (v.includes('manual') || v.includes('mt') || v.includes('stick') || v.includes('speed')) {
      return 'manual';
    }
    return 'other';
  };

  const filteredVehicles = vehicles
    .filter((car) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return `${car.make} ${car.model}`.toLowerCase().includes(s);
    })
    .filter((car) => {
      if (!plateSearch) return true;
      if (!car.license_plate) return false;
      const plateQuery = plateSearch.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
      const carPlate = (car.license_plate || '').toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
      return carPlate.includes(plateQuery) || plateQuery.includes(carPlate);
    })
    .filter((car) => {
      if (transmissionFilter === 'all') return true;
      return normalizeTransmission(car.transmission) === transmissionFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'mileage-low':
          return (a.current_mileage ?? 0) - (b.current_mileage ?? 0);
        case 'year-new':
          return (b.year ?? 0) - (a.year ?? 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Explore <Text style={styles.titleAccent}>Builds</Text>
      </Text>
      <View style={styles.filterCard}>
        <View style={styles.filterRow}>
          <TextInput
            style={[styles.input, styles.searchInput]}
            placeholder="Search make or model"
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters((prev) => !prev)}
          >
            <Text style={styles.filterButtonText}>
              {showFilters ? 'Hide' : 'Filters'}
            </Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterStack}>
            <TextInput
              style={styles.input}
              placeholder="Plate search"
              placeholderTextColor="#64748b"
              value={plateSearch}
              onChangeText={setPlateSearch}
            />
            <View style={styles.chipGroup}>
              <Text style={styles.chipLabel}>Transmission</Text>
              <View style={styles.chipRow}>
                {['all', 'automatic', 'manual'].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.chip,
                      transmissionFilter === value && styles.chipActive,
                    ]}
                    onPress={() => setTransmissionFilter(value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        transmissionFilter === value && styles.chipTextActive,
                      ]}
                    >
                      {value === 'all'
                        ? 'All'
                        : value === 'automatic'
                        ? 'Auto'
                        : 'Manual'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.chipGroup}>
              <Text style={styles.chipLabel}>Sort</Text>
              <View style={styles.chipRow}>
                {[
                  { key: 'newest', label: 'Newest' },
                  { key: 'mileage-low', label: 'Mileage' },
                  { key: 'year-new', label: 'Year' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.chip,
                      sortBy === option.key && styles.chipActive,
                    ]}
                    onPress={() => setSortBy(option.key)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        sortBy === option.key && styles.chipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
      {loading ? (
        <ActivityIndicator color="#38bdf8" />
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              coverUrl={coverImages[item.id]}
              onPress={() =>
                navigation.navigate('VehicleDetails', {
                  carId: item.id,
                  backTitle: 'Explore',
                })
              }
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No vehicles found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    padding: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  titleAccent: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  filterCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginBottom: 12,
  },
  filterStack: {
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    borderRadius: 10,
    padding: 9,
    color: '#f8fafc',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.6)',
  },
  filterButtonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  chipGroup: {
    marginBottom: 10,
  },
  chipLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
  },
  chipActive: {
    borderColor: 'rgba(56, 189, 248, 0.7)',
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#f8fafc',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default ExploreScreen;
