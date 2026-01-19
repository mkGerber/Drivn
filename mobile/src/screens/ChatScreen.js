import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

const ChatScreen = ({ route }) => {
  const { session } = UserAuth();
  const currentUserId = session?.user?.id || null;
  const {
    conversationId: routeConversationId,
    vehicleId,
    sellerId,
    vehicleName = 'Listing',
    vehiclePrice = null,
    buyerId: routeBuyerId,
  } = route.params || {};

  const [conversationId, setConversationId] = useState(routeConversationId || null);
  const [conversationBuyerId, setConversationBuyerId] = useState(routeBuyerId || null);
  const [conversationSellerId, setConversationSellerId] = useState(sellerId || null);
  const [resolvedVehicleId, setResolvedVehicleId] = useState(vehicleId || null);
  const [vehicleInfo, setVehicleInfo] = useState({
    name: vehicleName,
    price: vehiclePrice,
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const subscriptionRef = useRef(null);
  const pollRef = useRef(null);

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const isParticipant =
    currentUserId &&
    (currentUserId === conversationBuyerId || currentUserId === conversationSellerId);
  const canStartChat =
    currentUserId && conversationSellerId && resolvedVehicleId && currentUserId !== conversationSellerId;
  const canChat = !!currentUserId && (isParticipant || canStartChat);

  const priceLabel = useMemo(() => {
    if (vehicleInfo?.price == null) return null;
    const numeric = Number(vehicleInfo.price || 0);
    return `$${numeric.toLocaleString()}`;
  }, [vehicleInfo]);

  const fetchConversationById = async (convId) => {
    if (!convId) return null;
    const { data, error } = await supabase
      .from('conversations')
      .select('id, vehicle_id, buyer_id, seller_id')
      .eq('id', convId)
      .single();
    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
    return data;
  };

  const fetchVehicleInfo = async (targetVehicleId) => {
    if (!targetVehicleId) return;
    const { data, error } = await supabase
      .from('cars')
      .select('make, model, asking_price')
      .eq('id', targetVehicleId)
      .single();
    if (error) {
      console.error('Error fetching vehicle info:', error);
      return;
    }
    setVehicleInfo({
      name: `${data.make} ${data.model}`,
      price: data.asking_price,
    });
  };

  const fetchOrCreateConversation = async ({ buyerId, sellerId, vehicleId }) => {
    if (!buyerId || !sellerId || !vehicleId) return null;

    const { data: existing, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    if (existing?.id) return existing.id;

    const { data: created, error: createError } = await supabase
      .from('conversations')
      .insert([
        {
          vehicle_id: vehicleId,
          buyer_id: buyerId,
          seller_id: sellerId,
          last_message: null,
          last_message_at: null,
        },
      ])
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return null;
    }

    return created?.id || null;
  };

  const fetchMessages = async (convId) => {
    if (!convId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at, read')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } else {
      setMessages(data || []);
    }
  };

  const markMessagesRead = async (convId) => {
    if (!convId || !currentUserId) return;
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', convId)
      .neq('sender_id', currentUserId)
      .eq('read', false);
  };

  const subscribeToMessages = (convId) => {
    if (!convId) return;
    const channel = supabase
      .channel(`messages:${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;
  };

  const startPolling = (convId) => {
    if (!convId) return;
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }
    pollRef.current = setInterval(() => {
      fetchMessages(convId);
      markMessagesRead(convId);
    }, 4000);
  };

  const handleSend = async () => {
    if (!draft.trim() || !currentUserId || !conversationId) return;
    setSending(true);
    const messageText = draft.trim();
    setDraft('');

    const { error } = await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: messageText,
        read: false,
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
      setDraft(messageText);
      setSending(false);
      return;
    }

    await supabase
      .from('conversations')
      .update({ last_message: messageText, last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    setSending(false);
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      if (routeConversationId) {
        const conversation = await fetchConversationById(routeConversationId);
        if (!mounted) return;
        if (conversation) {
          setConversationId(conversation.id);
          setConversationBuyerId(conversation.buyer_id);
          setConversationSellerId(conversation.seller_id);
          setResolvedVehicleId(conversation.vehicle_id);
          await fetchVehicleInfo(conversation.vehicle_id);
          await fetchMessages(conversation.id);
          await markMessagesRead(conversation.id);
          subscribeToMessages(conversation.id);
          startPolling(conversation.id);
        }
        setLoading(false);
        return;
      }

      if (!canStartChat) {
        setLoading(false);
        return;
      }

      const buyer = routeBuyerId || currentUserId;
      const seller = conversationSellerId;
      const convId = await fetchOrCreateConversation({
        buyerId: buyer,
        sellerId: seller,
        vehicleId: resolvedVehicleId,
      });
      if (!mounted) return;
      setConversationId(convId);
      setConversationBuyerId(buyer);
      setConversationSellerId(seller);
      if (resolvedVehicleId) {
        await fetchVehicleInfo(resolvedVehicleId);
      }
      await fetchMessages(convId);
      await markMessagesRead(convId);
      subscribeToMessages(convId);
      startPolling(convId);
      setLoading(false);
    };

    init();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [currentUserId, routeConversationId, resolvedVehicleId, conversationSellerId, routeBuyerId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#22c55e" />
      </View>
    );
  }

  if (!canChat) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Chat is not available for this listing.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerTitle}>{vehicleInfo?.name || 'Listing'}</Text>
          {priceLabel ? <Text style={styles.headerPrice}>{priceLabel}</Text> : null}
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#22c55e" />
          <Text style={styles.headerBadgeText}>Marketplace Chat</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item, index }) => {
          const isMine = item.sender_id === currentUserId;
          const nextMessage = messages[index + 1];
          const isLastInGroup = !nextMessage || nextMessage.sender_id !== item.sender_id;
          const timeLabel = isLastInGroup ? formatMessageTime(item.created_at) : '';
          return (
            <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowTheirs]}>
              <View style={[styles.messageBubble, isMine ? styles.messageMine : styles.messageTheirs]}>
                <Text style={isMine ? styles.messageTextDark : styles.messageTextLight}>
                  {item.content}
                </Text>
              </View>
              {timeLabel ? <Text style={styles.messageTimestamp}>{timeLabel}</Text> : null}
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#64748b"
          value={draft}
          onChangeText={setDraft}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sending || !draft.trim()}
        >
          <Ionicons name="send" size={18} color="#0b1120" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0b1120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94a3b8',
  },
  headerCard: {
    margin: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  headerPrice: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
  headerBadgeText: {
    color: '#86efac',
    fontSize: 11,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  messageRow: {
    maxWidth: '80%',
    gap: 4,
  },
  messageRowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageRowTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  messageMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#22c55e',
  },
  messageTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  messageTextDark: {
    color: '#0b1120',
    fontWeight: '600',
  },
  messageTextLight: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  messageTimestamp: {
    fontSize: 11,
    color: 'rgba(148, 163, 184, 0.7)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    backgroundColor: '#0f172a',
  },
  input: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0b1120',
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  sendButton: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    padding: 12,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});

export default ChatScreen;
