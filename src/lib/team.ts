import { put, list } from "@vercel/blob";

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

type TeamFile = {
  members: TeamMember[];
};

const DATA_BLOB_NAME = "team-data.json";

async function findDataBlobUrl(): Promise<string | null> {
  const { blobs } = await list({ prefix: DATA_BLOB_NAME });
  return blobs.length > 0 ? blobs[0].url : null;
}

async function readData(): Promise<TeamFile> {
  try {
    const url = await findDataBlobUrl();
    if (!url) return { members: [] };
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { members: [] };
    const parsed = (await res.json()) as TeamFile;
    return parsed.members ? parsed : { members: [] };
  } catch {
    return { members: [] };
  }
}

async function writeData(data: TeamFile): Promise<void> {
  await put(DATA_BLOB_NAME, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function listMembers(): Promise<TeamMember[]> {
  const data = await readData();
  return data.members.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMember(slug: string): Promise<TeamMember | null> {
  const data = await readData();
  return data.members.find((m) => m.slug === slug) ?? null;
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
  const data = await readData();
  const normalized = normalizeMember(member);

  if (!normalized.slug) {
    throw new Error("A name or slug is required");
  }

  const targetSlug = originalSlug ?? normalized.slug;
  const existingIdx = data.members.findIndex((m) => m.slug === targetSlug);

  if (existingIdx === -1) {
    if (data.members.some((m) => m.slug === normalized.slug)) {
      throw new Error(`A member with slug "${normalized.slug}" already exists`);
    }
    data.members.push(normalized);
  } else {
    if (
      normalized.slug !== targetSlug &&
      data.members.some((m) => m.slug === normalized.slug)
    ) {
      throw new Error(`A member with slug "${normalized.slug}" already exists`);
    }
    data.members[existingIdx] = normalized;
  }

  await writeData(data);
  return normalized;
}

export async function deleteMember(slug: string): Promise<boolean> {
  const data = await readData();
  const before = data.members.length;
  data.members = data.members.filter((m) => m.slug !== slug);
  if (data.members.length === before) return false;
  await writeData(data);
  return true;
}
