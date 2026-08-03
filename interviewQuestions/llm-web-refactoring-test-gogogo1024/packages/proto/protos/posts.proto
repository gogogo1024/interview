syntax = "proto3";
package chirp.posts;

import "common.proto";

service PostsService {
  rpc CreatePost(CreatePostRequest) returns (CreatePostResponse);
  rpc GetPost(GetPostRequest) returns (PostResponse);
  rpc UpdatePost(UpdatePostRequest) returns (UpdatePostResponse);
  rpc DeletePost(DeletePostRequest) returns (DeletePostResponse);
  rpc GetPosts(GetPostsRequest) returns (PostsResponse);
  rpc GetUserPosts(GetUserPostsRequest) returns (PostsResponse);
}

message CreatePostRequest {
  string session_token = 1;
  string content = 2;
}

message CreatePostResponse {
  bool success = 1;
  string post_id = 2;
  optional string error = 3;
}

message GetPostRequest {
  string post_id = 1;
  optional string session_token = 2;
}

message PostResponse {
  string id = 1;
  string content = 2;
  chirp.common.Timestamp created_at = 3;
  chirp.common.Timestamp updated_at = 4;
  chirp.common.Author author = 5;
  int32 like_count = 6;
  int32 comment_count = 7;
  bool is_liked = 8;
}

message UpdatePostRequest {
  string session_token = 1;
  string post_id = 2;
  string content = 3;
}

message UpdatePostResponse {
  bool success = 1;
  optional string error = 2;
}

message DeletePostRequest {
  string session_token = 1;
  string post_id = 2;
}

message DeletePostResponse {
  bool success = 1;
  optional string error = 2;
}

message GetPostsRequest {
  chirp.common.PaginationRequest pagination = 1;
  optional string session_token = 2;
}

message GetUserPostsRequest {
  string username = 1;
  optional string session_token = 2;
}

message PostsResponse {
  repeated PostResponse posts = 1;
}
