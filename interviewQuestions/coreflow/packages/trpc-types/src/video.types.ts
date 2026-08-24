export type VideoCallSession = {
  id: string;
  roomId: string;
  createdAt: string;
  status: 'active' | 'ended' | 'paused';
};

export type Participant = {
  id: string;
  userId?: string;
  displayName?: string;
  joinedAt?: string;
  muted?: boolean;
  videoEnabled?: boolean;
};

export type SignalingMessage = {
  type: 'offer' | 'answer' | 'candidate' | 'hangup' | 'join';
  from: string;
  to?: string;
  payload?: unknown;
};
