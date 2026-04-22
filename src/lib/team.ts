import { supabase } from "./supabase";

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  photo?: string;
  joinedAt?: string;
  focusAreas?: string[];
  personalFacts?: string[];
  email?: string;
  linkedin?: string;
};

type MemberRow = {
  slug: string;
  name: string;
  role: string;
  photo: string;
  joined_at: string;
  focus_areas: string[];
  personal_facts: string[];
  email: string;
  linkedin: string;
};

function rowToMember(row: MemberRow): TeamMember {
  return {
    slug: row.slug,
    name: row.name,
    role: row.role,
    photo: row.photo,
    joinedAt: row.joined_at,
    focusAreas: row.focus_areas,
    personalFacts: row.personal_facts,
    email: row.email,
    linkedin: row.linkedin,
  };
}

function memberToRow(m: TeamMember): MemberRow {
  return {
    slug: m.slug,
    name: m.name,
    role: m.role ?? "",
    photo: m.photo ?? "",
    joined_at: m.joinedAt ?? "",
    focus_areas: (m.focusAreas ?? []).filter(Boolean),
    personal_facts: (m.personalFacts ?? []).filter(Boolean),
    email: m.email ?? "",
    linkedin: m.linkedin ?? "",
  };
}

export async function listMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return (data as MemberRow[]).map(rowToMember);
}

export async function getMember(slug: string): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(error.message);
  }
  return rowToMember(data as MemberRow);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeMember(input: Partial<TeamMember>): TeamMember {
  if (!input.name) throw new Error("Name is required");
  return {
    slug: input.slug?.trim() || slugify(input.name),
    name: input.name.trim(),
    role: input.role?.trim() ?? "",
    photo: input.photo?.trim() ?? "",
    joinedAt: input.joinedAt?.trim() ?? "",
    focusAreas: (input.focusAreas ?? [])
      .map((t) => t.trim())
      .filter(Boolean),
    personalFacts: (input.personalFacts ?? [])
      .map((t) => t.trim())
      .filter(Boolean),
    email: input.email?.trim() ?? "",
    linkedin: input.linkedin?.trim() ?? "",
  };
}

export async function upsertMember(
  member: TeamMember,
  originalSlug?: string,
): Promise<TeamMember> {
  const normalized = normalizeMember(member);

  if (!normalized.slug) {
    throw new Error("A name or slug is required");
  }

  if (originalSlug && originalSlug !== normalized.slug) {
    const { data: existing } = await supabase
      .from("members")
      .select("slug")
      .eq("slug", normalized.slug)
      .single();

    if (existing) {
      throw new Error(`A member with slug "${normalized.slug}" already exists`);
    }

    await supabase.from("members").delete().eq("slug", originalSlug);
  }

  const row = memberToRow(normalized);
  const { error } = await supabase
    .from("members")
    .upsert(row, { onConflict: "slug" });

  if (error) throw new Error(error.message);
  return normalized;
}

export async function deleteMember(slug: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("members")
    .delete({ count: "exact" })
    .eq("slug", slug);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
