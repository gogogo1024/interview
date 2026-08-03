import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CommentCard } from "../../components/comments/CommentCard";
import { CommentForm } from "../../components/comments/CommentForm";
import { PostCard } from "../../components/posts/PostCard";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { getCurrentUser } from "../../server/functions/auth";
import { getPostComments } from "../../server/functions/comments";
import { getPost } from "../../server/functions/posts";

export const Route = createFileRoute("/posts/$postId")({
	component: PostPage,
});

function PostPage() {
	const { postId } = Route.useParams();
	const [post, setPost] = useState<any>(null);
	const [comments, setComments] = useState<any[]>([]);
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, [postId]);

	const loadData = async () => {
		try {
			const [currentUser, postData, commentsData] = await Promise.all([
				getCurrentUser(),
				getPost({ data: postId }),
				getPostComments({ data: postId }),
			]);
			setUser(currentUser);
			setPost(postData);
			setComments(commentsData);
		} catch (error) {
			console.error("Failed to load post:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="max-w-2xl mx-auto px-4 py-16">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (!post) {
		return (
			<div className="max-w-2xl mx-auto px-4 py-6">
				<div className="bg-white rounded-2xl shadow-sm p-12 text-center">
					<div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
						<AlertCircle className="h-8 w-8 text-red-500" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">Post not found</h3>
					<p className="text-gray-500 mb-6">This post may have been deleted or doesn't exist.</p>
					<Link
						to="/"
						className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Home
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto px-4 py-6">
			{/* Page Header */}
			<div className="flex items-center gap-4 mb-6">
				<Link to="/" className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Go back">
					<ArrowLeft className="h-5 w-5 text-gray-600" />
				</Link>
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Post</h1>
					<p className="text-sm text-gray-500">View post and comments</p>
				</div>
			</div>

			{/* Post */}
			<PostCard post={post} currentUserId={user?.id} onDelete={() => window.history.back()} />

			{/* Comments Section */}
			<div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
				<div className="p-5 border-b border-gray-50">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
							<MessageCircle className="h-5 w-5 text-white" />
						</div>
						<div>
							<h2 className="font-bold text-gray-900">Comments</h2>
							<p className="text-sm text-gray-500">
								{comments.length} {comments.length === 1 ? "comment" : "comments"}
							</p>
						</div>
					</div>

					{user && <CommentForm postId={postId} onSuccess={loadData} />}

					{!user && (
						<div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
							<p className="text-gray-600 text-sm">
								<Link to="/auth/login" className="text-blue-600 font-semibold hover:underline">
									Sign in
								</Link>{" "}
								to leave a comment
							</p>
						</div>
					)}
				</div>

				{/* Comments List */}
				<div className="px-5">
					{comments.length === 0 ? (
						<div className="py-12 text-center">
							<div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
								<MessageCircle className="h-6 w-6 text-gray-400" />
							</div>
							<p className="text-gray-500">No comments yet</p>
							<p className="text-sm text-gray-400 mt-1">Be the first to comment!</p>
						</div>
					) : (
						<div>
							{comments.map((comment) => (
								<div key={comment.id}>
									<CommentCard comment={comment} currentUserId={user?.id} onDelete={loadData} />
									{comment.replies?.map((reply: any) => (
										<div key={reply.id} className="ml-8 pl-4 border-l-2 border-gray-100">
											<CommentCard comment={reply} currentUserId={user?.id} onDelete={loadData} />
										</div>
									))}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
