syntax = "proto3";
package chirp.notifications;

import "common.proto";

service NotificationsService {
  rpc GetNotifications(GetNotificationsRequest) returns (GetNotificationsResponse);
  rpc GetUnreadCount(GetUnreadCountRequest) returns (GetUnreadCountResponse);
  rpc MarkAsRead(MarkAsReadRequest) returns (MarkAsReadResponse);
  rpc MarkAllAsRead(MarkAllAsReadRequest) returns (MarkAllAsReadResponse);
  rpc DeleteNotification(DeleteNotificationRequest) returns (DeleteNotificationResponse);
}

message Notification {
  string id = 1;
  string type = 2;
  bool read = 3;
  chirp.common.Author actor = 4;
  optional string post_id = 5;
  optional string comment_id = 6;
  optional string post_content = 7;
  optional string comment_content = 8;
  chirp.common.Timestamp created_at = 9;
}

message GetNotificationsRequest {
  string session_token = 1;
  int32 limit = 2;
  int32 offset = 3;
}

message GetNotificationsResponse {
  repeated Notification notifications = 1;
}

message GetUnreadCountRequest {
  string session_token = 1;
}

message GetUnreadCountResponse {
  int32 count = 1;
}

message MarkAsReadRequest {
  string session_token = 1;
  string notification_id = 2;
}

message MarkAsReadResponse {
  bool success = 1;
  optional string error = 2;
}

message MarkAllAsReadRequest {
  string session_token = 1;
}

message MarkAllAsReadResponse {
  bool success = 1;
  optional string error = 2;
}

message DeleteNotificationRequest {
  string session_token = 1;
  string notification_id = 2;
}

message DeleteNotificationResponse {
  bool success = 1;
  optional string error = 2;
}
