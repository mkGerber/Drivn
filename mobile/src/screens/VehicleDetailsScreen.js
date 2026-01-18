import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

const LOG_CATEGORIES = [
  'Oil Change',
  'Brakes',
  'Tires',
  'Fluids',
  'Filters',
  'Battery',
  'Inspection',
  'Repair',
  'Other',
];

const VehicleDetailsScreen = ({ route, navigation }) => {
  const { session } = UserAuth();
  const { carId } = route.params || {};
  const [vehicle, setVehicle] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [addLogVisible, setAddLogVisible] = useState(false);
  const [addGasVisible, setAddGasVisible] = useState(false);
  const [hideGasLogs, setHideGasLogs] = useState(false);

  const [logTitle, setLogTitle] = useState('');
  const [logDescription, setLogDescription] = useState('');
  const [logCategory, setLogCategory] = useState('');
  const [logCost, setLogCost] = useState('');
  const [logDate, setLogDate] = useState('');
  const [logMileage, setLogMileage] = useState('');
  const [logToolsUsed, setLogToolsUsed] = useState('');
  const [logLaborHours, setLogLaborHours] = useState('');
  const [logPerformer, setLogPerformer] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logGallons, setLogGallons] = useState('');
  const [logsToShow, setLogsToShow] = useState(10);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [editedMake, setEditedMake] = useState('');
  const [editedModel, setEditedModel] = useState('');
  const [editedYear, setEditedYear] = useState('');
  const [editedTrim, setEditedTrim] = useState('');
  const [editedEngine, setEditedEngine] = useState('');
  const [editedTransmission, setEditedTransmission] = useState('');
  const [editedMileage, setEditedMileage] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [editedLicensePlate, setEditedLicensePlate] = useState('');
  const [editedVin, setEditedVin] = useState('');
  const [editedOilChangeInterval, setEditedOilChangeInterval] = useState('');
  const [editedStory, setEditedStory] = useState('');

  const screenWidth = Dimensions.get('window').width;
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 80 };

  const [editingLogId, setEditingLogId] = useState(null);
  const [editingLogIsGas, setEditingLogIsGas] = useState(false);
  const [editedLogTitle, setEditedLogTitle] = useState('');
  const [editedLogDescription, setEditedLogDescription] = useState('');
  const [editedLogCategory, setEditedLogCategory] = useState('');
  const [editedLogCost, setEditedLogCost] = useState('');
  const [editedLogDate, setEditedLogDate] = useState('');
  const [editedLogMileage, setEditedLogMileage] = useState('');
  const [editedLogToolsUsed, setEditedLogToolsUsed] = useState('');
  const [editedLogLaborHours, setEditedLogLaborHours] = useState('');
  const [editedLogPerformer, setEditedLogPerformer] = useState('');
  const [editedLogNotes, setEditedLogNotes] = useState('');
  const [editedLogGallons, setEditedLogGallons] = useState('');
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [isFollowingOwner, setIsFollowingOwner] = useState(false);
  const [ownerFollowsYou, setOwnerFollowsYou] = useState(false);

  const canEdit = session?.user?.id && vehicle?.user_id === session.user.id;

  const fetchVehicle = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single();

    if (error) {
      console.error('Error fetching vehicle:', error);
      setVehicle(null);
    } else {
      setVehicle(data);
    }
    setLoading(false);
  };

  const fetchOwnerProfile = async (ownerId) => {
    if (!ownerId) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio')
      .eq('id', ownerId)
      .single();
    if (error) {
      console.error('Error fetching owner profile:', error);
      setOwnerProfile(null);
    } else {
      setOwnerProfile(data);
    }
  };

  const checkOwnerFollow = async (ownerId) => {
    if (!session?.user?.id || !ownerId) return;
    const { data } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', session.user.id)
      .eq('following_id', ownerId)
      .maybeSingle();
    setIsFollowingOwner(!!data);

    const { data: followsData } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', ownerId)
      .eq('following_id', session.user.id)
      .maybeSingle();
    setOwnerFollowsYou(!!followsData);
  };

  const followOwner = async () => {
    if (!session?.user?.id || !ownerProfile?.id) return;
    const { error } = await supabase.from('user_follows').insert({
      follower_id: session.user.id,
      following_id: ownerProfile.id,
    });
    if (error) {
      console.error('Error following owner:', error);
    } else {
      setIsFollowingOwner(true);
    }
  };

  const unfollowOwner = async () => {
    if (!session?.user?.id || !ownerProfile?.id) return;
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', session.user.id)
      .eq('following_id', ownerProfile.id);
    if (error) {
      console.error('Error unfollowing owner:', error);
    } else {
      setIsFollowingOwner(false);
    }
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('vehicle_logs')
      .select('*')
      .eq('vehicle_id', carId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } else {
      setLogs(data || []);
    }
  };

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('car_images')
      .select('id, image_url, is_cover')
      .eq('car_id', carId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    } else {
      setImages(data || []);
    }
  };

  useEffect(() => {
    if (!carId) return;
    fetchVehicle();
    fetchLogs();
    fetchImages();
  }, [carId]);

  useEffect(() => {
    if (vehicle?.user_id) {
      fetchOwnerProfile(vehicle.user_id);
      checkOwnerFollow(vehicle.user_id);
    }
  }, [vehicle?.user_id, session?.user?.id]);

  const lastOilChangeLog = logs.find((log) => {
    if (log.gas) return false;
    return (log.category || '').toLowerCase() === 'oil change';
  });
  const oilChangeInterval = Number(vehicle?.oil_change_interval || 0);
  const lastOilChangeMileage = lastOilChangeLog?.mileage
    ? Number(lastOilChangeLog.mileage)
    : null;
  const nextOilChangeMileage =
    oilChangeInterval > 0 && lastOilChangeMileage !== null
      ? lastOilChangeMileage + oilChangeInterval
      : null;

  const filteredLogs = hideGasLogs ? logs.filter((log) => !log.gas) : logs;
  const visibleLogs = filteredLogs.slice(0, logsToShow);
  const vehicleStory =
    vehicle?.story ||
    vehicle?.vehicle_story ||
    vehicle?.build_story ||
    vehicle?.description ||
    vehicle?.about ||
    vehicle?.notes ||
    '';
  const storyFieldKey =
    (vehicle && 'story' in vehicle && 'story') ||
    (vehicle && 'vehicle_story' in vehicle && 'vehicle_story') ||
    (vehicle && 'build_story' in vehicle && 'build_story') ||
    (vehicle && 'description' in vehicle && 'description') ||
    (vehicle && 'about' in vehicle && 'about') ||
    (vehicle && 'notes' in vehicle && 'notes') ||
    null;
  const totalCost = filteredLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0);
  const totalLaborHours = filteredLogs.reduce(
    (sum, log) => sum + (Number(log.labor_hours) || 0),
    0
  );

  const handleDeleteLog = (logId) => {
    if (!canEdit) return;
    Alert.alert('Delete Log', 'Are you sure you want to delete this log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('vehicle_logs').delete().eq('id', logId);
          if (error) {
            console.error('Error deleting log:', error);
          } else {
            fetchLogs();
          }
        },
      },
    ]);
  };

  const handleStartEditVehicle = () => {
    if (!vehicle) return;
    setEditedMake(vehicle.make || '');
    setEditedModel(vehicle.model || '');
    setEditedYear(vehicle.year ? String(vehicle.year) : '');
    setEditedTrim(vehicle.trim || '');
    setEditedEngine(vehicle.engine || '');
    setEditedTransmission(vehicle.transmission || '');
    setEditedMileage(vehicle.current_mileage ? String(vehicle.current_mileage) : '');
    setEditedColor(vehicle.color || '');
    setEditedLicensePlate(vehicle.license_plate || '');
    setEditedVin(vehicle.vin || '');
    setEditedOilChangeInterval(
      vehicle.oil_change_interval ? String(vehicle.oil_change_interval) : ''
    );
    setEditedStory(vehicleStory || '');
    setIsEditingVehicle(true);
  };

  const handleSaveVehicle = async () => {
    if (!canEdit || !vehicle) return;
    setSavingVehicle(true);
    const updates = {
      make: editedMake,
      model: editedModel,
      year: editedYear ? Number(editedYear) : null,
      trim: editedTrim || null,
      engine: editedEngine || null,
      transmission: editedTransmission || null,
      current_mileage: editedMileage ? Number(editedMileage) : null,
      color: editedColor || null,
      license_plate: editedLicensePlate || null,
      vin: editedVin || null,
      oil_change_interval: editedOilChangeInterval ? Number(editedOilChangeInterval) : null,
    };

    if (storyFieldKey) {
      updates[storyFieldKey] = editedStory || null;
    }

    const { data, error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', carId)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle:', error);
    } else {
      setVehicle(data);
      setIsEditingVehicle(false);
    }
    setSavingVehicle(false);
  };

  const handleAddPhotos = async () => {
    if (!canEdit) return;
    try {
      setUploadingPhotos(true);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Please allow photo access to upload images.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        setUploadingPhotos(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        allowsMultipleSelection: true,
      });

      if (result.canceled) {
        setUploadingPhotos(false);
        return;
      }

      const assets = result.assets || [];
      const hasCover = images.some((img) => img.is_cover);

      for (let i = 0; i < assets.length; i += 1) {
        const asset = assets[i];
        const fileExt = asset.uri.split('.').pop() || 'jpg';
        const path = `${carId}/${Date.now()}-${i}.${fileExt}`;
        const contentType = asset.mimeType || 'image/jpeg';

        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: 'base64',
        });
        const fileBuffer = Buffer.from(base64, 'base64');

        const { error: uploadError } = await supabase.storage
          .from('vehicle-photos')
          .upload(path, fileBuffer, { contentType, upsert: true });

        if (!uploadError) {
          const publicUrl = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(path).data.publicUrl;

          await supabase
            .from('car_images')
            .insert({
              car_id: carId,
              image_url: publicUrl,
              is_cover: !hasCover && i === 0,
            });
        } else {
          console.error('Image upload error:', uploadError);
        }
      }

      fetchImages();
    } catch (err) {
      console.error('Error uploading images:', err);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = (image) => {
    if (!canEdit) return;
    Alert.alert('Delete photo', 'Remove this photo from your vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const imageUrl = image.image_url || '';
            const match = imageUrl.match(/\/storage\/v1\/object\/public\/vehicle-photos\/(.+)$/);
            const storagePath = match?.[1] || null;

            if (storagePath) {
              const { error: removeError } = await supabase.storage
                .from('vehicle-photos')
                .remove([storagePath]);
              if (removeError) {
                console.error('Error removing storage file:', removeError);
              }
            }

            const { error: dbError } = await supabase
              .from('car_images')
              .delete()
              .eq('id', image.id);
            if (dbError) {
              console.error('Error deleting image record:', dbError);
            } else {
              fetchImages();
            }
          } catch (err) {
            console.error('Error deleting photo:', err);
          }
        },
      },
    ]);
  };

  const handleEditLog = (log) => {
    if (!canEdit) return;
    setEditingLogId(log.id);
    setEditingLogIsGas(!!log.gas);
    setEditedLogTitle(log.title || '');
    setEditedLogDescription(log.description || '');
    setEditedLogCategory(log.category || '');
    setEditedLogCost(log.cost != null ? String(log.cost) : '');
    setEditedLogDate(log.date || '');
    setEditedLogMileage(log.mileage != null ? String(log.mileage) : '');
    setEditedLogToolsUsed(log.tools_used || '');
    setEditedLogLaborHours(log.labor_hours != null ? String(log.labor_hours) : '');
    setEditedLogPerformer(log.performed_by || '');
    setEditedLogNotes(log.notes || '');
    setEditedLogGallons(log.gas_gallons != null ? String(log.gas_gallons) : '');
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setEditingLogIsGas(false);
  };

  const handleSaveEdit = async () => {
    if (!editingLogId || !canEdit) return;
    if (!editedLogDate || !editedLogCost) return;
    setLogLoading(true);

    const updatePayload = editingLogIsGas
      ? {
          cost: Number(editedLogCost),
          date: editedLogDate,
          mileage: editedLogMileage ? Number(editedLogMileage) : null,
          gas_gallons: editedLogGallons ? Number(editedLogGallons) : null,
        }
      : {
          title: editedLogTitle || null,
          description: editedLogDescription || null,
          category: editedLogCategory || null,
          cost: Number(editedLogCost),
          date: editedLogDate,
          mileage: editedLogMileage ? Number(editedLogMileage) : null,
          tools_used: editedLogToolsUsed || null,
          labor_hours: editedLogLaborHours ? Number(editedLogLaborHours) : null,
          performed_by: editedLogPerformer || null,
          notes: editedLogNotes || null,
        };

    const { error } = await supabase
      .from('vehicle_logs')
      .update(updatePayload)
      .eq('id', editingLogId);

    if (error) {
      console.error('Error updating log:', error);
    } else {
      setEditingLogId(null);
      setEditingLogIsGas(false);
      fetchLogs();
    }
    setLogLoading(false);
  };

  const handleAddLog = async () => {
    if (!session?.user?.id || !canEdit) return;
    if (!logTitle || !logCategory || !logCost || !logDate) return;
    setLogLoading(true);
    const { error } = await supabase.from('vehicle_logs').insert([
      {
        vehicle_id: carId,
        user_id: session.user.id,
        title: logTitle,
        description: logDescription || null,
        category: logCategory,
        cost: Number(logCost),
        date: logDate,
        mileage: logMileage ? Number(logMileage) : null,
        tools_used: logToolsUsed || null,
        labor_hours: logLaborHours ? Number(logLaborHours) : null,
        performed_by: logPerformer || null,
        notes: logNotes || null,
      },
    ]);

    if (error) {
      console.error('Error adding log:', error);
    } else {
      setLogTitle('');
      setLogDescription('');
      setLogCategory('');
      setLogCost('');
      setLogDate('');
      setLogMileage('');
      setLogToolsUsed('');
      setLogLaborHours('');
      setLogPerformer('');
      setLogNotes('');
      fetchLogs();
    }
    setLogLoading(false);
  };

  const handleAddGasLog = async () => {
    if (!session?.user?.id || !canEdit) return;
    if (!logCost || !logDate) return;
    setLogLoading(true);
    const { error } = await supabase.from('vehicle_logs').insert([
      {
        vehicle_id: carId,
        user_id: session.user.id,
        title: 'Gas',
        cost: Number(logCost),
        date: logDate,
        mileage: logMileage ? Number(logMileage) : null,
        gas: true,
        gas_gallons: logGallons ? Number(logGallons) : null,
      },
    ]);

    if (error) {
      console.error('Error adding gas log:', error);
    } else {
      setLogCost('');
      setLogDate('');
      setLogMileage('');
      setLogGallons('');
      fetchLogs();
    }
    setLogLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#f97316" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Vehicle not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={styles.title}>
            {vehicle.make} {vehicle.model}
          </Text>
          <Text style={styles.subtitle}>
            {vehicle.year || '—'} • {vehicle.trim || 'Build'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.communityButton}
          onPress={() =>
            navigation.navigate('VehicleCommunity', {
              carId,
              vehicleName: `${vehicle.make} ${vehicle.model}`,
            })
          }
        >
          <Ionicons name="chatbubbles-outline" size={16} color="#f8fafc" />
        </TouchableOpacity>
      </View>
      <View style={styles.badgeRow}>
        {vehicle.year ? (
          <View style={[styles.badge, styles.badgePrimary]}>
            <Text style={styles.badgeText}>{vehicle.year}</Text>
          </View>
        ) : null}
        {vehicle.transmission ? (
          <View style={[styles.badge, styles.badgeSecondary]}>
            <Text style={styles.badgeText}>{vehicle.transmission}</Text>
          </View>
        ) : null}
        {vehicle.engine ? (
          <View style={[styles.badge, styles.badgeTertiary]}>
            <Text style={styles.badgeText}>{vehicle.engine}</Text>
          </View>
        ) : null}
      </View>

      {ownerProfile && (
        <View style={styles.ownerCard}>
          <TouchableOpacity
            style={styles.ownerRow}
            onPress={() =>
              navigation.navigate('UserProfile', {
                userId: ownerProfile.id,
                backTitle: 'Vehicle',
              })
            }
          >
            <View style={styles.ownerAvatar}>
              {ownerProfile.avatar_url ? (
                <Image source={{ uri: ownerProfile.avatar_url }} style={styles.ownerAvatarImage} />
              ) : (
                <Ionicons name="person" size={20} color="#94a3b8" />
              )}
            </View>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>@{ownerProfile.username || 'user'}</Text>
              
            </View>
            
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.galleryHeader}>
        <Text style={styles.cardTitle}>Photos</Text>
        {canEdit && (
          <TouchableOpacity
            style={styles.addToggleButton}
            onPress={handleAddPhotos}
            disabled={uploadingPhotos}
          >
            <Text style={styles.addToggleButtonText}>
              {uploadingPhotos ? 'Uploading...' : 'Add Photos'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {images.map((img, index) => (
            <TouchableOpacity
              key={img.id}
              onPress={() => {
                setViewerIndex(index);
                setViewerVisible(true);
              }}
            >
              <Image
                source={{ uri: img.image_url }}
                style={[styles.galleryImage, img.is_cover && styles.coverImage]}
                resizeMode="cover"
              />
              {canEdit && (
                <TouchableOpacity
                  style={styles.deletePhotoButton}
                  onPress={() => handleDeletePhoto(img)}
                >
                  <Ionicons name="trash-outline" size={16} color="#f8fafc" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.galleryPlaceholder}>
          <Text style={styles.emptyText}>No photos yet.</Text>
        </View>
      )}

      <Modal visible={viewerVisible} transparent animationType="fade">
        <View style={styles.viewerBackdrop}>
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerCounter}>
              {viewerIndex + 1} / {images.length}
            </Text>
            <TouchableOpacity onPress={() => setViewerVisible(false)}>
              <Ionicons name="close" size={24} color="#f8fafc" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onViewableItemsChanged={({ viewableItems }) => {
              if (viewableItems?.[0]?.index != null) {
                setViewerIndex(viewableItems[0].index);
              }
            }}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.viewerSlide, { width: screenWidth }]}>
                <Image source={{ uri: item.image_url }} style={styles.viewerImage} resizeMode="contain" />
              </View>
            )}
          />
        </View>
      </Modal>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Vehicle Overview</Text>
          {canEdit && !isEditingVehicle && (
            <TouchableOpacity style={styles.addToggleButton} onPress={handleStartEditVehicle}>
              <Text style={styles.addToggleButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mileage</Text>
          <Text style={styles.infoValue}>
            {vehicle.current_mileage ? `${vehicle.current_mileage.toLocaleString()} mi` : '—'}
          </Text>
        </View>
        {vehicle.oil_change_interval ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Oil Interval</Text>
            <Text style={styles.infoValue}>
              {Number(vehicle.oil_change_interval).toLocaleString()} mi
            </Text>
          </View>
        ) : null}
        {nextOilChangeMileage ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next Oil Change</Text>
            <Text style={styles.infoValue}>
              {nextOilChangeMileage.toLocaleString()} mi
            </Text>
          </View>
        ) : null}
      </View>

      {vehicleStory ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Car Story</Text>
          <Text style={styles.storyText}>{vehicleStory}</Text>
        </View>
      ) : null}

      <Modal visible={canEdit && isEditingVehicle} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderBar}>
              <View>
                <Text style={styles.modalTitle}>Edit Vehicle</Text>
                <Text style={styles.modalSubtitle}>Update your build details</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditingVehicle(false)}>
                <Ionicons name="close" size={20} color="#f8fafc" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.sectionTitle}>Basics</Text>
              <Text style={styles.inputLabel}>Make</Text>
              <TextInput
                style={styles.input}
                placeholder="Make"
                placeholderTextColor="#64748b"
                value={editedMake}
                onChangeText={setEditedMake}
              />
              <Text style={styles.inputLabel}>Model</Text>
              <TextInput
                style={styles.input}
                placeholder="Model"
                placeholderTextColor="#64748b"
                value={editedModel}
                onChangeText={setEditedModel}
              />
              <Text style={styles.inputLabel}>Year</Text>
              <TextInput
                style={styles.input}
                placeholder="Year"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                value={editedYear}
                onChangeText={setEditedYear}
              />
              <Text style={styles.inputLabel}>Trim</Text>
              <TextInput
                style={styles.input}
                placeholder="Trim"
                placeholderTextColor="#64748b"
                value={editedTrim}
                onChangeText={setEditedTrim}
              />
              <Text style={styles.sectionTitle}>Details</Text>
              <Text style={styles.inputLabel}>Engine</Text>
              <TextInput
                style={styles.input}
                placeholder="Engine"
                placeholderTextColor="#64748b"
                value={editedEngine}
                onChangeText={setEditedEngine}
              />
              <Text style={styles.inputLabel}>Transmission</Text>
              <TextInput
                style={styles.input}
                placeholder="Transmission"
                placeholderTextColor="#64748b"
                value={editedTransmission}
                onChangeText={setEditedTransmission}
              />
              <Text style={styles.inputLabel}>Current Mileage</Text>
              <TextInput
                style={styles.input}
                placeholder="Current Mileage"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                value={editedMileage}
                onChangeText={setEditedMileage}
              />
              <Text style={styles.inputLabel}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="Color"
                placeholderTextColor="#64748b"
                value={editedColor}
                onChangeText={setEditedColor}
              />
              <Text style={styles.inputLabel}>License Plate</Text>
              <TextInput
                style={styles.input}
                placeholder="License Plate"
                placeholderTextColor="#64748b"
                value={editedLicensePlate}
                onChangeText={setEditedLicensePlate}
              />
              <Text style={styles.inputLabel}>VIN</Text>
              <TextInput
                style={styles.input}
                placeholder="VIN"
                placeholderTextColor="#64748b"
                value={editedVin}
                onChangeText={setEditedVin}
              />
              <Text style={styles.inputLabel}>Oil Change Interval (mi)</Text>
              <TextInput
                style={styles.input}
                placeholder="Oil Change Interval (mi)"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                value={editedOilChangeInterval}
                onChangeText={setEditedOilChangeInterval}
              />
              <Text style={styles.sectionTitle}>Car Story</Text>
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Car story"
                placeholderTextColor="#64748b"
                value={editedStory}
                onChangeText={setEditedStory}
                multiline
              />
              <View style={styles.editButtonRow}>
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={handleSaveVehicle}
                  disabled={savingVehicle}
                >
                  <Text style={styles.primaryActionText}>
                    {savingVehicle ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={() => setIsEditingVehicle(false)}
                >
                  <Text style={styles.secondaryActionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Maintenance Logs</Text>
          {canEdit && (
            <View style={styles.headerButtonRow}>
              <TouchableOpacity
                style={styles.addToggleButton}
                onPress={() =>
                  setAddLogVisible((prev) => {
                    const next = !prev;
                    if (next) setAddGasVisible(false);
                    return next;
                  })
                }
              >
                <Text style={styles.addToggleButtonText}>
                  {addLogVisible ? 'Cancel' : 'Add Log'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addToggleButton}
                onPress={() =>
                  setAddGasVisible((prev) => {
                    const next = !prev;
                    if (next) setAddLogVisible(false);
                    return next;
                  })
                }
              >
                <Text style={styles.addToggleButtonText}>
                  {addGasVisible ? 'Cancel' : 'Add Gas'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Hide Gas Logs</Text>
          <Switch
            value={hideGasLogs}
            onValueChange={setHideGasLogs}
            trackColor={{ false: '#334155', true: '#f97316' }}
            thumbColor="#f8fafc"
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Spend</Text>
            <Text style={styles.statValue}>${totalCost.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Labor Hours</Text>
            <Text style={styles.statValue}>{totalLaborHours.toFixed(1)}</Text>
          </View>
        </View>

        {canEdit && addLogVisible && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Log title"
              placeholderTextColor="#64748b"
              value={logTitle}
              onChangeText={setLogTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#64748b"
              value={logDescription}
              onChangeText={setLogDescription}
            />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={logCategory}
                onValueChange={(value) => setLogCategory(value)}
                dropdownIconColor="#94a3b8"
                style={styles.picker}
              >
                <Picker.Item label="Select category" value="" />
                {LOG_CATEGORIES.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cost"
              placeholderTextColor="#64748b"
              keyboardType="decimal-pad"
              value={logCost}
              onChangeText={setLogCost}
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#64748b"
              value={logDate}
              onChangeText={setLogDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Mileage"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              value={logMileage}
              onChangeText={setLogMileage}
            />
            <TextInput
              style={styles.input}
              placeholder="Tools used"
              placeholderTextColor="#64748b"
              value={logToolsUsed}
              onChangeText={setLogToolsUsed}
            />
            <TextInput
              style={styles.input}
              placeholder="Labor hours"
              placeholderTextColor="#64748b"
              keyboardType="decimal-pad"
              value={logLaborHours}
              onChangeText={setLogLaborHours}
            />
            <TextInput
              style={styles.input}
              placeholder="Performed by"
              placeholderTextColor="#64748b"
              value={logPerformer}
              onChangeText={setLogPerformer}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes"
              placeholderTextColor="#64748b"
              value={logNotes}
              onChangeText={setLogNotes}
              multiline
            />
            <TouchableOpacity style={styles.button} onPress={handleAddLog} disabled={logLoading}>
              <Text style={styles.buttonText}>{logLoading ? 'Adding...' : 'Add Log'}</Text>
            </TouchableOpacity>
          </>
        )}

        {canEdit && addGasVisible && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Cost"
              placeholderTextColor="#64748b"
              keyboardType="decimal-pad"
              value={logCost}
              onChangeText={setLogCost}
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#64748b"
              value={logDate}
              onChangeText={setLogDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Mileage"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              value={logMileage}
              onChangeText={setLogMileage}
            />
            <TextInput
              style={styles.input}
              placeholder="Gallons"
              placeholderTextColor="#64748b"
              keyboardType="decimal-pad"
              value={logGallons}
              onChangeText={setLogGallons}
            />
            <TouchableOpacity style={styles.button} onPress={handleAddGasLog} disabled={logLoading}>
              <Text style={styles.buttonText}>{logLoading ? 'Adding...' : 'Add Gas Log'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Log History</Text>
        {filteredLogs.length === 0 ? (
          <Text style={styles.emptyText}>No logs yet.</Text>
        ) : (
          visibleLogs.map((log) => (
            <View
              key={log.id}
              style={[
                styles.logItem,
                log.gas ? styles.logItemGas : styles.logItemMaintenance,
              ]}
            >
              {editingLogId === log.id ? (
                <View>
                  {!editingLogIsGas && (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Log title"
                        placeholderTextColor="#64748b"
                        value={editedLogTitle}
                        onChangeText={setEditedLogTitle}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Description"
                        placeholderTextColor="#64748b"
                        value={editedLogDescription}
                        onChangeText={setEditedLogDescription}
                      />
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={editedLogCategory}
                          onValueChange={(value) => setEditedLogCategory(value)}
                          dropdownIconColor="#94a3b8"
                          style={styles.picker}
                        >
                          <Picker.Item label="Select category" value="" />
                          {LOG_CATEGORIES.map((category) => (
                            <Picker.Item key={category} label={category} value={category} />
                          ))}
                        </Picker>
                      </View>
                    </>
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder="Cost"
                    placeholderTextColor="#64748b"
                    keyboardType="decimal-pad"
                    value={editedLogCost}
                    onChangeText={setEditedLogCost}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Date (YYYY-MM-DD)"
                    placeholderTextColor="#64748b"
                    value={editedLogDate}
                    onChangeText={setEditedLogDate}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Mileage"
                    placeholderTextColor="#64748b"
                    keyboardType="number-pad"
                    value={editedLogMileage}
                    onChangeText={setEditedLogMileage}
                  />
                  {editingLogIsGas ? (
                    <TextInput
                      style={styles.input}
                      placeholder="Gallons"
                      placeholderTextColor="#64748b"
                      keyboardType="decimal-pad"
                      value={editedLogGallons}
                      onChangeText={setEditedLogGallons}
                    />
                  ) : (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Tools used"
                        placeholderTextColor="#64748b"
                        value={editedLogToolsUsed}
                        onChangeText={setEditedLogToolsUsed}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Labor hours"
                        placeholderTextColor="#64748b"
                        keyboardType="decimal-pad"
                        value={editedLogLaborHours}
                        onChangeText={setEditedLogLaborHours}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Performed by"
                        placeholderTextColor="#64748b"
                        value={editedLogPerformer}
                        onChangeText={setEditedLogPerformer}
                      />
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Notes"
                        placeholderTextColor="#64748b"
                        value={editedLogNotes}
                        onChangeText={setEditedLogNotes}
                        multiline
                      />
                    </>
                  )}
                  <View style={styles.editButtonRow}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={handleSaveEdit}
                      disabled={logLoading}
                    >
                      <Ionicons name="checkmark" size={18} color="#f8fafc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleCancelEdit}>
                      <Ionicons name="close" size={18} color="#f8fafc" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.logHeaderRow}>
                    <View style={styles.logHeaderText}>
                      <Text style={styles.logTitle}>{log.title}</Text>
                      <View style={styles.logChipRow}>
                        {!log.gas && log.category ? (
                          <View style={[styles.logChip, styles.logChipCategory]}>
                            <Text style={styles.logChipText}>{log.category}</Text>
                          </View>
                        ) : null}
                        {log.gas ? (
                          <View style={[styles.logChip, styles.logChipGas]}>
                            <Text style={styles.logChipText}>Gas</Text>
                          </View>
                        ) : null}
                        {log.date ? (
                          <View style={[styles.logChip, styles.logChipDate]}>
                            <Text style={styles.logChipText}>{log.date}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.logHeaderActions}>
                      <View style={[styles.logChip, styles.logChipCost]}>
                        <Text style={styles.logChipText}>
                          ${Number(log.cost || 0).toFixed(2)}
                        </Text>
                      </View>
                      {canEdit && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleEditLog(log)}
                          >
                            <Ionicons name="create-outline" size={18} color="#f8fafc" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButtonDanger}
                            onPress={() => handleDeleteLog(log.id)}
                          >
                            <Ionicons name="trash-outline" size={18} color="#f8fafc" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.logMetaRow}>
                    {log.mileage ? (
                      <Text style={styles.logMeta}>Mileage • {log.mileage} mi</Text>
                    ) : null}
                    {log.performed_by ? (
                      <Text style={styles.logMeta}>By {log.performed_by}</Text>
                    ) : null}
                    {log.tools_used ? (
                      <Text style={styles.logMeta}>Tools: {log.tools_used}</Text>
                    ) : null}
                    {log.labor_hours ? (
                      <Text style={styles.logMeta}>Labor: {log.labor_hours} hrs</Text>
                    ) : null}
                  </View>
                  {log.description ? (
                    <Text style={styles.logDescription}>{log.description}</Text>
                  ) : null}
                  {log.notes ? <Text style={styles.logNotes}>{log.notes}</Text> : null}
                </>
              )}
            </View>
          ))
        )}
        {filteredLogs.length > visibleLogs.length && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={() => setLogsToShow((prev) => prev + 10)}
          >
            <Text style={styles.loadMoreText}>
              Load more ({filteredLogs.length - visibleLogs.length} remaining)
            </Text>
          </TouchableOpacity>
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
  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleText: {
    flex: 1,
    paddingRight: 12,
  },
  communityButton: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderRadius: 999,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.6)',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgePrimary: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.6)',
  },
  badgeSecondary: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.6)',
  },
  badgeTertiary: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  badgeText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  ownerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 8,
    borderWidth: 0,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  ownerAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  ownerInfo: {
    flexShrink: 1,
    maxWidth: 180,
  },
  ownerName: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 13,
  },
  ownerBio: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  ownerHint: {
    color: '#94a3b8',
    fontSize: 11,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  gallery: {
    marginBottom: 16,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  galleryImage: {
    width: 240,
    height: 170,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 16,
    backgroundColor: 'rgba(248, 113, 113, 0.85)',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.9)',
  },
  coverImage: {
    borderColor: '#f97316',
    borderWidth: 2,
  },
  galleryPlaceholder: {
    height: 170,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  storyText: {
    color: '#e2e8f0',
    lineHeight: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addToggleButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },
  addToggleButtonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  cardRow: {
    color: '#cbd5f5',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 12,
    padding: 12,
    color: '#f8fafc',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 6,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginBottom: 10,
  },
  picker: {
    color: '#f8fafc',
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
    shadowColor: '#f97316',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  buttonText: {
    color: '#0b1120',
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginBottom: 10,
  },
  logItemMaintenance: {
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  logItemGas: {
    borderColor: 'rgba(249, 115, 22, 0.35)',
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logHeaderText: {
    flex: 1,
    paddingRight: 10,
  },
  logHeaderActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  iconButtonDanger: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.45)',
  },
  editButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryActionText: {
    color: '#0b1120',
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 12,
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
  logChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  logChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  logChipText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  logChipCategory: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  logChipGas: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },
  logChipDate: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  logChipCost: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  logMetaRow: {
    marginTop: 10,
    gap: 4,
  },
  logTitle: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  logMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  logDescription: {
    color: '#e2e8f0',
    marginTop: 6,
  },
  logNotes: {
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.95)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#0b1224',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  modalHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#cbd5f5',
    fontSize: 12,
    marginTop: 2,
  },
  viewerHeader: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  viewerCounter: {
    color: '#e2e8f0',
    fontSize: 12,
  },
  viewerSlide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '70%',
  },
  loadMoreButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default VehicleDetailsScreen;
