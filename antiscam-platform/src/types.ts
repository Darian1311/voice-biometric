export interface VictimProfile {
  id: string;
  user_id: string;
  phone: string;
  subscription_active: boolean;
  whitelist_enabled: boolean;
}

export interface TrustedContact {
  id: string;
  victim_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  biometric_profile_id: string | null;
  voice_enrolled: boolean;
  can_view_scam_logs: boolean;
}

export interface ActiveCall {
  callControlId: string;
  fromNumber: string;
  victimId: string;
  victimPhone: string;
  outboundCallControlId?: string;
  transcriptBuffer: string;
  // Raw mulaw audio accumulated for biometric chunks
  audioBuffer: Buffer[];
  audioBufferMs: number;
  combinedScore: number;
  keywordHits: Set<string>;
  lastBiometricScore: number;
  resolved: boolean;
}

export interface TelnyxCallPayload {
  call_control_id: string;
  call_leg_id: string;
  call_session_id: string;
  from: string;
  to: string;
  direction: 'incoming' | 'outgoing';
  state: string;
  [key: string]: unknown;
}

export interface TelnyxWebhookEvent {
  data: {
    event_type: string;
    id: string;
    payload: TelnyxCallPayload;
  };
  meta?: Record<string, unknown>;
}
