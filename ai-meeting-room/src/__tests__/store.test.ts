import { describe, it, expect, beforeEach } from "vitest";
import { useMeetingStore } from "@/store/meeting";

describe("MeetingStore", () => {
  beforeEach(() => {
    useMeetingStore.getState().reset();
  });

  it("should initialize with discussion phase", () => {
    const state = useMeetingStore.getState();
    expect(state.phase).toBe("discussion");
    expect(state.messages).toHaveLength(0);
    expect(state.isStreaming).toBe(false);
  });

  it("should add a message", () => {
    const store = useMeetingStore.getState();
    const id = store.addMessage("user", "Hello");
    const state = useMeetingStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].role).toBe("user");
    expect(state.messages[0].content).toBe("Hello");
    expect(state.messages[0].id).toBe(id);
  });

  it("should append to a message", () => {
    const store = useMeetingStore.getState();
    const id = store.addMessage("claude", "");
    store.appendToMessage(id, "Hello ");
    store.appendToMessage(id, "World");
    const state = useMeetingStore.getState();
    expect(state.messages[0].content).toBe("Hello World");
  });

  it("should update a message", () => {
    const store = useMeetingStore.getState();
    const id = store.addMessage("user", "original");
    store.updateMessage(id, "updated");
    const state = useMeetingStore.getState();
    expect(state.messages[0].content).toBe("updated");
  });

  it("should change phase", () => {
    const store = useMeetingStore.getState();
    store.setPhase("approved");
    expect(useMeetingStore.getState().phase).toBe("approved");
  });

  it("should set streaming state", () => {
    const store = useMeetingStore.getState();
    store.setStreaming(true, "msg-1");
    const state = useMeetingStore.getState();
    expect(state.isStreaming).toBe(true);
    expect(state.streamingMessageId).toBe("msg-1");
  });

  it("should set design context", () => {
    const store = useMeetingStore.getState();
    store.setDesignContext("test context");
    expect(useMeetingStore.getState().designContext).toBe("test context");
  });

  it("should add implementation logs", () => {
    const store = useMeetingStore.getState();
    store.addImplementationLog("log 1");
    store.addImplementationLog("log 2");
    const state = useMeetingStore.getState();
    expect(state.implementationLogs).toHaveLength(2);
    expect(state.implementationLogs[0]).toBe("log 1");
  });

  it("should increment retry count", () => {
    const store = useMeetingStore.getState();
    store.incrementRetry();
    store.incrementRetry();
    expect(useMeetingStore.getState().retryCount).toBe(2);
  });

  it("should reset retry count", () => {
    const store = useMeetingStore.getState();
    store.incrementRetry();
    store.resetRetry();
    expect(useMeetingStore.getState().retryCount).toBe(0);
  });

  it("should reset all state", () => {
    const store = useMeetingStore.getState();
    store.addMessage("user", "test");
    store.setPhase("implementing");
    store.setDesignContext("ctx");
    store.addImplementationLog("log");
    store.incrementRetry();

    store.reset();
    const state = useMeetingStore.getState();
    expect(state.phase).toBe("discussion");
    expect(state.messages).toHaveLength(0);
    expect(state.designContext).toBe("");
    expect(state.implementationLogs).toHaveLength(0);
    expect(state.retryCount).toBe(0);
  });
});
