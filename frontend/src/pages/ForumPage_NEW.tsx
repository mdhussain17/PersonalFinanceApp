import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import forumService, { type ForumPostDto } from '../services/forumService';
import styles from './ForumPage.module.css';

const ForumPage: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<ForumPostDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [creating, setCreating] = useState(false);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/signin');
            return;
        }
        
        const username = forumService.getCurrentUsername();
        setCurrentUsername(username);
        loadPosts();
    }, [navigate]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await forumService.getAllPosts();
            setPosts(data);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setCreating(true);
            await forumService.createPost({ title, content });
            setShowCreateModal(false);
            setTitle('');
            setContent('');
            setSuccess('Post created successfully!');
            setTimeout(() => setSuccess(''), 3000);
            loadPosts(); // Reload to show new post
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create post');
        } finally {
            setCreating(false);
        }
    };

    const handleDeletePost = async (postId: number, postTitle: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation to post detail
        
        if (!window.confirm(`Are you sure you want to delete this post?\n\n"${postTitle}"\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            await forumService.deletePost(postId);
            setSuccess('Post deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
            loadPosts(); // Reload posts
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete post');
        }
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

    const canDeletePost = (post: ForumPostDto) => {
        return currentUsername && post.username === currentUsername;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>💬 Community Forum</h1>
                    <p className={styles.subtitle}>
                        Share tips, ask questions, and learn from the community
                    </p>
                </div>
                <button 
                    className={styles.createButton}
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Post
                </button>
            </div>

            {error && (
                <div className={styles.error}>
                    ⚠️ {error}
                    <button onClick={() => setError('')} className={styles.closeAlert}>✕</button>
                </div>
            )}
            
            {success && (
                <div className={styles.success}>
                    ✅ {success}
                    <button onClick={() => setSuccess('')} className={styles.closeAlert}>✕</button>
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>Loading posts...</div>
            ) : posts.length === 0 ? (
                <div className={styles.noPosts}>
                    <p>📝 No posts yet.</p>
                    <p>Be the first to start a discussion!</p>
                </div>
            ) : (
                <div className={styles.postsGrid}>
                    {posts.map((post) => (
                        <div 
                            key={post.id}
                            className={styles.postCard}
                        >
                            <div 
                                className={styles.postHeader}
                                onClick={() => navigate(`/forum/${post.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <h3 className={styles.postTitle}>{post.title}</h3>
                                <div className={styles.postMeta}>
                                    <span>👤 {post.username}</span>
                                    <span>•</span>
                                    <span>🕒 {getTimeAgo(post.createdAt)}</span>
                                </div>
                            </div>
                            
                            <div 
                                className={styles.postFooter}
                                onClick={() => navigate(`/forum/${post.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles.stat}>
                                    <span>❤️ {post.likeCount}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span>💬 {post.commentCount}</span>
                                </div>
                                
                                {canDeletePost(post) && (
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={(e) => handleDeletePost(post.id, post.title, e)}
                                        title="Delete your post"
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Create New Post</h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setTitle('');
                                    setContent('');
                                    setError('');
                                }}
                                className={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePost} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Tips for saving money on groceries"
                                    required
                                    className={styles.input}
                                    maxLength={100}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Content</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Share your thoughts, tips, or questions..."
                                    required
                                    className={styles.textarea}
                                    rows={8}
                                    maxLength={2000}
                                />
                                <p style={{ 
                                    fontSize: '0.85rem', 
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    textAlign: 'right',
                                    marginTop: '0.5rem'
                                }}>
                                    {content.length}/2000 characters
                                </p>
                            </div>

                            <button 
                                type="submit" 
                                className={styles.submitButton}
                                disabled={creating}
                            >
                                {creating ? 'Creating...' : 'Create Post'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForumPage;
