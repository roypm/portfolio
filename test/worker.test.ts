import { SELF, env } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import worker, { type Env } from "../worker/index";

const origin = "https://www.roypm.es";
const endpoint = `${origin}/api/contact`;

const message = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "An idea for a project.",
  company: "",
  turnstileToken: "token",
};

const turnstileUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface OutboundCall {
  url: string;
  method: string;
  body: string;
}

let outbound: OutboundCall[] = [];
let turnstileAccepts = true;
let send: Mock<Env["EMAIL"]["send"]>;

/** The Worker under test shares this isolate, so its outbound calls hit this stub. */
beforeEach(() => {
  outbound = [];
  turnstileAccepts = true;
  send = vi.fn<Env["EMAIL"]["send"]>(async () => ({ messageId: "mail-id" }));

  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input as RequestInfo, init);
    // Bodies are read here because they cannot leave the Worker's request context.
    outbound.push({
      url: request.url,
      method: request.method,
      body: new TextDecoder().decode(await request.arrayBuffer()),
    });
    if (request.url === turnstileUrl) {
      return Response.json({ success: turnstileAccepts });
    }
    throw new Error(`Unexpected outbound request to ${request.url}`);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function testEnv(overrides: Partial<Env> = {}): Env {
  return {
    EMAIL: { send },
    CONTACT_TO: env.CONTACT_TO,
    CONTACT_FROM: env.CONTACT_FROM,
    ...overrides,
  };
}

function submit(body: unknown, overrides: Partial<Env> = {}) {
  const request = new Request(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });
  return worker.fetch(request, testEnv(overrides));
}

describe("deployed configuration", () => {
  it("binds the mail sender and the contact addresses", () => {
    expect(env.EMAIL).toBeDefined();
    expect(env.CONTACT_TO).toBe("roymoli15@gmail.com");
    expect(env.CONTACT_FROM).toBe("contact@roypm.es");
  });
});

describe("routing", () => {
  it("leaves every path but its own endpoint alone", async () => {
    for (const path of ["/", "/en/", "/api/", "/api/contact/extra"]) {
      const response = await SELF.fetch(`${origin}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin },
        body: "{}",
      });
      expect(response.status, path).toBe(404);
    }
  });

  it("rejects a method other than POST", async () => {
    const response = await SELF.fetch(endpoint);
    expect(response.status).toBe(405);
  });

  it("accepts the endpoint with a trailing slash", async () => {
    const request = new Request(`${endpoint}/`, {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify(message),
    });
    const response = await worker.fetch(request, testEnv());
    expect(response.status).toBe(200);
  });
});

describe("request guards", () => {
  it("rejects a submission with no Origin header", async () => {
    const response = await SELF.fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(message),
    });
    expect(response.status).toBe(403);
    expect(outbound).toHaveLength(0);
  });

  it("rejects a submission from another site", async () => {
    const response = await SELF.fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://evil.example" },
      body: JSON.stringify(message),
    });
    expect(response.status).toBe(403);
    expect(outbound).toHaveLength(0);
  });

  it("rejects a body that is not JSON", async () => {
    const response = await SELF.fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "text/plain", origin },
      body: JSON.stringify(message),
    });
    expect(response.status).toBe(415);
  });

  it("rejects malformed JSON", async () => {
    const response = await SELF.fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: "{not json",
    });
    expect(response.status).toBe(400);
  });
});

describe("validation", () => {
  it("rejects an invalid address", async () => {
    const response = await submit({ ...message, email: "not-an-address" });
    expect(response.status).toBe(400);
    expect(outbound).toHaveLength(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects an empty message", async () => {
    const response = await submit({ ...message, message: "   " });
    expect(response.status).toBe(400);
  });

  it("rejects a message over the length limit", async () => {
    const response = await submit({ ...message, message: "a".repeat(4001) });
    expect(response.status).toBe(400);
  });

  it("accepts a submission with no Turnstile token when Turnstile is off", async () => {
    const response = await submit({ ...message, turnstileToken: "" });
    expect(response.status).toBe(200);
    expect(outbound).toHaveLength(0);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("drops a submission that filled the honeypot", async () => {
    const response = await submit({ ...message, company: "spam" });
    expect(response.status).toBe(400);
    expect(outbound).toHaveLength(0);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("Turnstile", () => {
  const withTurnstile = { TURNSTILE_SECRET_KEY: "test-turnstile-secret" };

  it("verifies the token when a secret is configured", async () => {
    await submit(message, withTurnstile);

    const verification = outbound.find((call) => call.url === turnstileUrl);
    expect(verification?.method).toBe("POST");
    const sent = new URLSearchParams(verification?.body);
    expect(sent.get("response")).toBe("token");
    expect(sent.get("secret")).toBe("test-turnstile-secret");
  });

  it("rejects a blank token when a secret is configured", async () => {
    const response = await submit({ ...message, turnstileToken: "" }, withTurnstile);
    expect(response.status).toBe(400);
    expect(outbound).toHaveLength(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects the submission when Turnstile fails, and sends no mail", async () => {
    turnstileAccepts = false;

    const response = await submit(message, withTurnstile);

    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("mail", () => {
  it("sends the message to the configured inbox and replies to the visitor", async () => {
    const response = await submit(message);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(1);

    const mail = send.mock.calls[0][0];
    expect(mail.to).toBe("roymoli15@gmail.com");
    expect(mail.from).toEqual({ email: "contact@roypm.es", name: "Portfolio" });
    expect(mail.replyTo).toBe(message.email);
    expect(mail.subject).toContain(message.name);
    expect(mail.text).toContain(message.message);
    expect(mail.text).toContain(message.email);
  });

  it("reports a failure when Email Service rejects the message", async () => {
    send.mockRejectedValueOnce(Object.assign(new Error("not verified"), { code: "E_SENDER_NOT_VERIFIED" }));

    const response = await submit(message);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ ok: false });
  });
});
