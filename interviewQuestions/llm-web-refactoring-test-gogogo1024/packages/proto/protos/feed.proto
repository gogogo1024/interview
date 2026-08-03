syntax = "proto3";
package chirp.feed;

import "common.proto";
import "posts.proto";

service FeedService {
  rpc GetHomeFeed(GetHomeFeedRequest) returns (chirp.posts.PostsResponse);
  rpc GetExploreFeed(GetExploreFeedRequest) returns (chirp.posts.PostsResponse);
}

message GetHomeFeedRequest {
  string session_token = 1;
  chirp.common.PaginationRequest pagination = 2;
}

message GetExploreFeedRequest {
  chirp.common.PaginationRequest pagination = 1;
  optional string session_token = 2;
}
