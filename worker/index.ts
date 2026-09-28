import { parseContactBody, type ContactMessage } from "../src/contact";

interface Env {
  CONTACT_TO: string;
  CONTACT_FROM: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
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

    if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
      console.error("Contact mail is not configured");
      return json({ ok: false }, 500);
    }

    const ip = request.headers.get("cf-connecting-ip");
    const human = await verifyTurnstile(parsed.value.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!human) return json({ ok: false }, 400);

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
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: message.email,
      subject: `Portfolio: ${message.name}`.slice(0, 200),
      text: `${message.name}\n${message.email}\n\n${message.message}`,
    }),
  });
  if (!response.ok) {
    console.error("Resend rejected the contact message", response.status);
    return false;
  }
  return true;
}

function json(body: { ok: boolean }, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
