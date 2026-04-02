import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendNotification } from "@/lib/notify";

describe("sendNotification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not call fetch when NTFY_TOPIC is empty", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    vi.stubEnv("NTFY_TOPIC", "");
    await sendNotification("title", "body");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should call fetch with correct params when NTFY_TOPIC is set", async () => {
    vi.stubEnv("NTFY_TOPIC", "test-topic");
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(new Response());
    await sendNotification("Test Title", "Test Body", "high");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://ntfy.sh/test-topic",
      expect.objectContaining({
        method: "POST",
        body: "Test Body",
      })
    );
  });

  it("should handle fetch errors gracefully", async () => {
    vi.stubEnv("NTFY_TOPIC", "test-topic");
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await sendNotification("title", "body");
    expect(consoleSpy).toHaveBeenCalled();
  });
});
