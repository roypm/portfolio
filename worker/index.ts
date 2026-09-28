import { parseContactBody, type ContactMessage } from "../src/contact";

export interface Env {
  EMAIL: { send(message: EmailMessageBuilder): Promise<EmailSendResult> };
  CONTACT_TO: string;
  CONTACT_FROM: string;
  /** Optional. When set, every submission must pass Turnstile. */
  TURNSTILE_SECRET_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path !== "/api/contact") return json({ ok: false }, 404);
    if (request.method !== "POST") return json({ ok: false }, 405);
    if (!sameOrigin(request)) return json({ ok: false }, 403);

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) return json({ ok: false }, 415);

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > 20_000) return json({ ok: false }, 413);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false }, 400);
    }

    const parsed = parseContactBody(body);
    if (!parsed.ok) return json({ ok: false }, 400);

    if (!env.EMAIL || !env.CONTACT_TO || !env.CONTACT_FROM) {
      console.error("Contact mail is not configured");
      return json({ ok: false }, 500);
    }

    if (env.TURNSTILE_SECRET_KEY) {
      if (!parsed.value.turnstileToken) return json({ ok: false }, 400);
      const ip = request.headers.get("cf-connecting-ip");
      const human = await verifyTurnstile(parsed.value.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
      if (!human) return json({ ok: false }, 400);
    }

    const sent = await sendMail(env, parsed.value);
    if (!sent) return json({ ok: false }, 502);
    return json({ ok: true }, 200);
  },
};

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

async function sendMail(env: Env, message: ContactMessage): Promise<boolean> {
  try {
    await env.EMAIL.send({
      from: { email: env.CONTACT_FROM, name: "Portfolio" },
      to: env.CONTACT_TO,
      replyTo: message.email,
      subject: `Portfolio: ${message.name}`.slice(0, 200),
      text: `${message.name}\n${message.email}\n\n${message.message}`,
    });
    return true;
  } catch (error) {
    const code = (error as { code?: string }).code ?? "unknown";
    console.error("Email Service rejected the contact message", code);
    return false;
  }
}

function json(body: { ok: boolean }, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
