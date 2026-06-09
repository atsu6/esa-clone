import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const membership = await db.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: true },
      orderBy: { joinedAt: "asc" },
    });
    if (membership) {
      redirect("/" + membership.team.screenName + "/posts");
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ width: 56, height: 56, background: "var(--accent)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: 28 }}>📝</div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>esa clone</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          チームの知識を積み上げる、自前のドキュメント管理ツール
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Link href="/login" style={{ padding: "0.6rem 1.5rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontWeight: 500, background: "var(--bg-card)" }}>ログイン</Link>
          <Link href="/register" style={{ padding: "0.6rem 1.5rem", background: "var(--accent)", color: "#fff", borderRadius: "var(--radius)", fontWeight: 600 }}>はじめる</Link>
        </div>
      </div>
    </main>
  );
}
