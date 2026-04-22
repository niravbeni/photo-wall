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
        <div className="relative aspect-[309/295] w-full bg-[#e8ebee]">
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

          <div className="absolute right-4 top-4">
            <IdeoLogo className="text-[color:var(--ink)]" height={24} />
          </div>
        </div>

        <div className="bg-[color:var(--lime)] text-[#141f27] px-[20px] py-[12px]">
          <div className="flex flex-col gap-[12px] py-[12px]">
            <h1 className="text-[28px] leading-[normal] font-normal tracking-tight">
              {member.name}
            </h1>
            {member.role && (
              <p className="text-[18px] leading-[normal]">{member.role}</p>
            )}
          </div>
        </div>
      </section>

      <section className="flex-1 p-[20px] flex flex-col gap-[24px]">
        <div className="py-[8px]">
          <h2 className="text-[#dcff46] text-[24px] font-light leading-[normal]">
            About Me
          </h2>
        </div>

        {member.joinedAt && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[18px] text-[#7993a4] leading-[normal]">
              At IDEO since
            </p>
            <p className="text-[16px] text-white leading-[normal]">
              {member.joinedAt}
            </p>
          </div>
        )}

        {focus.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[18px] text-[#7993a4] leading-none">
              My focus at IDEO
            </p>
            <ul className="flex flex-col gap-[4px]">
              {focus.map((item, i) => (
                <li key={i} className="flex items-center gap-[8px]">
                  <span className="w-[2.5px] h-[18px] bg-white rounded-full shrink-0" />
                  <span className="text-[16px] text-white leading-[normal]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {facts.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[18px] text-[#7993a4] leading-none">
              What you won&apos;t learn from my bio
            </p>
            <ul className="flex flex-col gap-[4px]">
              {facts.map((item, i) => (
                <li key={i} className="flex items-center gap-[8px]">
                  <span className="w-[2.5px] h-[18px] bg-white rounded-full shrink-0" />
                  <span className="text-[16px] text-white leading-[normal]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {member.email && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[18px] text-[#7993a4] leading-none">
              Let&apos;s chat
            </p>
            <a
              href={`mailto:${member.email}`}
              className="text-white text-[16px] underline leading-[normal] break-all"
            >
              {member.email}
            </a>
          </div>
        )}
      </section>

      {member.linkedin && (
        <div className="px-[20px] pt-[40px] pb-[64px]">
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-[8px] w-full h-[48px] rounded-[8px] bg-white border border-[#d0d5dd] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
          >
            <LinkedinIcon />
            <span className="text-[14px] font-semibold text-[#344054] leading-[20px]">
              Connect on Linkedin
            </span>
          </a>
        </div>
      )}
    </main>
  );
}

function LinkedinIcon() {
  return (
    <span className="relative inline-flex h-[20px] w-[20px] items-center justify-center">
      <span className="absolute inset-[6.25%] rounded-[56px] bg-[#1275b1]" />
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="white"
        className="relative z-10"
      >
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-.9 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z" />
      </svg>
    </span>
  );
}
