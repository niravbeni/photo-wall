import { promises as fs } from "fs";
import path from "path";

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

const DATA_PATH = path.join(process.cwd(), "data", "team.json");

async function readFile(): Promise<TeamFile> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as TeamFile;
    if (!parsed.members) return { members: [] };
    return parsed;
  } catch {
    return { members: [] };
  }
}

async function writeFile(data: TeamFile): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function listMembers(): Promise<TeamMember[]> {
  const data = await readFile();
  return data.members.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMember(slug: string): Promise<TeamMember | null> {
  const data = await readFile();
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
  const data = await readFile();
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

  await writeFile(data);
  return normalized;
}

export async function deleteMember(slug: string): Promise<boolean> {
  const data = await readFile();
  const before = data.members.length;
  data.members = data.members.filter((m) => m.slug !== slug);
  if (data.members.length === before) return false;
  await writeFile(data);
  return true;
}
