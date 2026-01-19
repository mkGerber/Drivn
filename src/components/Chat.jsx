import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { ChatBubbleLeftIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import supabase from '../supabaseClient';
import Navbar from './Navbar';
import { UserAuth } from '../context/AuthContext';

const Chat = () => {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();
  const { session } = UserAuth();
  const [searchParams] = useSearchParams();
  const routeConversationId = searchParams.get('conversation') || null;
  const routeBuyerId = searchParams.get('buyer') || null;
  const routeSellerId = searchParams.get('seller') || null;

  const [vehicle, setVehicle] = useState(null);
  const [conversationId, setConversationId] = useState(routeConversationId);
  const [conversationBuyerId, setConversationBuyerId] = useState(routeBuyerId);
  const [conversationSellerId, setConversationSellerId] = useState(routeSellerId);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const subscriptionRef = useRef(null);
  const pollRef = useRef(null);

  const currentUserId = session?.user?.id || null;
  const sellerId = vehicle?.user_id || conversationSellerId || null;
  const buyerId = conversationBuyerId || currentUserId || null;
  const isParticipant =
    currentUserId && (currentUserId === conversationBuyerId || currentUserId === sellerId);
  const canStartChat = currentUserId && sellerId && currentUserId !== sellerId;
  const canChat = !!currentUserId && (isParticipant || canStartChat);

  const priceLabel = useMemo(() => {
    if (!vehicle?.asking_price) return null;
    return `$${Number(vehicle.asking_price || 0).toLocaleString()}`;
  }, [vehicle]);

  const fetchVehicle = async () => {
    if (!vehicleId) return;
    const { data, error } = await supabase
      .from('cars')
      .select('id, make, model, asking_price, user_id')
      .eq('id', vehicleId)
      .single();

    if (error) {
      console.error('Error fetching vehicle:', error);
      setVehicle(null);
    } else {
      setVehicle(data);
    }
  };

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

  const handleSend = async (e) => {
    e.preventDefault();
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
    fetchVehicle();
  }, [vehicleId]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!session || !vehicleId) {
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

      const convId = await fetchOrCreateConversation({
        buyerId: currentUserId,
        sellerId,
        vehicleId,
      });
      if (!mounted) return;
      setConversationId(convId);
      setConversationBuyerId(currentUserId);
      setConversationSellerId(sellerId);
      await fetchMessages(convId);
      await markMessagesRead(convId);
      subscribeToMessages(convId);
      startPolling(convId);
      setLoading(false);
    };

    if (vehicle && session) {
      init();
    }

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [vehicle, session, routeConversationId]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to chat</h1>
          <p className="text-gray-400 mb-8">Chat is available for marketplace listings.</p>
          <Link to="/signin">
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/40">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-gray-400">Loading chat...</div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-gray-400">Listing not found.</div>
        </div>
      </div>
    );
  }

  if (!canChat) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Chat unavailable</h1>
          <p className="text-gray-400 mb-8">This listing is not available for chat.</p>
          <button
            onClick={() => navigate(`/vehicle/${vehicleId}`)}
            className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold"
          >
            Back to Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(`/vehicle/${vehicleId}`)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Listing
        </button>

        <div className="mt-6 bg-gray-800/70 border border-green-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                {vehicle.make} {vehicle.model}
              </h1>
              {priceLabel && <p className="text-green-400 font-semibold mt-1">{priceLabel}</p>}
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 text-green-300 text-xs font-semibold px-3 py-2 rounded-full border border-green-500/40">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              Marketplace Chat
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-900/60 border border-gray-700/50 rounded-2xl p-6 min-h-[420px] flex flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 pt-12">Start the conversation.</div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                      isMine
                        ? 'ml-auto bg-green-500 text-gray-900 font-semibold'
                        : 'mr-auto bg-gray-800 text-gray-100 border border-gray-700/70'
                    }`}
                  >
                    {msg.content}
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSend} className="mt-4 flex gap-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
