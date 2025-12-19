import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import forumService, { type ForumPostDetailDto } from '../services/forumService';
import styles from './TransactionsPage.module.css';

const ForumPostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<ForumPostDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/signin');
            return;
        }
        
        const username = forumService.getCurrentUsername();
        const userEmail = forumService.getCurrentUserEmail();
        console.log('🔵 Current user - username:', username, 'email:', userEmail);
        setCurrentUsername(username);
        
        if (id) {
            loadPost();
        }
    }, [id, navigate]);

    const loadPost = async () => {
        try {
            setLoading(true);
            const data = await forumService.getPostById(Number(id));
            setPost(data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!post) return;
        
        try {
            console.log('🔵 Before like - Current like count:', post.likeCount, 'Liked by user:', post.likedByCurrentUser);
            const response = await forumService.likePost(post.id);
            console.log('🔵 Backend response:', response);
            console.log('🔵 New like count from backend:', response.newLikeCount, 'Liked:', response.liked);
            
            // Update post with new like data
            setPost({
                ...post,
                likeCount: response.newLikeCount,
                likedByCurrentUser: response.liked
            });
            
            console.log('✅ State updated - New like count:', response.newLikeCount);
        } catch (err: any) {
            console.error('🔴 Error liking post:', err);
            setError(err.response?.data?.message || 'Failed to like post');
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        console.log('🔵 handleAddComment called');
        e.preventDefault();
        console.log('🔵 Comment content:', commentContent);
        console.log('🔵 Post:', post);
        
        if (!commentContent.trim() || !post) {
            console.log('🔴 Validation failed');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            console.log('🔵 Calling API...');
            await forumService.addComment(post.id, { content: commentContent });
            console.log('✅ Comment added successfully');
            setCommentContent('');
            setSuccess('Comment added successfully!');
            setTimeout(() => setSuccess(''), 3000);
            // Reload post to get updated comments
            loadPost();
        } catch (err: any) {
            console.error('🔴 Error adding comment:', err);
            setError(err.response?.data?.message || 'Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        if (!post) return;
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await forumService.deletePost(post.id);
            setSuccess('Post deleted successfully!');
            setTimeout(() => navigate('/forum'), 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete post');
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!post) return;
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            await forumService.deleteComment(commentId);
            setSuccess('Comment deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
            // Reload post to get updated comments
            loadPost();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete comment');
        }
    };

    const canDeletePost = () => {
        if (!post || !currentUsername) return false;
        const userEmail = forumService.getCurrentUserEmail();
        const canDelete = post.username === currentUsername || post.username === userEmail;
        console.log('🔵 Can delete post?', canDelete, '| Post username:', post.username, '| Current username:', currentUsername, '| Current email:', userEmail);
        return canDelete;
    };

    const canDeleteComment = (commentUsername: string) => {
        if (!currentUsername) return false;
        const userEmail = forumService.getCurrentUserEmail();
        // Check both username and email because backend might return either
        const canDelete = commentUsername === currentUsername || commentUsername === userEmail;
        console.log('🔵 Can delete comment?', canDelete, '| Comment username:', commentUsername, '| Current username:', currentUsername, '| Current email:', userEmail);
        return canDelete;
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString('en-IN');
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.transactionsContainer}>
                    <p className={styles.noData}>Loading post...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.transactionsContainer}>
                    <div className={styles.error}>{error || 'Post not found'}</div>
                    <button 
                        className={styles.addTransactionBtn}
                        onClick={() => navigate('/forum')}
                        style={{ marginTop: '1rem' }}
                    >
                        ← Back to Forum
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.transactionsContainer}>
                {/* Success Message */}
                {success && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(0, 196, 159, 0.1)',
                        border: '1px solid rgba(0, 196, 159, 0.3)',
                        borderRadius: '12px',
                        color: '#00C49F',
                        marginBottom: '1.5rem',
                        fontSize: '0.95rem'
                    }}>
                        ✓ {success}
                    </div>
                )}

                {/* Post Content - Full Width Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '15px',
                    padding: '2rem',
                    border: '1px solid rgba(137, 250, 255, 0.2)',
                    marginBottom: '2rem',
                    width: '100%'
                }}>
                    {/* Header with Title */}
                    <div style={{ marginBottom: '1rem' }}>
                        <h1 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>{post.title}</h1>
                    </div>
                    
                    {/* User Info and Time */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid rgba(137, 250, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.95rem'
                    }}>
                        <span>👤 {post.username}</span>
                        <span>•</span>
                        <span>🕒 {getTimeAgo(post.createdAt)}</span>
                    </div>

                    {/* Post Content */}
                    <p style={{
                        lineHeight: '1.8',
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: '2rem',
                        whiteSpace: 'pre-wrap',
                        fontSize: '1.05rem'
                    }}>
                        {post.content}
                    </p>

                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: post.likedByCurrentUser 
                                ? 'linear-gradient(135deg, #00C49F, #00D4AA)' 
                                : 'rgba(255, 255, 255, 0.05)',
                            border: post.likedByCurrentUser 
                                ? 'none' 
                                : '1px solid rgba(137, 250, 255, 0.3)',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            marginRight: '1rem'
                        }}
                    >
                        {post.likedByCurrentUser ? '❤️ Liked' : '🤍 Like'} ({post.likeCount})
                    </button>

                    {/* Delete Post Button */}
                    {canDeletePost() && (
                        <button
                            onClick={handleDeletePost}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(255, 77, 77, 0.1)',
                                border: '1px solid rgba(255, 77, 77, 0.3)',
                                borderRadius: '12px',
                                color: '#FF4D4D',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 600,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            🗑️ Delete Post
                        </button>
                    )}
                </div>

                {/* Comments Section */}
                <div style={{ marginTop: '2rem', width: '100%' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>💬 Comments ({post.comments.length})</h2>

                    {/* Error Message for Comments */}
                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255, 77, 77, 0.1)',
                            border: '1px solid rgba(255, 77, 77, 0.3)',
                            borderRadius: '12px',
                            color: '#FF4D4D',
                            marginBottom: '1rem',
                            fontSize: '0.95rem'
                        }}>
                            ✗ {error}
                        </div>
                    )}

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} style={{ marginBottom: '2rem', width: '100%' }}>
                        <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Write a comment..."
                            required
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(137, 250, 255, 0.2)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                marginBottom: '1rem'
                            }}
                        />
                        <button 
                            type="submit"
                            className={styles.addTransactionBtn}
                            disabled={submitting || !commentContent.trim()}
                        >
                            {submitting ? 'Adding...' : 'Add Comment'}
                        </button>
                    </form>

                    {/* Comments List */}
                    {post.comments.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '2rem' }}>
                            No comments yet. Be the first to comment!
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {post.comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        border: '1px solid rgba(137, 250, 255, 0.2)',
                                        width: '100%'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem',
                                        paddingBottom: '0.75rem',
                                        borderBottom: '1px solid rgba(137, 250, 255, 0.1)',
                                        gap: '1rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: '0.9rem',
                                            color: 'rgba(255, 255, 255, 0.6)'
                                        }}>
                                            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                                                👤 {comment.username}
                                            </span>
                                            <span>•</span>
                                            <span>🕒 {getTimeAgo(comment.createdAt)}</span>
                                        </div>
                                        
                                        {canDeleteComment(comment.username) && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                style={{
                                                    padding: '0.4rem 0.9rem',
                                                    background: 'rgba(255, 77, 77, 0.1)',
                                                    border: '1px solid rgba(255, 77, 77, 0.3)',
                                                    borderRadius: '8px',
                                                    color: '#FF4D4D',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                    <p style={{
                                        lineHeight: '1.7',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        margin: 0,
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '0.95rem'
                                    }}>
                                        {comment.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForumPostDetailPage;
