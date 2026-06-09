"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface Team { id: string; screenName: string; name: string; description?: string | null; }
interface User { id?: string | null; name?: string | null; email?: string | null; image?: string | null; }

export function TeamLayout({ team, user, children }: { team: Team; user: User; children: React.ReactNode; }) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/${team.screenName}/posts?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Left sidebar */}
      <aside style={{
        width: "var(--sidebar-width)",
        background: "#1a1a2e",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 20,
        overflowY: "auto",
      }}>
        {/* Team name */}
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link href={`/${team.screenName}/posts`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 4, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {team.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</span>
          </Link>
        </div>

        {/* Search */}
        <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <form onSubmit={handleSearch}>
            <input
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="記事を検索..."
              style={{ width: "100%", padding: "5px 8px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 3, fontSize: 12, background: "rgba(255,255,255,0.08)", color: "#fff", outline: "none" }}
            />
          </form>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0" }}>
          <SideNavItem href={`/${team.screenName}/posts/new`} label="New Post" icon="✏️" active={false} accent />
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
          <SideNavItem href={`/${team.screenName}/posts`} label="Posts" icon="📄" active={pathname === `/${team.screenName}/posts`} />
          <SideNavItem href={`/${team.screenName}/posts?q=wip%3Atrue`} label="WIP" icon="🚧" active={false} />
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
          <div style={{ padding: "4px 16px 2px", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Tags</div>
          <SideNavItem href={`/${team.screenName}/tags`} label="タグ一覧" icon="🏷" active={pathname.includes("/tags")} />
        </nav>

        {/* User */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "10px 12px", position: "relative" }}>
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", width: "100%", padding: 0 }}
          >
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {(user.name || user.email || "?").charAt(0).toUpperCase()}
            </div>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>{user.name || user.email}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>▾</span>
          </button>
          {userMenuOpen && (
            <div style={{ position: "absolute", bottom: "calc(100% + 4px)", left: 8, right: 8, background: "#fff", borderRadius: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 100, overflow: "hidden" }}>
              <div style={{ padding: "8px 12px", fontSize: 12, color: "#999", borderBottom: "1px solid #eee" }}>{user.email}</div>
              <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ display: "block", width: "100%", padding: "8px 12px", textAlign: "left", background: "none", border: "none", fontSize: 13, color: "#e74c3c", cursor: "pointer" }}>
                ログアウト
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: "var(--sidebar-width)", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

function SideNavItem({ href, label, icon, active, accent }: { href: string; label: string; icon: string; active: boolean; accent?: boolean }) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 16px",
      fontSize: 13,
      textDecoration: "none",
      color: accent ? "#5fd9a0" : active ? "#fff" : "rgba(255,255,255,0.6)",
      background: active ? "rgba(255,255,255,0.1)" : "transparent",
      fontWeight: active || accent ? 600 : 400,
      borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
    }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      {label}
    </Link>
  );
}
