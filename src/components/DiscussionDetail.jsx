import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon as ArrowUpSolid, ArrowDownIcon as ArrowDownSolid } from '@heroicons/react/24/solid';
import supabase from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = UserAuth();

  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState({});
  const [showReplyInput, setShowReplyInput] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Format time ago helper
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  };

  // Fetch discussion and comments
  useEffect(() => {
    const fetchDiscussion = async () => {
      setLoading(true);
      try {
        // Fetch post
        const { data: post, error: postError } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            body,
            created_at,
            vehicle_id,
            user_id,
            profiles:user_id (
              username
            ),
            cars:vehicle_id (
              year,
              make,
              model
            )
          `)
          .eq('id', id)
          .single();

        if (postError) {
          console.error('Error fetching discussion:', postError);
          setLoading(false);
          return;
        }

        const vehicleName = post.cars 
          ? `${post.cars.year} ${post.cars.make} ${post.cars.model}`
          : 'Vehicle';

        setDiscussion({
          id: post.id,
          author: post.profiles?.username || 'Unknown',
          title: post.title,
          content: post.body,
          timestamp: formatTimeAgo(post.created_at),
          vehicleId: post.vehicle_id,
          vehicleName: vehicleName
        });

        // Fetch comments (top-level only)
        // Fetch comments first without nested relationship to avoid 400 errors
        let topComments = [];
        let commentsError = null;
        
        const { data: commentsData, error: commentsErr } = await supabase
          .from('comments')
          .select('id, body, created_at, user_id, post_id, parent_id')
          .eq('post_id', id)
          .is('parent_id', null)
          .order('created_at', { ascending: true });

        if (commentsErr) {
          console.error('Error fetching comments:', commentsErr);
          commentsError = commentsErr;
        } else {
          topComments = commentsData || [];
          
          // Fetch usernames separately if we have comments
          if (topComments.length > 0) {
            const userIds = [...new Set(topComments.map(c => c.user_id).filter(Boolean))];
            if (userIds.length > 0) {
              const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, username')
                .in('id', userIds);
              
              // Map usernames to comments
              if (profilesData) {
                const usernameMap = profilesData.reduce((acc, profile) => {
                  acc[profile.id] = profile.username;
                  return acc;
                }, {});
                
                topComments = topComments.map(comment => ({
                  ...comment,
                  profiles: { username: usernameMap[comment.user_id] || 'Unknown' }
                }));
              }
            }
          }
        }

        if (!commentsError && topComments) {
          // Fetch replies for each comment
          const commentIds = topComments.map(c => c.id);
          let repliesMap = {};
          
          if (commentIds.length > 0) {
            const { data: replies } = await supabase
              .from('comments')
              .select('id, body, created_at, parent_id, user_id')
              .in('parent_id', commentIds)
              .order('created_at', { ascending: true });

            if (replies && replies.length > 0) {
              // Fetch usernames for replies
              const replyUserIds = [...new Set(replies.map(r => r.user_id).filter(Boolean))];
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
                if (!acc[reply.parent_id]) {
                  acc[reply.parent_id] = [];
                }
                acc[reply.parent_id].push({
                  id: reply.id,
                  author: replyUsernameMap[reply.user_id] || 'Unknown',
                  content: reply.body,
                  timestamp: formatTimeAgo(reply.created_at)
                });
                return acc;
              }, {});
            }
          }

          const formattedComments = topComments.map(comment => ({
            id: comment.id,
            author: comment.profiles?.username || 'Unknown',
            content: comment.body,
            timestamp: formatTimeAgo(comment.created_at),
            replies: repliesMap[comment.id] || []
          }));

          setComments(formattedComments);
        }
      } catch (err) {
        console.error('Error in fetchDiscussion:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDiscussion();
    }
  }, [id, session?.user?.id]);

  useEffect(() => {
    setIsVisible(true);
  }, []);


  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!session?.user?.id) {
      alert('Please sign in to comment');
      return;
    }

    try {
      // Try with post_id first, fallback to parent_id if post_id doesn't exist
      let error;
      
      // First try with post_id
      const { error: error1 } = await supabase
        .from('comments')
        .insert({
          user_id: session.user.id,
          post_id: id,
          parent_id: null,
          body: newComment
        });

      // Check if error is due to missing column
      if (error1 && (error1.code === '42703' || error1.code === 'PGRST100' || error1.message?.includes('column') || error1.message?.includes('post_id') || error1.code === '400')) {
        // post_id column doesn't exist, try with parent_id
        // This will only work if the FK constraint allows posts.id
        const { error: error2 } = await supabase
          .from('comments')
          .insert({
            user_id: session.user.id,
            parent_id: id,  // Try using parent_id to reference post
            body: newComment,
            score: 0
          });
        error = error2;
        
        if (error2 && error2.code === '23503') {
          // Foreign key constraint violation - parent_id can't reference posts
          alert('Database schema issue: The comments table needs a post_id column to link top-level comments to posts. Please add: ALTER TABLE comments ADD COLUMN post_id UUID REFERENCES posts(id);');
          return;
        }
      } else {
        error = error1;
      }

      if (error) {
        console.error('Error creating comment:', error);
        alert('Failed to post comment. Please try again.');
      } else {
        // Update comment count
        const { data: post } = await supabase
          .from('posts')
          .select('comment_count')
          .eq('id', id)
          .single();

        if (post) {
          await supabase
            .from('posts')
            .update({ comment_count: (post.comment_count || 0) + 1 })
            .eq('id', id);
        }

        setNewComment('');
        window.location.reload();
      }
    } catch (err) {
      console.error('Error in handleSubmitComment:', err);
      alert('Failed to post comment. Please try again.');
    }
  };

  const handleSubmitReply = async (commentId, e) => {
    e.preventDefault();
    const replyText = newReply[commentId];
    if (!replyText?.trim()) return;
    if (!session?.user?.id) {
      alert('Please sign in to reply');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: session.user.id,
          parent_id: commentId,
          body: replyText
        });

      if (error) {
        console.error('Error creating reply:', error);
        alert('Failed to post reply. Please try again.');
      } else {
        setNewReply(prev => ({ ...prev, [commentId]: '' }));
        setShowReplyInput(null);
        window.location.reload();
      }
    } catch (err) {
      console.error('Error in handleSubmitReply:', err);
      alert('Failed to post reply. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-400">Loading discussion...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-white text-xl mb-4">Discussion not found</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white -mt-0">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-6 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition group"
        >
          <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">{discussion.vehicleName}</span>
        </button>

        {/* Main Discussion Post */}
        <div
          className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50 mb-8 transform transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex gap-4">
            {/* Content */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">{discussion.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
                <span className="font-semibold text-white">{discussion.author}</span>
                <span>•</span>
                <span>{discussion.timestamp}</span>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                {discussion.content}
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div
          className={`transform transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
            <ChatBubbleLeftIcon className="h-7 w-7 text-blue-400" />
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>

          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <textarea
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="w-full p-4 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-blue-500/50 flex items-center gap-2"
            >
              Post Comment
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all transform transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="flex gap-4">
                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <span className="font-semibold text-white">{comment.author}</span>
                      <span>•</span>
                      <span>{comment.timestamp}</span>
                    </div>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {comment.content}
                    </p>

                    {/* Reply Button */}
                    <button
                      onClick={() => setShowReplyInput(showReplyInput === comment.id ? null : comment.id)}
                      className="text-sm text-blue-400 hover:text-blue-300 font-semibold mb-4 transition"
                    >
                      Reply
                    </button>

                    {/* Reply Input */}
                    {showReplyInput === comment.id && (
                      <form onSubmit={(e) => handleSubmitReply(comment.id, e)} className="mb-4 bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                        <textarea
                          placeholder="Write a reply..."
                          value={newReply[comment.id] || ''}
                          onChange={(e) => setNewReply(prev => ({ ...prev, [comment.id]: e.target.value }))}
                          rows={3}
                          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm mb-3 placeholder-gray-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition font-semibold text-sm"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowReplyInput(null);
                              setNewReply(prev => ({ ...prev, [comment.id]: '' }));
                            }}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-6 mt-4 space-y-3 border-l-2 border-gray-700 pl-6">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                  <span className="font-semibold text-white">{reply.author}</span>
                                  <span>•</span>
                                  <span>{reply.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <ChatBubbleLeftIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl font-semibold text-white mb-2">No comments yet</p>
              <p className="text-gray-400">Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;

