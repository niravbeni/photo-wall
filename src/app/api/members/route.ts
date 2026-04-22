import { NextResponse } from "next/server";
import {
  listMembers,
  upsertMember,
  normalizeMember,
  type TeamMember,
} from "@/lib/team";

export const dynamic = "force-dynamic";

export async function GET() {
  const members = await listMembers();
  return NextResponse.json({ members });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<TeamMember>;
    const saved = await upsertMember(normalizeMember(body));
    return NextResponse.json({ member: saved }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
