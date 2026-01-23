import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { PencilIcon, CameraIcon, ArrowRightIcon, BookmarkIcon, UserGroupIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import notFound from '../assets/notfound.jpg';
import { getLevelFromXp, getLevelStartXp, getNextLevelXp } from '../utils/xp';

const Profile = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [ suggestions, setSuggestions ] = useState("");
  console.log(suggestions);

  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    bio: '',
    xp_score: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  
  // Saved vehicles
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [savedVehiclesLoading, setSavedVehiclesLoading] = useState(true);
  const [coverImages, setCoverImages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 1 row of 3

  // Followers and Following
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!session) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error(error);
      } else if (data) {
        setProfile({ ...data, xp_score: Number(data.xp_score) || 0 });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  // Fetch saved vehicles
  useEffect(() => {
    if (!session?.user?.id) {
      setSavedVehiclesLoading(false);
      return;
    }

    const fetchSavedVehicles = async () => {
      try {
        // Fetch saved vehicles with car details
        const { data: savedData, error: savedError } = await supabase
          .from('saved_vehicles')
          .select(`
            car_id,
            cars (*)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (savedError) {
          console.error('Error fetching saved vehicles:', savedError);
          setSavedVehicles([]);
        } else {
          // Extract car data from the join
          const vehicles = (savedData || [])
            .map(item => item.cars)
            .filter(car => car !== null); // Filter out any null cars
          
          setSavedVehicles(vehicles);

          // Fetch cover images for each vehicle
          const imagePromises = vehicles.map(async (car) => {
            if (!car.id) return;
            
            const { data: imageData, error: imageError } = await supabase
              .from('car_images')
              .select('image_url')
              .eq('car_id', car.id)
              .eq('is_cover', true)
              .limit(1)
              .single();

            if (!imageError && imageData) {
              setCoverImages(prev => ({ ...prev, [car.id]: imageData.image_url }));
            } else {
              // Try to get any image if no cover image
              const { data: anyImage } = await supabase
                .from('car_images')
                .select('image_url')
                .eq('car_id', car.id)
                .limit(1)
                .single();

              if (anyImage) {
                setCoverImages(prev => ({ ...prev, [car.id]: anyImage.image_url }));
              }
            }
          });

          await Promise.all(imagePromises);
        }
      } catch (err) {
        console.error('Error in fetchSavedVehicles:', err);
        setSavedVehicles([]);
      } finally {
        setSavedVehiclesLoading(false);
      }
    };

    fetchSavedVehicles();
  }, [session]);

  // Fetch followers and following
  useEffect(() => {
    if (!session?.user?.id) {
      setFollowersLoading(false);
      setFollowingLoading(false);
      return;
    }

    const fetchFollowers = async () => {
      try {
        // Get users who follow the current user (where following_id = current user)
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

        // Fetch profile data for each follower
        const followerIds = data.map(item => item.follower_id);
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
      } catch (err) {
        console.error('Error in fetchFollowers:', err);
        setFollowers([]);
      } finally {
        setFollowersLoading(false);
      }
    };

    const fetchFollowing = async () => {
      try {
        // Get users that the current user follows (where follower_id = current user)
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

        // Fetch profile data for each user being followed
        const followingIds = data.map(item => item.following_id);
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
      } catch (err) {
        console.error('Error in fetchFollowing:', err);
        setFollowing([]);
      } finally {
        setFollowingLoading(false);
      }
    };

    fetchFollowers();
    fetchFollowing();
  }, [session]);

  const saveProfile = async (e) => {
    e.preventDefault();

    const updates = {
      id: session.user.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      updated_at: new Date()
    };

    const {error} = await supabase
      .from('profiles')
      .upsert(updates);
    
    if (error) {
      console.error("Error updating profile: ", error);
      alert("Failed to save profile")
    } else {
      alert("Profile updated!");
    }
  };


  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    alert('Thank you for your feedback!');
    const newFeedback = {
      suggestion: suggestions,
    }
    const { data, error } = await supabase.from('suggestions').insert([newFeedback]).single();
    if (error) {
      console.error("Error submitting feedback:", error);
    } else {
      console.log("Feedback submitted successfully:", data);
    }
    setSuggestions('');
  }

  const uploadImage = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploading(true);

    try {
      const resizedFile = await resizeFile(selectedFile);
      const path = `${session.user.id}/${uuidv4()}`;

      const { data, error: uploadError } = await supabase.storage
        .from("avatar-photos")
        .upload(path, resizedFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Failed to upload image. Please try again.");
        return;
      }

      const publicUrl = supabase.storage
        .from("avatar-photos")
        .getPublicUrl(data.path).data.publicUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        alert("Failed to update profile. Please try again.");
        return;
      }

      // Update local state with new avatar URL
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      // Also refetch profile to ensure everything is in sync
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (updatedProfile) {
        setProfile(updatedProfile);
      }

    } catch (err) {
      console.error("Upload failed:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };


  const resizeFile = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let { width, height } = img;
          const canvas = document.createElement('canvas');

          if (width > height && width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          } else if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
            'image/jpeg',
            quality
          );
        };
      };
    });

  if (!session) return null;

  const xpScore = Number(profile.xp_score) || 0;
  const level = getLevelFromXp(xpScore);
  const levelStartXp = getLevelStartXp(level);
  const nextLevelXp = getNextLevelXp(level);
  const xpToNext = Math.max(0, nextLevelXp - xpScore);
  const levelProgress = Math.min(
    1,
    (xpScore - levelStartXp) / Math.max(1, nextLevelXp - levelStartXp)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white -mt-0">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-6 md:py-12">
        {/* Hero Header */}
        <div
          className={`mb-8 transform transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-gray-400 text-lg">Manage your account and preferences</p>
        </div>

        {/* Profile Header */}
        <div
          className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-6 transform transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={uploadImage}
            className="hidden"
          />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Avatar - Clickable */}
            <div 
              className="w-32 h-32 flex-shrink-0 rounded-full bg-gray-700 overflow-hidden cursor-pointer relative group z-10 border-4 border-gray-700 hover:border-red-500 transition-all"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile photo"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {/* Overlay on hover only */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <CameraIcon className="w-8 h-8 text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mb-2"></div>
                    <div className="text-white text-sm">Uploading...</div>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    @{profile.username || 'username'}
                  </h1>
                  <p className="text-gray-400">
                    {session.user.email}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-red-500/50 flex items-center gap-2"
                >
                  <PencilIcon className="w-5 h-5" />
                  Edit Profile
                </button>
              </div>

              {profile.bio ? (
                <p className="text-gray-300 text-base max-w-md mx-auto sm:mx-0 bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-gray-500 text-sm italic">No bio yet. Add one in your profile settings!</p>
              )}

              <div className="mt-4 max-w-md mx-auto sm:mx-0 w-full">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="font-semibold text-orange-300">Level {level}</span>
                  <span>{xpScore.toLocaleString()} XP</span>
                  <span>{xpToNext.toLocaleString()} to next</span>
                </div>
                <div className="h-2 rounded-full bg-gray-700/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    style={{ width: `${Math.round(levelProgress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        {isEditing && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveProfile(e);
                setIsEditing(false);
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Profile Photo</label>
                <input
                  type="file"
                  onChange={uploadImage}
                  className="block w-full text-sm text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:bg-gray-700 file:text-white
                    hover:file:bg-gray-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  rows="4"
                  value={profile.bio || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-red-500/50"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Followers and Following Buttons */}
        <div
          className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6 transform transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Followers Button */}
            <button
              onClick={() => setShowFollowersModal(true)}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-900/50 hover:bg-gray-900/70 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all group"
            >
              <UserGroupIcon className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <div className="text-sm text-gray-400">Followers</div>
                {followersLoading ? (
                  <div className="text-lg font-bold text-white">...</div>
                ) : (
                  <div className="text-lg font-bold text-white">{followers.length}</div>
                )}
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all ml-auto" />
            </button>

            {/* Following Button */}
            <button
              onClick={() => setShowFollowingModal(true)}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-900/50 hover:bg-gray-900/70 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all group"
            >
              <UserPlusIcon className="w-6 h-6 text-green-400" />
              <div className="text-left">
                <div className="text-sm text-gray-400">Following</div>
                {followingLoading ? (
                  <div className="text-lg font-bold text-white">...</div>
                ) : (
                  <div className="text-lg font-bold text-white">{following.length}</div>
                )}
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all ml-auto" />
            </button>
          </div>
        </div>

        {/* Followers Modal */}
        {showFollowersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowFollowersModal(false)}>
            <div className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Followers</h2>
                  {!followersLoading && (
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {followers.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowFollowersModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {followersLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No followers yet</p>
                    <p className="text-gray-500 text-sm">Share your profile to get more followers!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followers.map((user) => (
                      <Link
                        key={user.id}
                        to={`/user/${user.id}`}
                        onClick={() => setShowFollowersModal(false)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-all border border-gray-700/50 hover:border-blue-500/50 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                            @{user.username || 'user'}
                          </p>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Following Modal */}
        {showFollowingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowFollowingModal(false)}>
            <div className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <UserPlusIcon className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Following</h2>
                  {!followingLoading && (
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {following.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowFollowingModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {followingLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                  </div>
                ) : following.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlusIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">Not following anyone yet</p>
                    <p className="text-gray-500 text-sm">Start exploring and follow other users!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {following.map((user) => (
                      <Link
                        key={user.id}
                        to={`/user/${user.id}`}
                        onClick={() => setShowFollowingModal(false)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-all border border-gray-700/50 hover:border-green-500/50 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate group-hover:text-green-400 transition-colors">
                            @{user.username || 'user'}
                          </p>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Saved Vehicles */}
        <div
          className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-6 transform transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <BookmarkIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Saved Vehicles</h2>
            {savedVehicles.length > 0 && (
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                {savedVehicles.length}
              </span>
            )}
          </div>

          {savedVehiclesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : savedVehicles.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No saved vehicles yet</p>
              <p className="text-gray-500 text-sm">Start exploring and save your favorite builds!</p>
              <Link
                to="/explore"
                className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 !text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-blue-500/50 flex items-center gap-2"
              >
                Explore Builds
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedVehicles
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((car, index) => (
                <Link
                  key={car.id}
                  to={`/vehicle/${car.id}`}
                  className={`transform transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col h-full">
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

                      {/* Saved Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          SAVED
                        </span>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-5 bg-gradient-to-b from-gray-800/50 to-gray-900/50 flex flex-col flex-grow">
                      <h2 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
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
              ))}
              </div>

              {/* Pagination */}
              {savedVehicles.length > itemsPerPage && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.ceil(savedVehicles.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(savedVehicles.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(savedVehicles.length / itemsPerPage)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Feedback */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Feedback</h2>
          <p className="text-gray-400 mb-6">We'd love to hear your suggestions and feedback!</p>

          <form onSubmit={submitFeedback} className="space-y-4">
            <textarea
              rows="4"
              placeholder="Share your thoughts, suggestions, or report any issues..."
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              className="w-full p-4 border border-gray-700 rounded-lg resize-none bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
            />

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-blue-500/50 flex items-center gap-2"
            >
              Submit Feedback
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="space-y-3 mt-20 relative">
          <button
            onClick={handleSignOut}
            className="absolute bottom-0 right-0 text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition border border-red-500/30 hover:border-red-500/50 font-semibold"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );



};

export default Profile;
