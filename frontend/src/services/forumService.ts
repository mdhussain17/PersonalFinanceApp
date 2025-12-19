import axios from 'axios';

const API_URL = 'http://localhost:8081/api/forum';

// Helper function to get JWT token from localStorage
const getToken = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.token;
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            return null;
        }
    }
    return null;
};

// Comment DTO
export interface CommentDto {
    id: number;
    content: string;
    username: string;
    createdAt: string;
}

// Forum Post DTO (List)
export interface ForumPostDto {
    id: number;
    title: string;
    content: string;
    username: string;
    likeCount: number;
    commentCount: number;
    createdAt: string;
}

// Forum Post Detail DTO
export interface ForumPostDetailDto {
    id: number;
    title: string;
    content: string;
    username: string;
    likeCount: number;
    likedByCurrentUser: boolean;
    createdAt: string;
    comments: CommentDto[];
}

// Create Post Request
export interface CreatePostRequest {
    title: string;
    content: string;
}

// Create Comment Request
export interface CreateCommentRequest {
    content: string;
}

// Like Response
export interface LikeResponse {
    liked: boolean;
    newLikeCount: number;
}

/**
 * Get all forum posts
 */
export const getAllPosts = async (): Promise<ForumPostDto[]> => {
    const token = getToken();
    const response = await axios.get<ForumPostDto[]>(`${API_URL}/posts`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

/**
 * Get single post with details
 */
export const getPostById = async (postId: number): Promise<ForumPostDetailDto> => {
    const token = getToken();
    const response = await axios.get<ForumPostDetailDto>(`${API_URL}/posts/${postId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

/**
 * Create new post
 */
export const createPost = async (data: CreatePostRequest): Promise<ForumPostDetailDto> => {
    const token = getToken();
    const response = await axios.post<ForumPostDetailDto>(`${API_URL}/posts`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

/**
 * Like/Unlike a post
 */
export const likePost = async (postId: number): Promise<LikeResponse> => {
    const token = getToken();
    const response = await axios.post<LikeResponse>(`${API_URL}/posts/${postId}/like`, {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

/**
 * Add comment to post
 */
export const addComment = async (postId: number, data: CreateCommentRequest): Promise<CommentDto> => {
    const token = getToken();
    const response = await axios.post<CommentDto>(`${API_URL}/posts/${postId}/comments`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

/**
 * Delete a post (only owner can delete)
 */
export const deletePost = async (postId: number): Promise<void> => {
    const token = getToken();
    await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * Delete a comment (only owner can delete)
 */
export const deleteComment = async (commentId: number): Promise<void> => {
    const token = getToken();
    await axios.delete(`${API_URL}/comments/${commentId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * Get current user email from localStorage
 */
export const getCurrentUserEmail = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.email || null;
        } catch (e) {
            return null;
        }
    }
    return null;
};

/**
 * Get current username from localStorage
 */
export const getCurrentUsername = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.username || user.name || null;
        } catch (e) {
            return null;
        }
    }
    return null;
};

const forumService = {
    getAllPosts,
    getPostById,
    createPost,
    likePost,
    addComment,
    deletePost,
    deleteComment,
    getCurrentUserEmail,
    getCurrentUsername
};

export default forumService;
