import React, { useEffect, useMemo, useState } from 'react';
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

const VehicleCommunityScreen = ({ route, navigation }) => {
  const { session } = UserAuth();
  const { carId, vehicleName } = route.params || {};

  const [activeTab, setActiveTab] = useState('discussions');
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [discussions, setDiscussions] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [showNewPost, setShowNewPost] = useState(false);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswers, setNewAnswers] = useState({});
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const canPost = !!session?.user?.id;

  const fetchDiscussions = async () => {
    setLoadingDiscussions(true);
    const { data: posts, error } = await supabase
      .from('posts')
      .select(
        `
        id,
        title,
        body,
        comment_count,
        created_at,
        user_id,
        profiles:user_id ( username )
      `
      )
      .eq('vehicle_id', carId)
      .eq('post_type', 'discussion')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
    } else {
      const formatted = (posts || []).map((post) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        comments: post.comment_count || 0,
        author: post.profiles?.username || 'Unknown',
        timestamp: formatTimeAgo(post.created_at),
      }));
      setDiscussions(formatted);
    }
    setLoadingDiscussions(false);
  };

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    const { data: posts, error } = await supabase
      .from('posts')
      .select(
        `
        id,
        title,
        body,
        comment_count,
        is_solved,
        created_at,
        user_id,
        profiles:user_id ( username )
      `
      )
      .eq('vehicle_id', carId)
      .eq('post_type', 'question')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      setLoadingQuestions(false);
      return;
    }

    const questionIds = posts?.map((p) => p.id) || [];
    let allAnswers = {};

    if (questionIds.length > 0) {
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, body, is_answer, is_accepted, created_at, post_id, user_id')
        .in('post_id', questionIds)
        .eq('is_answer', true)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching answers:', commentsError);
      } else if (comments && comments.length > 0) {
        const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))];
        let usernameMap = {};
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds);
          if (profilesData) {
            usernameMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = profile.username;
              return acc;
            }, {});
          }
        }

        allAnswers = comments.reduce((acc, comment) => {
          if (!acc[comment.post_id]) acc[comment.post_id] = [];
          acc[comment.post_id].push({
            id: comment.id,
            author: usernameMap[comment.user_id] || 'Unknown',
            content: comment.body,
            timestamp: formatTimeAgo(comment.created_at),
            isAccepted: comment.is_accepted || false,
          });
          return acc;
        }, {});
      }
    }

    const formatted = (posts || []).map((post) => {
      const answers = allAnswers[post.id] || [];
      return {
        id: post.id,
        user_id: post.user_id,
        author: post.profiles?.username || 'Unknown',
        question: post.title || post.body,
        timestamp: formatTimeAgo(post.created_at),
        isAnswered: answers.length > 0 || post.is_solved,
        answers,
      };
    });
    setQuestions(formatted);
    setLoadingQuestions(false);
  };

  useEffect(() => {
    if (!carId) return;
    fetchDiscussions();
    fetchQuestions();
  }, [carId, session?.user?.id]);

  const handleSubmitPost = async () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) return;
    if (!session?.user?.id) return;
    const { error } = await supabase.from('posts').insert({
      user_id: session.user.id,
      title: newPostTitle,
      body: newPostBody,
      post_type: 'discussion',
      vehicle_id: carId,
      comment_count: 0,
    });
    if (error) {
      console.error('Error creating post:', error);
    } else {
      setNewPostTitle('');
      setNewPostBody('');
      setShowNewPost(false);
      fetchDiscussions();
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    if (!session?.user?.id) return;
    const { error } = await supabase.from('posts').insert({
      user_id: session.user.id,
      title: newQuestion,
      body: newQuestion,
      post_type: 'question',
      vehicle_id: carId,
      comment_count: 0,
      is_solved: false,
    });
    if (error) {
      console.error('Error creating question:', error);
    } else {
      setNewQuestion('');
      setShowNewQuestion(false);
      fetchQuestions();
    }
  };

  const handleSubmitAnswer = async (questionId) => {
    const answerText = newAnswers[questionId];
    if (!answerText?.trim()) return;
    if (!session?.user?.id) return;
    const { error } = await supabase.from('comments').insert({
      user_id: session.user.id,
      post_id: questionId,
      parent_id: null,
      body: answerText,
      is_answer: true,
      is_accepted: false,
    });
    if (error) {
      console.error('Error creating answer:', error);
    } else {
      const { data: post } = await supabase
        .from('posts')
        .select('comment_count')
        .eq('id', questionId)
        .single();
      if (post) {
        await supabase
          .from('posts')
          .update({ comment_count: (post.comment_count || 0) + 1 })
          .eq('id', questionId);
      }
      setNewAnswers((prev) => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
    }
  };

  const handleAcceptAnswer = async (questionId, answerId) => {
    if (!session?.user?.id) return;
    const { data: question } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', questionId)
      .single();
    if (!question || question.user_id !== session.user.id) return;

    await supabase
      .from('comments')
      .update({ is_accepted: false })
      .eq('post_id', questionId)
      .eq('is_answer', true);

    const { error } = await supabase
      .from('comments')
      .update({ is_accepted: true })
      .eq('id', answerId);

    if (!error) {
      await supabase.from('posts').update({ is_solved: true }).eq('id', questionId);
      fetchQuestions();
    }
  };

  const headerTitle = useMemo(
    () => (vehicleName ? `${vehicleName} • Community` : 'Community'),
    [vehicleName]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{headerTitle}</Text>
      </View>

      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'discussions' && styles.segmentActive]}
          onPress={() => setActiveTab('discussions')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'discussions' && styles.segmentTextActive,
            ]}
          >
            Discussions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'questions' && styles.segmentActive]}
          onPress={() => setActiveTab('questions')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'questions' && styles.segmentTextActive,
            ]}
          >
            Q&A
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'discussions' ? (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Discussions</Text>
            {canPost && (
              <TouchableOpacity
                style={styles.addToggleButton}
                onPress={() => setShowNewPost((prev) => !prev)}
              >
                <Text style={styles.addToggleButtonText}>
                  {showNewPost ? 'Cancel' : 'New Post'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showNewPost && (
            <View style={styles.formCard}>
              <TextInput
                style={styles.input}
                placeholder="Post title"
                placeholderTextColor="#64748b"
                value={newPostTitle}
                onChangeText={setNewPostTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What’s on your mind?"
                placeholderTextColor="#64748b"
                value={newPostBody}
                onChangeText={setNewPostBody}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmitPost}>
                <Text style={styles.buttonText}>Post</Text>
              </TouchableOpacity>
            </View>
          )}

          {loadingDiscussions ? (
            <ActivityIndicator color="#f97316" />
          ) : discussions.length === 0 ? (
            <Text style={styles.emptyText}>No discussions yet.</Text>
          ) : (
            discussions.map((disc) => (
              <TouchableOpacity
                key={disc.id}
                style={styles.listItem}
                onPress={() => navigation.navigate('DiscussionDetail', { discussionId: disc.id })}
              >
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>{disc.title}</Text>
                  <View style={styles.listMetaRow}>
                    <Ionicons name="chatbubbles-outline" size={14} color="#94a3b8" />
                    <Text style={styles.listMeta}>{disc.comments}</Text>
                  </View>
                </View>
                <Text style={styles.listBody} numberOfLines={2}>
                  {disc.body}
                </Text>
                <Text style={styles.listMeta}>
                  {disc.author} • {disc.timestamp}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Q&A</Text>
            {canPost && (
              <TouchableOpacity
                style={styles.addToggleButton}
                onPress={() => setShowNewQuestion((prev) => !prev)}
              >
                <Text style={styles.addToggleButtonText}>
                  {showNewQuestion ? 'Cancel' : 'Ask'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showNewQuestion && (
            <View style={styles.formCard}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ask a question..."
                placeholderTextColor="#64748b"
                value={newQuestion}
                onChangeText={setNewQuestion}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmitQuestion}>
                <Text style={styles.buttonText}>Post Question</Text>
              </TouchableOpacity>
            </View>
          )}

          {loadingQuestions ? (
            <ActivityIndicator color="#f97316" />
          ) : questions.length === 0 ? (
            <Text style={styles.emptyText}>No questions yet.</Text>
          ) : (
            questions.map((question) => (
              <View key={question.id} style={styles.listItem}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>{question.question}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      question.isAnswered ? styles.statusAnswered : styles.statusOpen,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {question.isAnswered ? 'Answered' : 'Open'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.listMeta}>
                  {question.author} • {question.timestamp}
                </Text>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() =>
                    setExpandedQuestionId(
                      expandedQuestionId === question.id ? null : question.id
                    )
                  }
                >
                  <Text style={styles.secondaryButtonText}>
                    {expandedQuestionId === question.id ? 'Hide Answers' : 'View Answers'}
                  </Text>
                </TouchableOpacity>
                {expandedQuestionId === question.id && (
                  <View style={styles.answersBlock}>
                    {question.answers.length === 0 ? (
                      <Text style={styles.emptyText}>No answers yet.</Text>
                    ) : (
                      question.answers.map((answer) => (
                        <View key={answer.id} style={styles.answerItem}>
                          <Text style={styles.answerText}>{answer.content}</Text>
                          <View style={styles.answerMetaRow}>
                            <Text style={styles.listMeta}>
                              {answer.author} • {answer.timestamp}
                            </Text>
                            {answer.isAccepted ? (
                              <View style={styles.acceptedPill}>
                                <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                                <Text style={styles.acceptedText}>Accepted</Text>
                              </View>
                            ) : null}
                          </View>
                          {session?.user?.id === question.user_id && !answer.isAccepted ? (
                            <TouchableOpacity
                              style={styles.acceptButton}
                              onPress={() => handleAcceptAnswer(question.id, answer.id)}
                            >
                              <Text style={styles.acceptButtonText}>Accept</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      ))
                    )}

                    {canPost && (
                      <View style={styles.answerForm}>
                        <TextInput
                          style={[styles.input, styles.textArea]}
                          placeholder="Write an answer..."
                          placeholderTextColor="#64748b"
                          value={newAnswers[question.id] || ''}
                          onChangeText={(value) =>
                            setNewAnswers((prev) => ({ ...prev, [question.id]: value }))
                          }
                          multiline
                        />
                        <TouchableOpacity
                          style={styles.button}
                          onPress={() => handleSubmitAnswer(question.id)}
                        >
                          <Text style={styles.buttonText}>Post Answer</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
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
  headerRow: {
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: 'rgba(249, 115, 22, 0.6)',
  },
  segmentText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#f8fafc',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
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
  formCard: {
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
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
  listItem: {
    backgroundColor: 'rgba(11, 18, 36, 0.95)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginBottom: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  listTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  listBody: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusAnswered: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  statusOpen: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },
  statusText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  answersBlock: {
    marginTop: 10,
    gap: 10,
  },
  answerItem: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  answerText: {
    color: '#e2e8f0',
    marginBottom: 6,
  },
  answerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acceptedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  acceptedText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '600',
  },
  acceptButton: {
    marginTop: 6,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default VehicleCommunityScreen;
