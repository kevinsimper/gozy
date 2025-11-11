import { describe, it, expect } from "vitest";
import { toWhatsAppId, fromWhatsAppId } from "./phoneNumber";

describe("phoneNumber", () => {
  describe("toWhatsAppId", () => {
    it("should convert phone number with + to WhatsApp ID", () => {
      expect(toWhatsAppId("+4540360565")).toBe("4540360565@c.us");
    });

    it("should convert phone number without + to WhatsApp ID", () => {
      expect(toWhatsAppId("4540360565")).toBe("4540360565@c.us");
    });

    it("should handle international phone numbers", () => {
      expect(toWhatsAppId("+14155552671")).toBe("14155552671@c.us");
    });
  });

  describe("fromWhatsAppId", () => {
    it("should convert WhatsApp ID to phone number with +", () => {
      expect(fromWhatsAppId("4540360565@c.us")).toBe("+4540360565");
    });

    it("should handle WhatsApp ID that already has +", () => {
      expect(fromWhatsAppId("+4540360565@c.us")).toBe("+4540360565");
    });

    it("should handle different country codes", () => {
      expect(fromWhatsAppId("14155552671@c.us")).toBe("+14155552671");
    });
  });
});
