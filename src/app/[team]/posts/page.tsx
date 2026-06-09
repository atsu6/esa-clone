import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export default async function PostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ team: string }>;
  searchParams: Promise<{ q?: string; wip?: string; tag?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { team: teamSlug } = await params;
  const { q = "", wip, tag, page: pageStr } = await searchParams;

  const team = await db.team.findUnique({ where: { screenName: teamSlug } });
  if (!team) redirect("/");

  const page = parseInt(pageStr || "1");
  const perPage = 20;

  const where: any = {
    teamId: team.id,
    ...(wip === "true" ? { wip: true } : wip === "false" ? { wip: false } : {}),
    ...(q ? { OR: [
      { title: { contains: q } },
      { bodyMd: { contains: q } },
      { tags: { contains: q } },
    ]} : {}),
    ...(tag ? { tags: { contains: tag } } : {}),
  };

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, screenName: true, image: true } },
        _count: { select: { comments: true, stars: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            {wip === "true" ? "🚧 WIP記事" : q ? `"${q}" の検索結果` : tag ? `#${tag}` : "📄 すべての記事"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 2 }}>{total} 件</p>
        </div>
        <Link href={`/${teamSlug}/posts/new`} style={{ padding: "0.5rem 1rem", background: "var(--accent)", color: "#fff", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
          ✏️ 新規作成
        </Link>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {[
          { href: `/${teamSlug}/posts${q ? "?q=" + encodeURIComponent(q) : ""}`, label: "すべて", active: !wip },
          { href: `/${teamSlug}/posts?wip=true`, label: "🚧 WIP", active: wip === "true" },
          { href: `/${teamSlug}/posts?wip=false`, label: "✅ 公開済み", active: wip === "false" },
        ].map(({ href, label, active }) => (
          <Link key={href} href={href} style={{ padding: "0.35rem 0.8rem", borderRadius: "var(--radius)", fontSize: "0.8rem", fontWeight: 500, textDecoration: "none", background: active ? "var(--accent-subtle)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text-secondary)", border: `1px solid ${active ? "var(--accent)" : "var(--border)"}` }}>
            {label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
          <p>まだ記事がありません</p>
          <Link href={`/${teamSlug}/posts/new`} style={{ display: "inline-block", marginTop: "1rem", color: "var(--accent)", fontWeight: 500 }}>最初の記事を書く →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {posts.map((post: any) => {
            const tags = (post.tags || "").split(",").filter((t: string) => t);
            return (
              <article key={post.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", borderLeft: post.wip ? "3px solid #f5c842" : "3px solid #2d9e6b" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      {post.wip && <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.1rem 0.4rem", background: "#fff8e6", color: "#8a6d00", borderRadius: 4, border: "1px solid #f5c842" }}>WIP</span>}
                      <Link href={`/${teamSlug}/posts/${post.number}`} style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)", textDecoration: "none" }}>
                        {post.category && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{post.category} / </span>}
                        {post.title}
                      </Link>
                    </div>
                    {tags.length > 0 && (
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                        {tags.map((tag: string) => (
                          <Link key={tag} href={`/${teamSlug}/posts?tag=${encodeURIComponent(tag)}`} style={{ fontSize: "0.72rem", padding: "0.1rem 0.5rem", background: "#f0ede6", borderRadius: 99, color: "var(--text-secondary)", textDecoration: "none" }}>#{tag}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.8rem", flexShrink: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <span>⭐ {post._count.stars}</span>
                    <span>💬 {post._count.comments}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.77rem", color: "var(--text-muted)" }}>
                  <span>{post.author.name || post.author.screenName}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(post.updatedAt), { locale: ja, addSuffix: true })}</span>
                  <span>·</span>
                  <span>#{post.number}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginTop: "2rem" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/${teamSlug}/posts?page=${p}${wip ? "&wip=" + wip : ""}${q ? "&q=" + encodeURIComponent(q) : ""}`} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius)", fontSize: "0.85rem", textDecoration: "none", background: p === page ? "var(--accent)" : "var(--bg-card)", color: p === page ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)" }}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
