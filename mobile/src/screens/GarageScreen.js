import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import VehicleCard from '../components/VehicleCard';

const GarageScreen = ({ navigation }) => {
  const { session } = UserAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverImages, setCoverImages] = useState({});

  const fetchVehicles = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('id, make, model, year, current_mileage')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching garage vehicles:', error);
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

  useEffect(() => {
    fetchVehicles();
  }, [session]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          My <Text style={styles.titleAccent}>Garage</Text>
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddVehicle', { backTitle: 'Garage' })}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color="#f97316" />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              coverUrl={coverImages[item.id]}
              onPress={() =>
                navigation.navigate('VehicleDetails', {
                  carId: item.id,
                  backTitle: 'Garage',
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No vehicles yet. Add one to get started.</Text>
          }
          refreshing={loading}
          onRefresh={fetchVehicles}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  titleAccent: {
    color: '#f97316',
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: '#f97316',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.6)',
  },
  addButtonText: {
    color: '#0b1120',
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default GarageScreen;
