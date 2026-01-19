import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

const ConversationsScreen = ({ navigation }) => {
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
      .limit(50);

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
            .select('id, make, model, asking_price, trim')
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {loading ? (
        <ActivityIndicator color="#22c55e" />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No conversations yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('Chat', {
                  conversationId: item.id,
                  vehicleId: item.vehicle_id,
                  buyerId: item.buyer_id,
                  sellerId: item.seller_id,
                  backTitle: 'Marketplace',
                })
              }
            >
              <View style={styles.avatar}>
                {item.otherProfile?.avatar_url ? (
                  <Image source={{ uri: item.otherProfile.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={18} color="#94a3b8" />
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>
                  @{item.otherProfile?.username || 'user'}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {item.vehicle
                    ? `${item.vehicle.make} ${item.vehicle.model} `
                    : 'Listing'}
                  {item.vehicle.trim && `- ${item.vehicle.trim}`}
                </Text>
                {item.last_message ? (
                  <Text style={styles.cardMessage} numberOfLines={1}>
                    {item.last_message}
                  </Text>
                ) : (
                  <Text style={styles.cardMessageMuted}>No messages yet.</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
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
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginBottom: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0b1120',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 13,
  },
  cardSubtitle: {
    color: '#86efac',
    fontSize: 12,
    marginTop: 2,
  },
  cardMessage: {
    color: '#e2e8f0',
    fontSize: 12,
    marginTop: 4,
  },
  cardMessageMuted: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
});

export default ConversationsScreen;
