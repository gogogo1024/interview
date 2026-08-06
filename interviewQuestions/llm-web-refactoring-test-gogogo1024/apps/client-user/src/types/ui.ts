export type User = {
	id: string;
	username: string;
	displayName: string;
	avatarUrl?: string | null;
	email?: string;
	bio?: string | null;
	role?: string;
	createdAt?: Date;
	updatedAt?: Date;
	followerCount?: number;
	followingCount?: number;
	postCount?: number;
	isFollowing?: boolean;
};

export type Post = {
	id: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	author: { id: string; username: string; displayName: string; avatarUrl?: string | null };
	likeCount: number;
	commentCount: number;
	isLiked?: boolean;
};

export type Comment = {
	id: string;
	content: string;
	createdAt: Date;
	parentId: string | null;
	author: { id: string; username: string; displayName: string; avatarUrl?: string | null };
	likeCount: number;
	isLiked: boolean;
	replies?: Comment[];
	postId?: string;
};

export type Notification = {
	id: string;
	type: string;
	read: boolean;
	actor?: { id: string; username: string; displayName: string; avatarUrl?: string };
	postId?: string;
	commentId?: string;
	postContent?: string;
	commentContent?: string;
	createdAt: Date;
};
