import { appendFile, mkdir } from "fs/promises";
import path from "path";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  email?: string;
  discord?: string;
  company?: string;
  utm_source?: string;
  utm_medium?: string;
};

async function persistDevLine(payload: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "development") return;
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "waitlist.ndjson"), `${JSON.stringify(payload)}\n`, "utf8");
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.company && String(body.company).trim() !== "") {
    return Response.json({ ok: true }, { status: 200 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const discord = String(body.discord ?? "").trim().slice(0, 80);

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const createdAt = new Date().toISOString();
  const record = {
    email,
    discord: discord || undefined,
    utm_source: body.utm_source,
    utm_medium: body.utm_medium,
    createdAt,
  };

  const webhook = process.env.WAITLIST_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      if (!r.ok) {
        console.warn("[waitlist] webhook returned", r.status, await r.text().catch(() => ""));
      }
    } catch (e) {
      console.error("[waitlist] webhook failed", e);
      return Response.json({ error: "Could not save signup. Try again later." }, { status: 502 });
    }
  } else {
    await persistDevLine(record).catch((e) => console.error("[waitlist] dev persist failed", e));
    if (process.env.NODE_ENV === "production") {
      console.info("[waitlist] signup (set WAITLIST_WEBHOOK_URL to persist)", email);
    }
  }

  return Response.json({ ok: true }, { status: 200 });
}
