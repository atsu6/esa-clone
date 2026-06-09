"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface Team {
  id: string;
  screenName: string;
  name: string;
  description?: string | null;
}

interface User {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function TeamLayout({
  team,
  user,
  children,
}: {
  team: Team;
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: `/${team.screenName}/posts`, label: "記事一覧", icon: "📄" },
    { href: `/${team.screenName}/posts?wip=true`, label: "WIP", icon: "🚧" },
    { href: `/${team.screenName}/posts/new`, label: "新規作成", icon: "✏️", highlight: true },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        {/* Team header */}
        <div
          style={{
            padding: "1rem 1rem 0.75rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Link
            href={`/${team.screenName}/posts`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--accent)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {team.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {team.name}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                  }}
                >
                  @{team.screenName}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflow: "auto" }}>
          {navItems.map(({ href, label, icon, highlight }) => {
            const isActive =
              pathname === href ||
              (href.includes("?")
                ? pathname === href.split("?")[0] && typeof window !== "undefined" && window.location.search.includes(href.split("?")[1])
                : false);

            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.45rem 0.6rem",
                  borderRadius: "var(--radius)",
                  fontSize: "0.875rem",
                  fontWeight: highlight ? 600 : 500,
                  textDecoration: "none",
                  color: highlight
                    ? "var(--accent)"
                    : isActive
                    ? "var(--accent)"
                    : "var(--text-secondary)",
                  background: isActive ? "var(--accent-subtle)" : "transparent",
                  marginBottom: "0.1rem",
                  transition: "background 0.1s",
                }}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}

          <div
            style={{
              borderTop: "1px solid var(--border)",
              marginTop: "0.5rem",
              paddingTop: "0.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "0.3rem 0.6rem",
              }}
            >
              検索
            </p>
            <QuickSearch team={team.screenName} />
          </div>
        </nav>

        {/* User footer */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 600,
              fontSize: 12,
              flexShrink: 0,
              cursor: "pointer",
              overflow: "hidden",
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || ""}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (user.name || user.email || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name || user.email}
            </div>
          </div>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 4px)",
                left: 8,
                right: 8,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                boxShadow: "var(--shadow-md)",
                zIndex: 100,
              }}
            >
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  fontSize: "0.875rem",
                  color: "var(--red, #e53935)",
                  cursor: "pointer",
                  borderRadius: "var(--radius)",
                }}
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 220, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

function QuickSearch({ team }: { team: string }) {
  const [q, setQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      window.location.href = `/${team}/posts?q=${encodeURIComponent(q.trim())}`;
    }
  }

  return (
    <form onSubmit={handleSearch} style={{ padding: "0 0.3rem" }}>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="記事を検索..."
        style={{
          width: "100%",
          padding: "0.4rem 0.6rem",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          fontSize: "0.8rem",
          background: "var(--bg)",
          outline: "none",
          color: "var(--text-primary)",
        }}
      />
    </form>
  );
}
