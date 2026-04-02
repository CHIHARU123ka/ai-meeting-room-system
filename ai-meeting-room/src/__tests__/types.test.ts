import { describe, it, expect } from "vitest";
import type { Message, MeetingPhase, Role, StreamChunk, ImplementationStatus } from "@/types";

describe("Types", () => {
  it("should create a valid Message", () => {
    const msg: Message = {
      id: "test-1",
      role: "claude",
      content: "Hello",
      timestamp: Date.now(),
    };
    expect(msg.role).toBe("claude");
    expect(msg.content).toBe("Hello");
  });

  it("should accept all Role values", () => {
    const roles: Role[] = ["user", "claude", "gemini", "system"];
    expect(roles).toHaveLength(4);
  });

  it("should accept all MeetingPhase values", () => {
    const phases: MeetingPhase[] = [
      "discussion",
      "approved",
      "implementing",
      "completed",
      "error",
    ];
    expect(phases).toHaveLength(5);
  });

  it("should create valid StreamChunk", () => {
    const chunk: StreamChunk = {
      role: "claude",
      content: "partial",
      done: false,
    };
    expect(chunk.done).toBe(false);
  });

  it("should create valid ImplementationStatus", () => {
    const status: ImplementationStatus = {
      phase: "frontend",
      agent: "Frontend",
      progress: 50,
      log: "Building...",
    };
    expect(status.progress).toBe(50);
  });
});
