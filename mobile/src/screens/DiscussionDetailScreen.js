import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const DiscussionDetailScreen = ({ route }) => {
  const { session } = UserAuth();
  const { discussionId } = route.params || {};
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState({});
  const [showReplyInput, setShowReplyInput] = useState(null);

  const fetchDiscussion = async () => {
    setLoading(true);
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(
        `
        id,
        title,
        body,
        created_at,
        vehicle_id,
        user_id,
        profiles:user_id ( username )
      `
      )
      .eq('id', discussionId)
      .single();

    if (postError) {
      console.error('Error fetching discussion:', postError);
      setDiscussion(null);
      setLoading(false);
      return;
    }

    setDiscussion({
      id: post.id,
      author: post.profiles?.username || 'Unknown',
      title: post.title,
      content: post.body,
      timestamp: formatTimeAgo(post.created_at),
    });

    const { data: commentsData, error: commentsErr } = await supabase
      .from('comments')
      .select('id, body, created_at, user_id, post_id, parent_id')
      .eq('post_id', discussionId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (commentsErr) {
      console.error('Error fetching comments:', commentsErr);
      setComments([]);
      setLoading(false);
      return;
    }

    let topComments = commentsData || [];
    if (topComments.length > 0) {
      const userIds = [...new Set(topComments.map((c) => c.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);
        if (profilesData) {
          const usernameMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile.username;
            return acc;
          }, {});
          topComments = topComments.map((comment) => ({
            ...comment,
            profiles: { username: usernameMap[comment.user_id] || 'Unknown' },
          }));
        }
      }
    }

    const commentIds = topComments.map((c) => c.id);
    let repliesMap = {};
    if (commentIds.length > 0) {
      const { data: replies } = await supabase
        .from('comments')
        .select('id, body, created_at, parent_id, user_id, post_id')
        .in('parent_id', commentIds)
        .order('created_at', { ascending: true });

      if (replies && replies.length > 0) {
        const replyUserIds = [...new Set(replies.map((r) => r.user_id).filter(Boolean))];
        let replyUsernameMap = {};
        if (replyUserIds.length > 0) {
          const { data: replyProfiles } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', replyUserIds);
          if (replyProfiles) {
            replyUsernameMap = replyProfiles.reduce((acc, profile) => {
              acc[profile.id] = profile.username;
              return acc;
            }, {});
          }
        }
        repliesMap = replies.reduce((acc, reply) => {
          if (!acc[reply.parent_id]) acc[reply.parent_id] = [];
          acc[reply.parent_id].push({
            id: reply.id,
            author: replyUsernameMap[reply.user_id] || 'Unknown',
            content: reply.body,
            timestamp: formatTimeAgo(reply.created_at),
          });
          return acc;
        }, {});
      }
    }

    const formattedComments = topComments.map((comment) => ({
      id: comment.id,
      author: comment.profiles?.username || 'Unknown',
      content: comment.body,
      timestamp: formatTimeAgo(comment.created_at),
      replies: repliesMap[comment.id] || [],
    }));

    setComments(formattedComments);
    setLoading(false);
  };

  useEffect(() => {
    if (!discussionId) return;
    fetchDiscussion();
  }, [discussionId, session?.user?.id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!session?.user?.id) return;

    const { error } = await supabase.from('comments').insert({
      user_id: session.user.id,
      post_id: discussionId,
      parent_id: null,
      body: newComment,
    });

    if (error) {
      console.error('Error creating comment:', error);
    } else {
      setNewComment('');
      fetchDiscussion();
    }
  };

  const handleSubmitReply = async (commentId) => {
    const replyText = newReply[commentId];
    if (!replyText?.trim()) return;
    if (!session?.user?.id) return;

    const { error } = await supabase.from('comments').insert({
      user_id: session.user.id,
      post_id: discussionId,
      parent_id: commentId,
      body: replyText,
    });

    if (error) {
      console.error('Error creating reply:', error);
    } else {
      setNewReply((prev) => ({ ...prev, [commentId]: '' }));
      setShowReplyInput(null);
      fetchDiscussion();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#f97316" />
      </View>
    );
  }

  if (!discussion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Discussion not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{discussion.title}</Text>
        <Text style={styles.meta}>
          {discussion.author} • {discussion.timestamp}
        </Text>
        <Text style={styles.body}>{discussion.content}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comments</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Share your thoughts..."
          placeholderTextColor="#64748b"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmitComment}>
          <Text style={styles.buttonText}>Post Comment</Text>
        </TouchableOpacity>
      </View>

      {comments.length === 0 ? (
        <Text style={styles.emptyText}>No comments yet.</Text>
      ) : (
        comments.map((comment) => (
          <View key={comment.id} style={styles.commentCard}>
            <Text style={styles.commentAuthor}>
              {comment.author} • {comment.timestamp}
            </Text>
            <Text style={styles.commentBody}>{comment.content}</Text>
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() =>
                setShowReplyInput(showReplyInput === comment.id ? null : comment.id)
              }
            >
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#38bdf8" />
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
            {showReplyInput === comment.id && (
              <View style={styles.replyForm}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Write a reply..."
                  placeholderTextColor="#64748b"
                  value={newReply[comment.id] || ''}
                  onChangeText={(value) =>
                    setNewReply((prev) => ({ ...prev, [comment.id]: value }))
                  }
                  multiline
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleSubmitReply(comment.id)}
                >
                  <Text style={styles.buttonText}>Reply</Text>
                </TouchableOpacity>
              </View>
            )}
            {comment.replies.length > 0 && (
              <View style={styles.replyList}>
                {comment.replies.map((reply) => (
                  <View key={reply.id} style={styles.replyCard}>
                    <Text style={styles.commentAuthor}>
                      {reply.author} • {reply.timestamp}
                    </Text>
                    <Text style={styles.commentBody}>{reply.content}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      )}
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
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    color: '#94a3b8',
    marginBottom: 12,
  },
  body: {
    color: '#e2e8f0',
    lineHeight: 20,
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
  commentCard: {
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginBottom: 10,
  },
  commentAuthor: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  commentBody: {
    color: '#e2e8f0',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  replyButtonText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  replyForm: {
    marginTop: 10,
  },
  replyList: {
    marginTop: 10,
    gap: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(148, 163, 184, 0.2)',
    paddingLeft: 10,
  },
  replyCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default DiscussionDetailScreen;
