import Link from "next/link";
import Avatar from "@/components/Avatar";
import IdeoLogo from "@/components/IdeoLogo";
import { listMembers } from "@/lib/team";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const members = await listMembers();

  return (
    <main className="flex flex-col min-h-[100dvh] bg-[color:var(--ink)] text-white">
      <header className="px-6 pt-10 pb-6 flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--slate-2)]">
            Photowall
          </p>
          <h1 className="mt-2 text-[28px] leading-tight font-medium">
            Meet the team
          </h1>
          <p className="mt-2 text-sm text-[color:var(--slate-2)]">
            Tap a name to open their card.
          </p>
        </div>
        <IdeoLogo className="text-[color:var(--lime)]" height={24} />
      </header>

      <section className="px-4 pb-28 flex-1">
        {members.length === 0 ? (
          <div className="mx-2 rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <p className="text-sm text-[color:var(--slate-2)]">
              No team members yet.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {members.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/member/${m.slug}`}
                  className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-white/5 transition"
                >
                  <Avatar name={m.name} photo={m.photo} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[15px]">
                      {m.name}
                    </p>
                    {m.role && (
                      <p className="truncate text-xs text-[color:var(--slate-2)]">
                        {m.role}
                      </p>
                    )}
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-[color:var(--slate-2)]"
                  >
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav className="sticky bottom-0 left-0 right-0 border-t border-white/10 bg-[color:var(--ink)]/90 backdrop-blur px-6 py-3 flex items-center justify-center">
        <span className="text-xs text-[color:var(--slate-2)]">
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </nav>
    </main>
  );
}
