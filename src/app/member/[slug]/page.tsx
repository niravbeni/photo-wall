import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import IdeoLogo from "@/components/IdeoLogo";
import { getMember, listMembers } from "@/lib/team";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const members = await listMembers();
  return members.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} — ${member.role || "Team"}`,
  };
}

type Props = { params: Promise<{ slug: string }> };

export default async function MemberPage({ params }: Props) {
  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) notFound();

  const focus = (member.focusAreas ?? []).filter(Boolean);
  const facts = (member.personalFacts ?? []).filter(Boolean);

  return (
    <main className="flex flex-col min-h-[100dvh] bg-[color:var(--ink)]">
      <section className="relative">
        <div className="relative aspect-[4/5] w-full bg-[#e8ebee]">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="(max-width: 420px) 100vw, 420px"
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Avatar name={member.name} size="xl" rounded={false} />
            </div>
          )}

          <Link
            href="/"
            aria-label="Back to team"
            className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-xs font-medium text-[color:var(--ink)] shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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

          <div className="absolute right-4 top-4">
            <IdeoLogo className="text-[color:var(--ink)]" height={24} />
          </div>
        </div>

        <div className="bg-[color:var(--lime)] text-[color:var(--ink)] px-6 py-5">
          <h1 className="text-[26px] leading-[1.1] font-medium tracking-tight">
            {member.name}
          </h1>
          {member.role && (
            <p className="mt-1 text-[16px] leading-snug">{member.role}</p>
          )}
        </div>
      </section>

      <section className="flex-1 px-6 py-7 flex flex-col gap-7">
        <h2 className="text-[color:var(--lime)] text-[22px] font-medium">
          About Me
        </h2>

        {member.joinedAt && (
          <div>
            <p className="text-[14px] text-[color:var(--slate-2)]">
              At IDEO since
            </p>
            <p className="mt-1 text-[18px]">{member.joinedAt}</p>
          </div>
        )}

        {focus.length > 0 && (
          <div>
            <p className="text-[13px] text-[color:var(--slate-2)] mb-2">
              My focus at IDEO
            </p>
            <ul className="bullet-list">
              {focus.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {facts.length > 0 && (
          <div>
            <p className="text-[13px] text-[color:var(--slate-2)] mb-2">
              What you won&apos;t learn from my bio
            </p>
            <ul className="bullet-list">
              {facts.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {member.email && (
          <div>
            <p className="text-[13px] text-[color:var(--slate-2)] mb-1">
              Let&apos;s chat
            </p>
            <a
              href={`mailto:${member.email}`}
              className="text-[color:var(--lime)] text-[16px] underline underline-offset-4 break-all"
            >
              {member.email}
            </a>
          </div>
        )}
      </section>

      {member.linkedin && (
        <div className="px-4 pb-6 pt-2 sticky bottom-0 bg-gradient-to-t from-[color:var(--ink)] via-[color:var(--ink)] to-transparent">
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-white text-[color:var(--ink)] py-4 text-[16px] font-medium"
          >
            <LinkedinBadge />
            Connect on Linkedin
          </a>
        </div>
      )}
    </main>
  );
}

function LinkedinBadge() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-[#0A66C2] text-white">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-.9 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z" />
      </svg>
    </span>
  );
}
