import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { ArrowUpIcon, ArrowDownIcon, ChatBubbleLeftIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon as ArrowUpSolid, ArrowDownIcon as ArrowDownSolid } from '@heroicons/react/24/solid';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, fetch from Supabase based on id
  const [discussion, setDiscussion] = useState({
    id: parseInt(id),
    author: 'CarEnthusiast92',
    title: 'Love the color on this build!',
    content: 'That paint job is absolutely stunning. How long have you had it? I\'m thinking about getting a similar color for my project car. What brand/color code did you use?',
    upvotes: 24,
    downvotes: 2,
    timestamp: '2 hours ago',
    userVote: null,
    vehicleId: '1', // This would come from the discussion data
    vehicleName: '2020 Ford Mustang GT'
  });

  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'PaintPro',
      content: 'Looks like a custom mix! Really nice work. I\'d love to see it in person.',
      upvotes: 8,
      downvotes: 0,
      timestamp: '1 hour ago',
      userVote: null,
      replies: [
        {
          id: 11,
          author: 'CarEnthusiast92',
          content: 'Thanks! It\'s actually a wrap, not paint. Much easier to change later.',
          upvotes: 3,
          downvotes: 0,
          timestamp: '45 minutes ago',
          userVote: null
        }
      ]
    },
    {
      id: 2,
      author: 'ModMaster',
      content: 'The color really pops with those wheels. Great choice!',
      upvotes: 5,
      downvotes: 1,
      timestamp: '1 hour ago',
      userVote: null,
      replies: []
    },
    {
      id: 3,
      author: 'DetailKing',
      content: 'How do you maintain that finish? Any special products?',
      upvotes: 4,
      downvotes: 0,
      timestamp: '30 minutes ago',
      userVote: null,
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState({});
  const [showReplyInput, setShowReplyInput] = useState(null);

  const handleVote = (type, commentId = null, replyId = null) => {
    if (commentId === null) {
      // Vote on main discussion
      const currentVote = discussion.userVote;
      let newUpvotes = discussion.upvotes;
      let newDownvotes = discussion.downvotes;
      let newUserVote = null;

      if (currentVote === type) {
        if (type === 'up') newUpvotes--;
        else newDownvotes--;
      } else {
        if (currentVote === 'up') newUpvotes--;
        if (currentVote === 'down') newDownvotes--;
        if (type === 'up') newUpvotes++;
        else newDownvotes++;
        newUserVote = type;
      }

      setDiscussion({
        ...discussion,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVote: newUserVote
      });
    } else if (replyId === null) {
      // Vote on comment
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const currentVote = comment.userVote;
          let newUpvotes = comment.upvotes;
          let newDownvotes = comment.downvotes;
          let newUserVote = null;

          if (currentVote === type) {
            if (type === 'up') newUpvotes--;
            else newDownvotes--;
          } else {
            if (currentVote === 'up') newUpvotes--;
            if (currentVote === 'down') newDownvotes--;
            if (type === 'up') newUpvotes++;
            else newDownvotes++;
            newUserVote = type;
          }

          return {
            ...comment,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote
          };
        }
        return comment;
      }));
    } else {
      // Vote on reply
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === replyId) {
                const currentVote = reply.userVote;
                let newUpvotes = reply.upvotes;
                let newDownvotes = reply.downvotes;
                let newUserVote = null;

                if (currentVote === type) {
                  if (type === 'up') newUpvotes--;
                  else newDownvotes--;
                } else {
                  if (currentVote === 'up') newUpvotes--;
                  if (currentVote === 'down') newDownvotes--;
                  if (type === 'up') newUpvotes++;
                  else newDownvotes++;
                  newUserVote = type;
                }

                return {
                  ...reply,
                  upvotes: newUpvotes,
                  downvotes: newDownvotes,
                  userVote: newUserVote
                };
              }
              return reply;
            })
          };
        }
        return comment;
      }));
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: 'You',
      content: newComment,
      upvotes: 0,
      downvotes: 0,
      timestamp: 'just now',
      userVote: null,
      replies: []
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleSubmitReply = (commentId, e) => {
    e.preventDefault();
    const replyText = newReply[commentId];
    if (!replyText?.trim()) return;

    const reply = {
      id: Date.now(),
      author: 'You',
      content: replyText,
      upvotes: 0,
      downvotes: 0,
      timestamp: 'just now',
      userVote: null
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, reply]
        };
      }
      return comment;
    }));

    setNewReply(prev => ({ ...prev, [commentId]: '' }));
    setShowReplyInput(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Vehicle Link */}
        <div className="mb-4">
          <button
            onClick={() => navigate(`/vehicle/${discussion.vehicleId}`)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← {discussion.vehicleName}
          </button>
        </div>

        {/* Main Discussion Post */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => handleVote('up')}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
                  discussion.userVote === 'up' ? 'text-orange-500' : 'text-gray-500'
                }`}
              >
                {discussion.userVote === 'up' ? (
                  <ArrowUpSolid className="h-6 w-6" />
                ) : (
                  <ArrowUpIcon className="h-6 w-6" />
                )}
              </button>
              <span className={`text-lg font-bold ${
                discussion.userVote === 'up' ? 'text-orange-500' :
                discussion.userVote === 'down' ? 'text-blue-500' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {discussion.upvotes - discussion.downvotes}
              </span>
              <button
                onClick={() => handleVote('down')}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
                  discussion.userVote === 'down' ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {discussion.userVote === 'down' ? (
                  <ArrowDownSolid className="h-6 w-6" />
                ) : (
                  <ArrowDownIcon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-3">{discussion.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500 mb-4">
                <span className="font-medium">u/{discussion.author}</span>
                <span>•</span>
                <span>{discussion.timestamp}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {discussion.content}
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ChatBubbleLeftIcon className="h-6 w-6" />
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>

          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <textarea
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              Comment
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              >
                <div className="flex gap-3">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleVote('up', comment.id)}
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
                        comment.userVote === 'up' ? 'text-orange-500' : 'text-gray-500'
                      }`}
                    >
                      {comment.userVote === 'up' ? (
                        <ArrowUpSolid className="h-4 w-4" />
                      ) : (
                        <ArrowUpIcon className="h-4 w-4" />
                      )}
                    </button>
                    <span className={`text-xs font-semibold ${
                      comment.userVote === 'up' ? 'text-orange-500' :
                      comment.userVote === 'down' ? 'text-blue-500' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {comment.upvotes - comment.downvotes}
                    </span>
                    <button
                      onClick={() => handleVote('down', comment.id)}
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
                        comment.userVote === 'down' ? 'text-blue-500' : 'text-gray-500'
                      }`}
                    >
                      {comment.userVote === 'down' ? (
                        <ArrowDownSolid className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-2">
                      <span className="font-medium">u/{comment.author}</span>
                      <span>•</span>
                      <span>{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {comment.content}
                    </p>

                    {/* Reply Button */}
                    <button
                      onClick={() => setShowReplyInput(showReplyInput === comment.id ? null : comment.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-3"
                    >
                      Reply
                    </button>

                    {/* Reply Input */}
                    {showReplyInput === comment.id && (
                      <form onSubmit={(e) => handleSubmitReply(comment.id, e)} className="mb-3">
                        <textarea
                          placeholder="Write a reply..."
                          value={newReply[comment.id] || ''}
                          onChange={(e) => setNewReply(prev => ({ ...prev, [comment.id]: e.target.value }))}
                          rows={2}
                          className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowReplyInput(null);
                              setNewReply(prev => ({ ...prev, [comment.id]: '' }));
                            }}
                            className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-4 mt-3 space-y-3 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex gap-2">
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  onClick={() => handleVote('up', comment.id, reply.id)}
                                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition ${
                                    reply.userVote === 'up' ? 'text-orange-500' : 'text-gray-500'
                                  }`}
                                >
                                  {reply.userVote === 'up' ? (
                                    <ArrowUpSolid className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpIcon className="h-3 w-3" />
                                  )}
                                </button>
                                <span className={`text-xs font-semibold ${
                                  reply.userVote === 'up' ? 'text-orange-500' :
                                  reply.userVote === 'down' ? 'text-blue-500' :
                                  'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {reply.upvotes - reply.downvotes}
                                </span>
                                <button
                                  onClick={() => handleVote('down', comment.id, reply.id)}
                                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition ${
                                    reply.userVote === 'down' ? 'text-blue-500' : 'text-gray-500'
                                  }`}
                                >
                                  {reply.userVote === 'down' ? (
                                    <ArrowDownSolid className="h-3 w-3" />
                                  ) : (
                                    <ArrowDownIcon className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-1">
                                  <span className="font-medium">u/{reply.author}</span>
                                  <span>•</span>
                                  <span>{reply.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
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
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;

