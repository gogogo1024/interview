syntax = "proto3";
package chirp.search;

import "common.proto";
import "posts.proto";

service SearchService {
  rpc SearchPosts(SearchRequest) returns (chirp.posts.PostsResponse);
  rpc SearchUsers(SearchRequest) returns (UsersResponse);
}

message SearchRequest {
  string query = 1;
  optional string session_token = 2;
}

message UserSearchResult {
  string id = 1;
  string username = 2;
  string display_name = 3;
  optional string avatar_url = 4;
  optional string bio = 5;
}

message UsersResponse {
  repeated UserSearchResult users = 1;
}
