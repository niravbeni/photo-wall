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
    <main className="flex flex-col min-h-[100dvh] bg-[#151f27]">
      {/* Photo: 393×375 aspect from Figma */}
      <section className="relative">
        <div className="relative w-full bg-[#e8ebee]" style={{ aspectRatio: "393 / 375" }}>
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

          <div className="absolute right-[20px] top-[25px]">
            <IdeoLogo className="text-[#151f27]" height={23} />
          </div>
        </div>

        {/* Name bar: Figma total height 92, inner frame 68 @ py-12 + gap-12 */}
        <div className="bg-[#d9ff00] overflow-hidden px-[20px] py-[12px]">
          <div className="flex flex-col gap-[12px] h-[68px] justify-center">
            <h1 className="text-[28px] font-normal leading-none text-[#141f27]">
              {member.name}
            </h1>
            {member.role && (
              <p className="text-[18px] font-normal leading-none text-[#141f27]">
                {member.role}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content: p-20, gap-24 between sections */}
      <section className="flex-1 p-[20px] flex flex-col gap-[24px]">
        {/* "About Me" heading: FH Oscar Light 24px #dcff46, py-8 */}
        <div className="py-[8px]">
          <h2 className="text-[24px] font-light leading-[normal] text-[#dcff46]">
            About Me
          </h2>
        </div>

        {/* At IDEO since: label 18px #7993a4, content 16px white, gap-8 */}
        {member.joinedAt && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[18px] font-normal leading-[normal] text-[#7993a4]">
              At IDEO since
            </p>
            <p className="text-[16px] font-normal leading-[normal] text-white">
              {member.joinedAt}
            </p>
          </div>
        )}

        {/* My focus at IDEO */}
        {focus.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[18px] font-normal leading-none text-[#7993a4]">
              My focus at IDEO
            </p>
            <BulletList items={focus} />
          </div>
        )}

        {/* What you won't learn from my bio */}
        {facts.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[18px] font-normal leading-none text-[#7993a4]">
              What you won&apos;t learn from my bio
            </p>
            <BulletList items={facts} />
          </div>
        )}

        {/* Let's chat + email */}
        {member.email && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[18px] font-normal leading-none text-[#7993a4]">
              Let&apos;s chat
            </p>
            <a
              href={`mailto:${member.email}`}
              className="text-[16px] font-normal leading-[normal] text-white underline decoration-solid break-all"
            >
              {member.email}
            </a>
          </div>
        )}
      </section>

      {/* LinkedIn button: pt-40 pb-64 px-20 */}
      {member.linkedin && (
        <div className="px-[20px] pt-[40px] pb-[64px]">
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-[8px] w-full h-[48px] rounded-[8px] bg-white border border-[#d0d5dd] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
          >
            <LinkedinIcon />
            <span className="text-[14px] font-semibold leading-[20px] text-[#344054]" style={{ fontFamily: "Inter, sans-serif" }}>
              Connect on Linkedin
            </span>
          </a>
        </div>
      )}
    </main>
  );
}

/** Bullet list matching Figma: 2.5px circle dot, 7.6px gap to text, ~3.8px between items */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-[3.8px]">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-[7.6px]">
          <span
            className="shrink-0 rounded-full bg-white"
            style={{ width: "2.5px", height: "2.5px" }}
          />
          <span className="text-[16px] font-normal leading-[normal] text-white">
            {item}
          </span>
        </li>
      ))}
    </ul>
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
