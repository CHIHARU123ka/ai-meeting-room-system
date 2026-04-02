import { create } from "zustand";
import type { Message, MeetingPhase, Role } from "@/types";

interface MeetingStore {
  phase: MeetingPhase;
  messages: Message[];
  requirement: string;
  designContext: string;
  implementationLogs: string[];
  retryCount: number;
  isStreaming: boolean;
  streamingMessageId: string | null;

  setPhase: (phase: MeetingPhase) => void;
  setRequirement: (req: string) => void;
  addMessage: (role: Role, content: string) => string;
  updateMessage: (id: string, content: string) => void;
  appendToMessage: (id: string, chunk: string) => void;
  setStreaming: (streaming: boolean, messageId?: string | null) => void;
  setDesignContext: (ctx: string) => void;
  addImplementationLog: (log: string) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  reset: () => void;
}

let messageCounter = 0;

export const useMeetingStore = create<MeetingStore>((set, get) => ({
  phase: "discussion",
  messages: [],
  requirement: "",
  designContext: "",
  implementationLogs: [],
  retryCount: 0,
  isStreaming: false,
  streamingMessageId: null,

  setPhase: (phase) => set({ phase }),

  setRequirement: (requirement) => set({ requirement }),

  addMessage: (role, content) => {
    const id = `msg-${++messageCounter}-${Date.now()}`;
    set((state) => ({
      messages: [
        ...state.messages,
        { id, role, content, timestamp: Date.now() },
      ],
    }));
    return id;
  },

  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content } : m
      ),
    })),

  appendToMessage: (id, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + chunk } : m
      ),
    })),

  setStreaming: (isStreaming, messageId = null) =>
    set({ isStreaming, streamingMessageId: messageId }),

  setDesignContext: (designContext) => set({ designContext }),

  addImplementationLog: (log) =>
    set((state) => ({
      implementationLogs: [...state.implementationLogs, log],
    })),

  incrementRetry: () =>
    set((state) => ({ retryCount: state.retryCount + 1 })),

  resetRetry: () => set({ retryCount: 0 }),

  reset: () =>
    set({
      phase: "discussion",
      messages: [],
      requirement: "",
      designContext: "",
      implementationLogs: [],
      retryCount: 0,
      isStreaming: false,
      streamingMessageId: null,
    }),
}));
