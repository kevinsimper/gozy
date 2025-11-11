import { describe, it, expect } from "vitest";
import { add } from "./math.js";

describe("add", () => {
  it("should add two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("should add two negative numbers", () => {
    expect(add(-2, -3)).toBe(-5);
  });

  it("should add positive and negative numbers", () => {
    expect(add(5, -3)).toBe(2);
  });

  it("should add zero", () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
  });
});
