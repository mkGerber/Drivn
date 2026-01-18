import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import VehicleCard from '../components/VehicleCard';

const UserProfileScreen = ({ route, navigation }) => {
  const { session } = UserAuth();
  const { userId } = route.params || {};
  const [profile, setProfile] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [coverImages, setCoverImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsYou, setFollowsYou] = useState(false);
  const [stats, setStats] = useState({ totalMileage: 0, totalMaintenanceCosts: 0 });

  const followUser = async () => {
    if (!session?.user?.id || !userId) return;
    const { error } = await supabase.from('user_follows').insert({
      follower_id: session.user.id,
      following_id: userId,
    });
    if (error) {
      console.error('Error following user:', error);
    } else {
      setIsFollowing(true);
    }
  };

  const unfollowUser = async () => {
    if (!session?.user?.id || !userId) return;
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', session.user.id)
      .eq('following_id', userId);
    if (error) {
      console.error('Error unfollowing user:', error);
    } else {
      setIsFollowing(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
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

      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (carsError) {
        console.error('Error fetching vehicles:', carsError);
        setUserCars([]);
      } else {
        setUserCars(carsData || []);
        const totalMileage = (carsData || []).reduce(
          (sum, car) => sum + (Number(car.current_mileage) || 0),
          0
        );

        if (carsData && carsData.length > 0) {
          const carIds = carsData.map((car) => car.id);
          const { data: logsData, error: logsError } = await supabase
            .from('vehicle_logs')
            .select('cost')
            .in('vehicle_id', carIds);

          const totalMaintenanceCosts = logsError
            ? 0
            : (logsData || []).reduce((sum, log) => sum + (Number(log.cost) || 0), 0);
          setStats({ totalMileage, totalMaintenanceCosts });

          const { data: imagesData } = await supabase
            .from('car_images')
            .select('car_id, image_url')
            .eq('is_cover', true)
            .in('car_id', carIds);

          const map = {};
          (imagesData || []).forEach((img) => {
            map[img.car_id] = img.image_url;
          });
          setCoverImages(map);
        } else {
          setStats({ totalMileage, totalMaintenanceCosts: 0 });
        }
      }

      if (session?.user?.id && userId) {
        const { data } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', session.user.id)
          .eq('following_id', userId)
          .maybeSingle();
        setIsFollowing(!!data);

        const { data: followsData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', userId)
          .eq('following_id', session.user.id)
          .maybeSingle();
        setFollowsYou(!!followsData);
      }

      setLoading(false);
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, session?.user?.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#f97316" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={28} color="#94a3b8" />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.handle}>@{profile.username || 'user'}</Text>
            {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          </View>
        </View>
        {session?.user?.id && session.user.id !== userId && (
          <View style={styles.followRow}>
            <TouchableOpacity
              style={isFollowing ? styles.secondaryAction : styles.primaryAction}
              onPress={isFollowing ? unfollowUser : followUser}
            >
              <Text style={isFollowing ? styles.secondaryActionText : styles.primaryActionText}>
                {isFollowing ? 'Following' : 'Add Friend'}
              </Text>
            </TouchableOpacity>
            {followsYou && !isFollowing ? (
              <Text style={styles.followHint}>Follows you</Text>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Vehicles</Text>
          <Text style={styles.statValue}>{userCars.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Miles</Text>
          <Text style={styles.statValue}>{stats.totalMileage.toLocaleString()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Maintenance</Text>
          <Text style={styles.statValue}>${stats.totalMaintenanceCosts.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Garage</Text>
        {userCars.length === 0 ? (
          <Text style={styles.emptyText}>This garage is empty.</Text>
        ) : (
          userCars.map((car) => (
            <VehicleCard
              key={car.id}
              vehicle={car}
              coverUrl={coverImages[car.id]}
              onPress={() =>
                navigation.navigate('VehicleDetails', {
                  carId: car.id,
                  backTitle: 'Garage',
                })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0b1120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  headerInfo: {
    flex: 1,
  },
  handle: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 16,
  },
  bio: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  followHint: {
    color: '#94a3b8',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#f8fafc',
    fontWeight: '700',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#f97316',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#0b1120',
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  secondaryActionText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
});

export default UserProfileScreen;
