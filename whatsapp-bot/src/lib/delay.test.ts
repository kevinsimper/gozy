import { describe, it, expect, vi } from "vitest";
import { calculateReplyDelay, sleep } from "./delay";

describe("delay", () => {
  describe("calculateReplyDelay", () => {
    it("should return a delay between 500ms and 5000ms for short messages", () => {
      const delay = calculateReplyDelay(10);
      expect(delay).toBeGreaterThanOrEqual(500);
      expect(delay).toBeLessThanOrEqual(5000);
    });

    it("should cap delay at 5000ms for very long messages", () => {
      const delay = calculateReplyDelay(10000);
      expect(delay).toBe(5000);
    });

    it("should increase delay with message length", () => {
      const shortDelay = calculateReplyDelay(5);
      const longDelay = calculateReplyDelay(100);
      expect(longDelay).toBeGreaterThan(shortDelay);
    });
  });

  describe("sleep", () => {
    it("should resolve after specified milliseconds", async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(150);
    });

    it("should work with setTimeout", async () => {
      vi.useFakeTimers();
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await promise;
      vi.useRealTimers();
    });
  });
});
