import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

const MarketplaceScreen = ({ navigation }) => {
  const { session } = UserAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverImages, setCoverImages] = useState({});
  const [search, setSearch] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select(
          'id, make, model, year, current_mileage, user_id, transmission, created_at, asking_price'
        )
        .eq('public', true)
        .eq('for_sale', true)
        .neq('user_id', session.user.id)
        .limit(30);

      if (error) {
        console.error('Error fetching marketplace vehicles:', error);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('VehicleDetails', {
          carId: item.id,
          backTitle: 'Marketplace',
        })
      }
    >
      {coverImages[item.id] ? (
        <Image source={{ uri: coverImages[item.id] }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No Photo</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {item.make} {item.model}
          </Text>
          <Text style={styles.year}>{item.year || '—'}</Text>
        </View>
        <Text style={styles.price}>
          ${Number(item.asking_price || 0).toLocaleString()}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Mileage</Text>
          <Text style={styles.metaValue}>
            {item.current_mileage ? `${item.current_mileage.toLocaleString()} mi` : '—'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Transmission</Text>
          <Text style={styles.metaValue}>{item.transmission || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          <Text style={styles.titleAccent}>Marketplace</Text>
        </Text>
        <TouchableOpacity
          style={styles.messageIconButton}
          onPress={() => navigation.navigate('Conversations')}
        >
          <Ionicons name="chatbubbles-outline" size={18} color="#86efac" />
        </TouchableOpacity>
      </View>
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
        <ActivityIndicator color="#22c55e" />
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No vehicles for sale.</Text>}
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
    color: '#22c55e',
    fontWeight: '800',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  messageIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  filterCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterStack: {
    marginTop: 8,
  },
  input: {
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    borderRadius: 10,
    padding: 9,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.6)',
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
    borderColor: 'rgba(34, 197, 94, 0.75)',
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#f8fafc',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(11, 18, 36, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: '#64748b',
    fontSize: 12,
  },
  cardBody: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 15,
  },
  year: {
    color: '#94a3b8',
    fontSize: 12,
  },
  price: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#e2e8f0',
    fontSize: 12,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default MarketplaceScreen;
