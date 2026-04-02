export type Role = "user" | "claude" | "gemini" | "system";

export type MeetingPhase = "discussion" | "approved" | "implementing" | "completed" | "error";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  streaming?: boolean;
}

export interface MeetingState {
  phase: MeetingPhase;
  messages: Message[];
  requirement: string;
  designApproved: boolean;
  implementationLog: string[];
  retryCount: number;
  maxRetries: number;
}

export interface StreamChunk {
  role: Role;
  content: string;
  done: boolean;
}

export interface ImplementationStatus {
  phase: string;
  agent: string;
  progress: number;
  log: string;
  error?: string;
}
