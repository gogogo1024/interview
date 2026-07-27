/**
 * Common API response types
 */

export interface Author {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
}

export interface PostResponse {
	id: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	author: Author;
	likeCount: number;
	commentCount: number;
	isLiked?: boolean;
}

export interface CommentResponse {
	id: string;
	content: string;
	createdAt: Date;
	parentId: string | null;
	author: Author;
	likeCount: number;
	isLiked?: boolean;
	replies?: CommentResponse[];
}

export interface UserProfileResponse {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	bio: string | null;
	role: "user" | "admin" | "moderator";
	createdAt: Date;
	followerCount: number;
	followingCount: number;
	postCount: number;
	isFollowing?: boolean;
}

export interface PaginationParams {
	limit?: number;
	offset?: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	hasMore: boolean;
}

/**
 * Auth types
 */
export interface RegisterRequest {
	email: string;
	username: string;
	displayName: string;
	password: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	success: boolean;
	userId: string;
	sessionToken?: string;
}

/**
 * Post types
 */
export interface CreatePostRequest {
	content: string;
}

export interface UpdatePostRequest {
	postId: string;
	content: string;
}

/**
 * Comment types
 */
export interface CreateCommentRequest {
	postId: string;
	content: string;
	parentId?: string;
}

/**
 * Follow types
 */
export interface FollowResponse {
	success: boolean;
	following: boolean;
}

/**
 * Like types
 */
export interface LikeResponse {
	success: boolean;
	liked: boolean;
}

/**
 * Search types
 */
export interface SearchUsersResponse {
	users: Array<{
		id: string;
		username: string;
		displayName: string;
		avatarUrl: string | null;
		bio: string | null;
	}>;
}

export interface SearchPostsResponse {
	posts: PostResponse[];
}

/**
 * Admin types
 */
export interface AdminUserResponse {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	bio: string | null;
	role: "user" | "admin" | "moderator";
	createdAt: Date;
	updatedAt: Date;
	bannedAt: Date | null;
	bannedReason: string | null;
	postCount: number;
	commentCount: number;
}

export interface BanUserRequest {
	userId: string;
	reason: string;
}

export interface ReportResponse {
	id: string;
	reporterId: string;
	reporterUsername: string;
	targetType: "post" | "comment" | "user";
	targetId: string;
	reason: string;
	description: string | null;
	status: "pending" | "reviewed" | "actioned" | "dismissed";
	reviewedBy: string | null;
	reviewedAt: Date | null;
	createdAt: Date;
}

export interface AuditLogResponse {
	id: string;
	adminId: string;
	adminUsername: string;
	action: string;
	targetType: "user" | "post" | "comment" | "report" | null;
	targetId: string | null;
	details: Record<string, unknown> | null;
	ipAddress: string | null;
	createdAt: Date;
}

export interface DashboardStatsResponse {
	totalUsers: number;
	totalPosts: number;
	totalComments: number;
	pendingReports: number;
	newUsersToday: number;
	newPostsToday: number;
}
