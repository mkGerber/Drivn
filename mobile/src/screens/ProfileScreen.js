import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import { Ionicons } from '@expo/vector-icons';
import { UserAuth } from '../context/AuthContext';
import supabase from '../supabaseClient';
import VehicleCard from '../components/VehicleCard';

const ProfileScreen = ({ navigation }) => {
  const { session, signOut } = UserAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    bio: '',
  });

  const [savedVehicles, setSavedVehicles] = useState([]);
  const [savedVehiclesLoading, setSavedVehiclesLoading] = useState(true);
  const [coverImages, setCoverImages] = useState({});

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const [suggestions, setSuggestions] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);


  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile({
          username: data.username || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) {
      setSavedVehiclesLoading(false);
      return;
    }

    const fetchSavedVehicles = async () => {
      setSavedVehiclesLoading(true);
      const { data, error } = await supabase
        .from('saved_vehicles')
        .select('car_id, cars (*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved vehicles:', error);
        setSavedVehicles([]);
      } else {
        const vehicles = (data || [])
          .map((item) => item.cars)
          .filter((car) => car !== null);
        setSavedVehicles(vehicles);

        const ids = vehicles.map((car) => car.id).filter(Boolean);
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
      setSavedVehiclesLoading(false);
    };

    fetchSavedVehicles();
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) {
      setFollowersLoading(false);
      setFollowingLoading(false);
      return;
    }

    const fetchFollowers = async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', session.user.id);
      if (error) {
        console.error('Error fetching followers:', error);
        setFollowers([]);
        setFollowersLoading(false);
        return;
      }
      if (!data || data.length === 0) {
        setFollowers([]);
        setFollowersLoading(false);
        return;
      }
      const followerIds = data.map((item) => item.follower_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followerIds);
      if (profilesError) {
        console.error('Error fetching follower profiles:', profilesError);
        setFollowers([]);
      } else {
        setFollowers(profilesData || []);
      }
      setFollowersLoading(false);
    };

    const fetchFollowing = async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', session.user.id);
      if (error) {
        console.error('Error fetching following:', error);
        setFollowing([]);
        setFollowingLoading(false);
        return;
      }
      if (!data || data.length === 0) {
        setFollowing([]);
        setFollowingLoading(false);
        return;
      }
      const followingIds = data.map((item) => item.following_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followingIds);
      if (profilesError) {
        console.error('Error fetching following profiles:', profilesError);
        setFollowing([]);
      } else {
        setFollowing(profilesData || []);
      }
      setFollowingLoading(false);
    };

    fetchFollowers();
    fetchFollowing();
  }, [session]);

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    const updates = {
      id: session.user.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      updated_at: new Date(),
    };
    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      console.error('Error updating profile:', error);
    } else {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handlePickAvatar = async () => {
    if (!session?.user?.id) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow photo access to upload an avatar.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    let result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Unable to open photo library.');
      return;
    }

    if (result.canceled) return;

    try {
      setUploading(true);
      const asset = result.assets[0];
      const fileExt = asset.uri.split('.').pop() || 'jpg';
      const path = `${session.user.id}/${Date.now()}.${fileExt}`;
      const contentType = asset.mimeType || 'image/jpeg';

      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: 'base64',
      });
      const fileBuffer = Buffer.from(base64, 'base64');

      const { error: uploadError } = await supabase.storage
        .from('avatar-photos')
        .upload(path, fileBuffer, { contentType, upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setUploading(false);
        return;
      }

      const publicUrl = supabase.storage
        .from('avatar-photos')
        .getPublicUrl(path).data.publicUrl;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      } else {
        setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const submitFeedback = async () => {
    if (!suggestions.trim()) return;
    setSubmittingFeedback(true);
    const { error } = await supabase.from('suggestions').insert([{ suggestion: suggestions }]);
    if (error) {
      console.error('Error submitting feedback:', error);
    } else {
      setSuggestions('');
    }
    setSubmittingFeedback(false);
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;
    Alert.alert(
      'Delete account',
      'This will remove your profile and data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);
            try {
              const userId = session.user.id;
              const { data: cars } = await supabase
                .from('cars')
                .select('id')
                .eq('user_id', userId);

              const carIds = (cars || []).map((car) => car.id).filter(Boolean);

              if (carIds.length > 0) {
                await supabase.from('car_images').delete().in('car_id', carIds);
                await supabase.from('vehicle_logs').delete().in('vehicle_id', carIds);
              }

              await supabase.from('vehicle_logs').delete().eq('user_id', userId);
              await supabase.from('saved_vehicles').delete().eq('user_id', userId);
              await supabase.from('user_follows').delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`);
              await supabase.from('comments').delete().eq('user_id', userId);
              await supabase.from('posts').delete().eq('user_id', userId);
              await supabase.from('cars').delete().eq('user_id', userId);
              await supabase.from('profiles').delete().eq('id', userId);

              // Optional: log a deletion request for audit/support purposes
              await supabase.from('delete_requests').insert([{ user_id: userId }]).catch(() => {});

              await supabase.auth.signOut();
            } catch (err) {
              console.error('Error deleting account:', err);
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Please sign in.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickAvatar}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={42} color="#94a3b8" />
            </View>
          )}
          {uploading && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#f97316" />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.handle}>@{profile.username || 'username'}</Text>
          <Text style={styles.email}>{session.user.email}</Text>
          {profile.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : (
            <Text style={styles.bioEmpty}>Add a short bio to introduce yourself.</Text>
          )}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
          <Ionicons name="create-outline" size={16} color="#f8fafc" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {isEditing && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Edit Profile</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#64748b"
            value={profile.username}
            onChangeText={(value) => setProfile((prev) => ({ ...prev, username: value }))}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Bio"
            placeholderTextColor="#64748b"
            value={profile.bio}
            onChangeText={(value) => setProfile((prev) => ({ ...prev, bio: value }))}
            multiline
          />
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.button} onPress={handleSaveProfile} disabled={saving}>
              <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statCard} onPress={() => setShowFollowersModal(true)}>
          <Text style={styles.statLabel}>Followers</Text>
          <Text style={styles.statValue}>
            {followersLoading ? '—' : followers.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => setShowFollowingModal(true)}>
          <Text style={styles.statLabel}>Following</Text>
          <Text style={styles.statValue}>
            {followingLoading ? '—' : following.length}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Saved Vehicles</Text>
        {savedVehiclesLoading ? (
          <ActivityIndicator color="#f97316" />
        ) : savedVehicles.length === 0 ? (
          <Text style={styles.emptyText}>No saved vehicles yet.</Text>
        ) : (
          <FlatList
            data={savedVehicles}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <VehicleCard vehicle={item} coverUrl={coverImages[item.id]} />
            )}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Feedback</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Share feedback or suggestions..."
          placeholderTextColor="#64748b"
          value={suggestions}
          onChangeText={setSuggestions}
          multiline
        />
        <TouchableOpacity
          style={styles.button}
          onPress={submitFeedback}
          disabled={submittingFeedback}
        >
          <Text style={styles.buttonText}>
            {submittingFeedback ? 'Sending...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Legal</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('Legal', { section: 'privacy' })}
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('Legal', { section: 'terms' })}
        >
          <Text style={styles.linkText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('Legal', { section: 'support' })}
        >
          <Text style={styles.linkText}>Contact Support</Text>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.dangerButton}
        onPress={handleDeleteAccount}
        disabled={deletingAccount}
      >
        <Text style={styles.dangerText}>
          {deletingAccount ? 'Deleting...' : 'Delete Account'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showFollowersModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Followers</Text>
              <TouchableOpacity onPress={() => setShowFollowersModal(false)}>
                <Ionicons name="close" size={20} color="#f8fafc" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {followersLoading ? (
                <ActivityIndicator color="#f97316" />
              ) : followers.length === 0 ? (
                <Text style={styles.emptyText}>No followers yet.</Text>
              ) : (
                followers.map((user) => (
                  <View key={user.id} style={styles.userRow}>
                    <View style={styles.userAvatar}>
                      {user.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} style={styles.userAvatarImage} />
                      ) : (
                        <Ionicons name="person" size={18} color="#94a3b8" />
                      )}
                    </View>
                    <Text style={styles.userName}>@{user.username || 'user'}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showFollowingModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Following</Text>
              <TouchableOpacity onPress={() => setShowFollowingModal(false)}>
                <Ionicons name="close" size={20} color="#f8fafc" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {followingLoading ? (
                <ActivityIndicator color="#f97316" />
              ) : following.length === 0 ? (
                <Text style={styles.emptyText}>Not following anyone yet.</Text>
              ) : (
                following.map((user) => (
                  <View key={user.id} style={styles.userRow}>
                    <View style={styles.userAvatar}>
                      {user.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} style={styles.userAvatarImage} />
                      ) : (
                        <Ionicons name="person" size={18} color="#94a3b8" />
                      )}
                    </View>
                    <Text style={styles.userName}>@{user.username || 'user'}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  avatarOverlay: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  handle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  bio: {
    color: '#e2e8f0',
    textAlign: 'center',
  },
  bioEmpty: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.6)',
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
  },
  editButtonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    borderRadius: 12,
    padding: 12,
    color: '#f8fafc',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0b1120',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  editActions: {
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  signOutButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.5)',
    alignItems: 'center',
  },
  signOutText: {
    color: '#f87171',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  linkText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.5)',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  dangerText: {
    color: '#f87171',
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default ProfileScreen;
