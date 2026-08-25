import { z } from 'zod';

// Participant schema & type
export const ParticipantSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  displayName: z.string().optional(),
  joinedAt: z.string().optional(),
  muted: z.boolean().optional(),
  videoEnabled: z.boolean().optional(),
});
export type Participant = z.infer<typeof ParticipantSchema>;

// Video call session schema & type
export const VideoCallSessionSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  createdAt: z.string(),
  status: z.enum(['active', 'ended', 'paused']),
});
export type VideoCallSession = z.infer<typeof VideoCallSessionSchema>;

// Signaling message schema & type
export const SignalingMessageSchema = z.object({
  type: z.enum(['offer', 'answer', 'candidate', 'hangup', 'join']),
  from: z.string(),
  to: z.string().optional(),
  payload: z.unknown().optional(),
});
export type SignalingMessage = z.infer<typeof SignalingMessageSchema>;

export const CallStatusSchema = z.enum(['idle', 'calling', 'connected', 'ended']);
export type CallStatus = z.infer<typeof CallStatusSchema>;

export interface VideoRouter {
  createCall: {
    input: { target_user_id: string; ai_effect?: string };
    output: { call_id: string; status: CallStatus };
  };
  hangup: {
    input: { call_id: string };
    output: { success: boolean };
  };
  subscribe: {
    input: { call_id: string };
    output: { status: CallStatus; participants: string[] };
  };
}

// Router input/output schemas
export const CreateCallInputSchema = z.object({ target_user_id: z.string(), ai_effect: z.string().optional() });
export type CreateCallInput = z.infer<typeof CreateCallInputSchema>;

export const CallIdInputSchema = z.object({ call_id: z.string() });
export type CallIdInput = z.infer<typeof CallIdInputSchema>;

export const SubscribeOutputSchema = z.object({ status: CallStatusSchema, participants: z.array(z.string()) });
export type SubscribeOutput = z.infer<typeof SubscribeOutputSchema>;
