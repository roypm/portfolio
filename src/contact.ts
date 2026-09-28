const NAME_MAX = 80;
const EMAIL_MAX = 254;
const MESSAGE_MAX = 4000;
const TOKEN_MAX = 2048;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
};

export type ContactParse =
  | { ok: true; value: ContactMessage }
  | { ok: false; reason: "honeypot" | "invalid" };

function singleLine(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return null;
  return trimmed;
}

function messageText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(trimmed)) return null;
  return trimmed;
}

/** Name, email, and message only. The token and honeypot are checked in `parseContactBody`. */
export function visibleContact(
  name: unknown,
  email: unknown,
  message: unknown,
): Pick<ContactMessage, "name" | "email" | "message"> | null {
  const cleanName = singleLine(name, NAME_MAX);
  const cleanEmail = singleLine(email, EMAIL_MAX);
  const cleanMessage = messageText(message, MESSAGE_MAX);
  if (!cleanName || !cleanEmail || !cleanMessage) return null;
  if (!emailPattern.test(cleanEmail)) return null;
  return { name: cleanName, email: cleanEmail, message: cleanMessage };
}

export function parseContactBody(body: unknown): ContactParse {
  if (!body || typeof body !== "object") return { ok: false, reason: "invalid" };
  const record = body as Record<string, unknown>;
  const companyRaw = record.company;
  const company =
    companyRaw == null ? "" : typeof companyRaw === "string" ? companyRaw.trim() : "filled";
  if (company) return { ok: false, reason: "honeypot" };

  const visible = visibleContact(record.name, record.email, record.message);
  const turnstileToken = singleLine(record.turnstileToken, TOKEN_MAX);
  if (!visible || !turnstileToken) return { ok: false, reason: "invalid" };
  return { ok: true, value: { ...visible, turnstileToken } };
}
