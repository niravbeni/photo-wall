"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import type { TeamMember } from "@/lib/team";

type Draft = {
  slug: string;
  name: string;
  role: string;
  photo: string;
  joinedAt: string;
  focusInput: string;
  factsInput: string;
  email: string;
  linkedin: string;
};

const emptyDraft: Draft = {
  slug: "",
  name: "",
  role: "",
  photo: "",
  joinedAt: "",
  focusInput: "",
  factsInput: "",
  email: "",
  linkedin: "",
};

function toDraft(m: TeamMember): Draft {
  return {
    slug: m.slug,
    name: m.name,
    role: m.role ?? "",
    photo: m.photo ?? "",
    joinedAt: m.joinedAt ?? "",
    focusInput: (m.focusAreas ?? []).join("\n"),
    factsInput: (m.personalFacts ?? []).join("\n"),
    email: m.email ?? "",
    linkedin: m.linkedin ?? "",
  };
}

function splitLines(input: string) {
  return input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function fromDraft(d: Draft): Partial<TeamMember> {
  return {
    slug: d.slug.trim(),
    name: d.name.trim(),
    role: d.role.trim(),
    photo: d.photo.trim(),
    joinedAt: d.joinedAt.trim(),
    focusAreas: splitLines(d.focusInput),
    personalFacts: splitLines(d.factsInput),
    email: d.email.trim(),
    linkedin: d.linkedin.trim(),
  };
}

export default function AdminPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showList, setShowList] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isNew = editingSlug === null;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members", { cache: "no-store" });
      const json = (await res.json()) as { members: TeamMember[] };
      setMembers(json.members ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const startNew = () => {
    setEditingSlug(null);
    setDraft(emptyDraft);
    setError(null);
    setSuccess(null);
    setShowList(false);
  };

  const startEdit = (m: TeamMember) => {
    setEditingSlug(m.slug);
    setDraft(toDraft(m));
    setError(null);
    setSuccess(null);
    setShowList(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = fromDraft(draft);
      const url = isNew
        ? "/api/members"
        : `/api/members/${encodeURIComponent(editingSlug!)}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      setSuccess(isNew ? "Member added" : "Changes saved");
      await refresh();
      if (json.member?.slug) {
        setEditingSlug(json.member.slug);
        setDraft(toDraft(json.member));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file: File) => {
    setError(null);
    setSuccess(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const hint = draft.slug.trim() || draft.name.trim();
      if (hint) body.append("slug", hint);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      update("photo", json.url as string);
      setSuccess("Photo uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDelete = async () => {
    if (!editingSlug) return;
    if (!confirm("Delete this member? This cannot be undone.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/members/${encodeURIComponent(editingSlug)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to delete");
      }
      await refresh();
      startNew();
      setSuccess("Member deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const heading = useMemo(
    () => (isNew ? "Add team member" : `Edit: ${draft.name || "—"}`),
    [isNew, draft.name],
  );

  return (
    <main className="flex flex-col min-h-[100dvh] pb-20 bg-[color:var(--ink)] text-white">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Link>
        <span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--slate-2)]">
          CMS
        </span>
      </header>

      <section className="px-6">
        <h1 className="text-2xl font-medium">Team CMS</h1>
        <p className="mt-1 text-sm text-[color:var(--slate-2)]">
          Add, edit, or remove team members. Saves to{" "}
          <code className="text-[color:var(--lime)]">data/team.json</code>.
        </p>
      </section>

      <section className="px-4 mt-4">
        <div className="px-2 mb-2 flex items-center justify-between">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--slate-2)]">
            Members {loading ? "" : `(${members.length})`}
          </h2>
          {members.length > 0 && (
            <button
              onClick={() => setShowList((v) => !v)}
              className="text-[11px] text-[color:var(--lime)] font-medium"
            >
              {showList ? "Hide" : "Show"}
            </button>
          )}
        </div>
        {showList && (
          <ul className="flex flex-col gap-1">
            {members.map((m) => {
              const active = editingSlug === m.slug;
              return (
                <li key={m.slug}>
                  <button
                    onClick={() => startEdit(m)}
                    className={`w-full text-left flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
                      active
                        ? "bg-[color:var(--lime)] text-[color:var(--ink)]"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <Avatar name={m.name} photo={m.photo} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p
                        className={`truncate text-xs ${
                          active
                            ? "opacity-75"
                            : "text-[color:var(--slate-2)]"
                        }`}
                      >
                        {m.role || m.slug}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="px-6 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{heading}</h2>
          {!isNew && (
            <Link
              href={`/member/${editingSlug}`}
              target="_blank"
              className="text-xs font-medium underline text-[color:var(--lime)]"
            >
              View page ↗
            </Link>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
          <Field label="Name *">
            <input
              className="input"
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </Field>
          <Field
            label="Slug"
            hint={
              isNew
                ? "Leave blank to auto-generate from name"
                : "Changing the slug changes the URL"
            }
          >
            <input
              className="input"
              value={draft.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder={isNew ? "auto" : ""}
            />
          </Field>
          <Field label="Role / title">
            <input
              className="input"
              value={draft.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Interaction Design Lead"
            />
          </Field>
          <Field
            label="Photo"
            hint="Upload a file or paste a URL. Files save to /public/members."
          >
            <div className="flex items-start gap-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {draft.photo ? (
                  <Image
                    src={draft.photo}
                    alt="Preview"
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-[color:var(--slate-2)] text-center px-1">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-full bg-[color:var(--lime)] text-[color:var(--ink)] text-xs font-medium px-3 py-1.5 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload file"}
                  </button>
                  {draft.photo && (
                    <button
                      type="button"
                      onClick={() => update("photo", "")}
                      className="text-xs text-[color:var(--slate-2)] underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                  }}
                />
                <input
                  className="input"
                  value={draft.photo}
                  onChange={(e) => update("photo", e.target.value)}
                  placeholder="/members/kathir.jpg or https://…"
                />
              </div>
            </div>
          </Field>
          <Field label="At IDEO since">
            <input
              className="input"
              value={draft.joinedAt}
              onChange={(e) => update("joinedAt", e.target.value)}
              placeholder="December, 2021"
            />
          </Field>
          <Field label="My focus at IDEO" hint="One bullet per line">
            <textarea
              className="input min-h-[96px]"
              value={draft.focusInput}
              onChange={(e) => update("focusInput", e.target.value)}
              placeholder={"AI + Product Design\nMaking our crazy ideas tangible"}
            />
          </Field>
          <Field
            label="What you won't learn from my bio"
            hint="One bullet per line"
          >
            <textarea
              className="input min-h-[96px]"
              value={draft.factsInput}
              onChange={(e) => update("factsInput", e.target.value)}
              placeholder={"I use a lot of poker analogies\nDangerously optimistic"}
            />
          </Field>
          <Field label="Email">
            <input
              className="input"
              type="email"
              value={draft.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@ideo.com"
            />
          </Field>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[color:var(--slate-2)]">
              Show LinkedIn button
            </span>
            <button
              type="button"
              onClick={() => update("linkedin", draft.linkedin ? "" : "https://www.linkedin.com/in/")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                draft.linkedin ? "bg-[color:var(--lime)]" : "bg-white/15"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  draft.linkedin ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {draft.linkedin && (
            <Field label="LinkedIn URL">
              <input
                className="input"
                value={draft.linkedin}
                onChange={(e) => update("linkedin", e.target.value)}
                placeholder="https://www.linkedin.com/in/username"
              />
            </Field>
          )}

          {error && (
            <p className="text-sm text-red-200 bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-[color:var(--ink)] bg-[color:var(--lime)] rounded-xl px-3 py-2">
              {success}
            </p>
          )}

          <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-[color:var(--ink)]/95 backdrop-blur border-t border-white/10 flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-[color:var(--lime)] text-[color:var(--ink)] text-sm font-medium py-3 disabled:opacity-50"
            >
              {saving ? "Saving..." : isNew ? "Add member" : "Save changes"}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="rounded-full border border-red-400/40 text-red-300 text-sm font-medium px-4 py-3 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </section>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.04);
          color: #fff;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }
        .input::placeholder {
          color: rgba(255,255,255,0.35);
        }
        .input:focus {
          border-color: var(--lime);
          box-shadow: 0 0 0 3px rgba(217,255,0,0.18);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[color:var(--slate-2)]">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[11px] text-[color:var(--slate-2)] opacity-80">
          {hint}
        </span>
      )}
    </label>
  );
}
