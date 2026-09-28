import { describe, expect, it } from "vitest";
import { parseContactBody, visibleContact } from "../src/contact";

const validBody = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "An idea for a project.",
  company: "",
  turnstileToken: "token",
};

describe("visibleContact", () => {
  it("trims the fields it returns", () => {
    expect(visibleContact("  Ada  ", " ada@example.com ", "  Hello  ")).toEqual({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
    });
  });

  it("keeps line breaks inside the message", () => {
    const result = visibleContact("Ada", "ada@example.com", "First line\nSecond line");
    expect(result?.message).toBe("First line\nSecond line");
  });

  it("rejects a blank field", () => {
    expect(visibleContact("   ", "ada@example.com", "Hello")).toBeNull();
    expect(visibleContact("Ada", "ada@example.com", "\n\n")).toBeNull();
  });

  it("rejects an address without a domain", () => {
    expect(visibleContact("Ada", "ada@example", "Hello")).toBeNull();
    expect(visibleContact("Ada", "ada example.com", "Hello")).toBeNull();
  });

  it("rejects a name longer than 80 characters", () => {
    expect(visibleContact("a".repeat(81), "ada@example.com", "Hello")).toBeNull();
    expect(visibleContact("a".repeat(80), "ada@example.com", "Hello")).not.toBeNull();
  });

  it("rejects a message longer than 4000 characters", () => {
    expect(visibleContact("Ada", "ada@example.com", "a".repeat(4001))).toBeNull();
    expect(visibleContact("Ada", "ada@example.com", "a".repeat(4000))).not.toBeNull();
  });

  it("rejects header injection through a line break in the name", () => {
    expect(visibleContact("Ada\nBcc: victim@example.com", "ada@example.com", "Hello")).toBeNull();
    expect(visibleContact("Ada", "ada@example.com\rBcc: victim@example.com", "Hello")).toBeNull();
  });

  it("rejects values that are not strings", () => {
    expect(visibleContact(42, "ada@example.com", "Hello")).toBeNull();
    expect(visibleContact("Ada", null, "Hello")).toBeNull();
    expect(visibleContact("Ada", "ada@example.com", undefined)).toBeNull();
  });
});

describe("parseContactBody", () => {
  it("accepts a complete message", () => {
    const parsed = parseContactBody(validBody);
    expect(parsed).toEqual({
      ok: true,
      value: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "An idea for a project.",
        turnstileToken: "token",
      },
    });
  });

  it("accepts a body with no honeypot field at all", () => {
    const { company, ...withoutHoneypot } = validBody;
    expect(company).toBe("");
    expect(parseContactBody(withoutHoneypot).ok).toBe(true);
  });

  it("reports a filled honeypot separately from invalid input", () => {
    expect(parseContactBody({ ...validBody, company: "spam" })).toEqual({
      ok: false,
      reason: "honeypot",
    });
    expect(parseContactBody({ ...validBody, company: 1 })).toEqual({
      ok: false,
      reason: "honeypot",
    });
  });

  it("allows a missing Turnstile token when Turnstile is off", () => {
    expect(parseContactBody({ ...validBody, turnstileToken: "" })).toEqual({
      ok: true,
      value: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "An idea for a project.",
        turnstileToken: "",
      },
    });
    expect(parseContactBody({ ...validBody, turnstileToken: undefined })).toEqual({
      ok: true,
      value: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "An idea for a project.",
        turnstileToken: "",
      },
    });
  });

  it("rejects a Turnstile token that is not a string", () => {
    expect(parseContactBody({ ...validBody, turnstileToken: 1 })).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("rejects a bodyless or non-object payload", () => {
    expect(parseContactBody(null).ok).toBe(false);
    expect(parseContactBody("name=Ada").ok).toBe(false);
  });
});
