import {
	AdminService,
	AuthService,
	BookmarksService,
	CommentsService,
	FeedService,
	FollowsService,
	LikesService,
	NotificationsService,
	PostsService,
	SearchService,
	UsersService,
} from "@chirp/proto";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { adaptService } from "@protobuf-ts/grpc-backend";
import { adminHandler } from "./handlers/admin.handler";
import { authHandler } from "./handlers/auth.handler";
import { bookmarksHandler } from "./handlers/bookmarks.handler";
import { commentsHandler } from "./handlers/comments.handler";
import { feedHandler } from "./handlers/feed.handler";
import { followsHandler } from "./handlers/follows.handler";
import { likesHandler } from "./handlers/likes.handler";
import { notificationsHandler } from "./handlers/notifications.handler";
import { postsHandler } from "./handlers/posts.handler";
import { searchHandler } from "./handlers/search.handler";
import { usersHandler } from "./handlers/users.handler";
import { wrapGrpcHandler } from "./wrapHandler";

export function startGrpcServer(port: number): Promise<Server> {
	const server = new Server();

	// Register all service handlers with tracing/logging wrapper
	server.addService(...adaptService(AuthService, wrapGrpcHandler(authHandler, "AuthService")));
	server.addService(...adaptService(PostsService, wrapGrpcHandler(postsHandler, "PostsService")));
	server.addService(
		...adaptService(CommentsService, wrapGrpcHandler(commentsHandler, "CommentsService")),
	);
	server.addService(...adaptService(LikesService, wrapGrpcHandler(likesHandler, "LikesService")));
	server.addService(
		...adaptService(FollowsService, wrapGrpcHandler(followsHandler, "FollowsService")),
	);
	server.addService(...adaptService(FeedService, wrapGrpcHandler(feedHandler, "FeedService")));
	server.addService(
		...adaptService(SearchService, wrapGrpcHandler(searchHandler, "SearchService")),
	);
	server.addService(...adaptService(UsersService, wrapGrpcHandler(usersHandler, "UsersService")));
	server.addService(...adaptService(AdminService, wrapGrpcHandler(adminHandler, "AdminService")));
	server.addService(
		...adaptService(
			NotificationsService,
			wrapGrpcHandler(notificationsHandler, "NotificationsService"),
		),
	);
	server.addService(
		...adaptService(BookmarksService, wrapGrpcHandler(bookmarksHandler, "BookmarksService")),
	);

	return new Promise((resolve, reject) => {
		server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), (error, boundPort) => {
			if (error) {
				console.error("Failed to bind gRPC server:", error);
				reject(error);
				return;
			}
			console.log(`   gRPC server bound to port ${boundPort}`);
			resolve(server);
		});
	});
}
