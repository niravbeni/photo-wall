import { NextResponse } from "next/server";
import crypto from "crypto";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

const MAX_BYTES = 8 * 1024 * 1024;

function safeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const hintRaw = form.get("slug");
    const hint = typeof hintRaw === "string" ? hintRaw : "";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    const ext = ALLOWED.get(file.type);
    if (!ext) {
      return NextResponse.json(
        {
          error: `Unsupported image type (${file.type || "unknown"}). Use JPG, PNG, WEBP, GIF, or AVIF.`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_BYTES / 1024 / 1024}MB.` },
        { status: 400 },
      );
    }

    const baseName = safeSlug(hint) || safeSlug(file.name) || "photo";
    const rand = crypto.randomBytes(4).toString("hex");
    const filename = `members/${baseName}-${rand}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url, filename });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
