import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

const Messages = () => {
  const { session } = UserAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);

  const fetchConversations = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('id, vehicle_id, buyer_id, seller_id, last_message, last_message_at, created_at')
      .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
      .order('last_message_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      setLoading(false);
      return;
    }

    const convs = data || [];
    const vehicleIds = convs.map((c) => c.vehicle_id).filter(Boolean);
    const otherUserIds = convs
      .map((c) => (c.buyer_id === session.user.id ? c.seller_id : c.buyer_id))
      .filter(Boolean);

    const [vehiclesResult, profilesResult] = await Promise.all([
      vehicleIds.length
        ? supabase
            .from('cars')
            .select('id, make, model')
            .in('id', vehicleIds)
        : Promise.resolve({ data: [] }),
      otherUserIds.length
        ? supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', otherUserIds)
        : Promise.resolve({ data: [] }),
    ]);

    const vehiclesMap = {};
    (vehiclesResult.data || []).forEach((car) => {
      vehiclesMap[car.id] = car;
    });
    const profilesMap = {};
    (profilesResult.data || []).forEach((profile) => {
      profilesMap[profile.id] = profile;
    });

    const enriched = convs.map((conv) => {
      const otherUserId = conv.buyer_id === session.user.id ? conv.seller_id : conv.buyer_id;
      return {
        ...conv,
        vehicle: vehiclesMap[conv.vehicle_id],
        otherProfile: profilesMap[otherUserId],
      };
    });

    setConversations(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, [session?.user?.id]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to view messages</h1>
          <p className="text-gray-400 mb-8">Marketplace chat is only for signed-in users.</p>
          <Link to="/signin">
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/40">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <Link
            to="/marketplace"
            className="text-sm text-green-300 hover:text-green-200 transition"
          >
            Back to Marketplace
          </Link>
        </div>

        <div className="bg-gray-800/60 border border-green-500/30 rounded-2xl p-6">
          {loading ? (
            <p className="text-gray-400">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="text-gray-400">No conversations yet.</p>
          ) : (
            <div className="space-y-4">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.vehicle_id}?conversation=${conv.id}&buyer=${conv.buyer_id}&seller=${conv.seller_id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/60 border border-gray-700/60 hover:border-green-500/50 transition"
                >
                  <div className="w-11 h-11 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                    {conv.otherProfile?.avatar_url ? (
                      <img
                        src={conv.otherProfile.avatar_url}
                        alt={conv.otherProfile?.username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">@</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">
                      @{conv.otherProfile?.username || 'user'}
                    </p>
                    <p className="text-xs text-green-300">
                      {conv.vehicle ? `${conv.vehicle.make} ${conv.vehicle.model}` : 'Listing'}
                    </p>
                    <p className="text-sm text-gray-300 truncate">
                      {conv.last_message || 'No messages yet.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
