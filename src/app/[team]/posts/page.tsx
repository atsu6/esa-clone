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
  searchParams: Promise<{ q?: string; wip?: string; tag?: string; page?: string; sort?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { team: teamSlug } = await params;
  const { q = "", wip, tag, page: pageStr, sort = "updated" } = await searchParams;

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
      { category: { contains: q } },
    ]} : {}),
    ...(tag ? { tags: { contains: tag } } : {}),
  };

  const orderBy: any =
    sort === "stars" ? { starCount: "desc" } :
    sort === "comments" ? { commentCount: "desc" } :
    sort === "created" ? { createdAt: "desc" } :
    { updatedAt: "desc" };

  const [posts, total, wipCount, shippedCount] = await Promise.all([
    db.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, screenName: true, image: true } },
        _count: { select: { comments: true, stars: true } },
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.post.count({ where }),
    db.post.count({ where: { teamId: team.id, wip: true } }),
    db.post.count({ where: { teamId: team.id, wip: false } }),
  ]);

  const totalPages = Math.ceil(total / perPage);
  const allCount = await db.post.count({ where: { teamId: team.id } });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left filter panel */}
      <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--bg-card)", padding: "16px 0", position: "sticky", top: 0, alignSelf: "flex-start", minHeight: "100vh" }}>
        <div style={{ padding: "0 16px 8px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>絞り込み</div>
        {[
          { href: `/${teamSlug}/posts`, label: `すべて`, count: allCount, active: !wip },
          { href: `/${teamSlug}/posts?q=wip%3Atrue`, label: `WIP`, count: wipCount, active: wip === "true" },
          { href: `/${teamSlug}/posts?wip=false`, label: `Shipped`, count: shippedCount, active: wip === "false" },
        ].map(({ href, label, count, active }) => (
          <Link key={href} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px", fontSize: 13, textDecoration: "none", background: active ? "var(--accent-subtle)" : "transparent", color: active ? "var(--accent)" : "var(--text-secondary)", fontWeight: active ? 600 : 400, borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent" }}>
            <span>{label}</span>
            <span style={{ fontSize: 11, background: active ? "var(--accent)" : "#eee", color: active ? "#fff" : "#999", borderRadius: 10, padding: "1px 6px", fontWeight: 600 }}>{count}</span>
          </Link>
        ))}

        {tag && (
          <>
            <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
            <div style={{ padding: "0 16px 8px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>タグ</div>
            <div style={{ padding: "6px 16px", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>#{tag}</div>
            <Link href={`/${teamSlug}/posts`} style={{ display: "block", padding: "4px 16px", fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>× クリア</Link>
          </>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "0", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 15, fontWeight: 700 }}>
              {q ? <><span style={{ color: "var(--text-muted)", fontWeight: 400 }}>「{q}」の検索結果</span></> : tag ? `#${tag}` : "Posts"}
            </h1>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{total} 件</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Sort */}
            <select defaultValue={sort} onChange={e => { window.location.href = `/${teamSlug}/posts?sort=${e.target.value}${wip ? "&wip="+wip : ""}${q ? "&q="+encodeURIComponent(q) : ""}`; }} style={{ fontSize: 12, padding: "4px 6px", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-secondary)", background: "var(--bg-card)", cursor: "pointer", outline: "none" }}>
              <option value="updated">更新日時が新しい順</option>
              <option value="created">作成日時が新しい順</option>
              <option value="stars">Starの多い順</option>
              <option value="comments">コメントの多い順</option>
            </select>
            <Link href={`/${teamSlug}/posts/new`} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", background: "var(--accent)", color: "#fff", borderRadius: 3, fontWeight: 600, fontSize: 12, textDecoration: "none" }}>
              ✏️ New Post
            </Link>
          </div>
        </div>

        {/* Post list */}
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>(\( ⁰⊖⁰)/)</div>
            <p style={{ fontSize: 14 }}>記事がありません</p>
            <Link href={`/${teamSlug}/posts/new`} style={{ display: "inline-block", marginTop: 16, color: "var(--accent)", fontWeight: 600 }}>最初の記事を書く →</Link>
          </div>
        ) : (
          <div>
            {posts.map((post: any) => {
              const tags = (post.tags || "").split(",").filter((t: string) => t.trim());
              const categoryParts = post.category ? post.category.split("/") : [];
              return (
                <div key={post.id} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-card)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  {/* Avatar */}
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                      {(post.author.name || "?").charAt(0)}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Category breadcrumb */}
                    {categoryParts.length > 0 && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                        {categoryParts.map((part: string, i: number) => (
                          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {i > 0 && <span>/</span>}
                            <Link href={`/${teamSlug}/posts?q=${encodeURIComponent(categoryParts.slice(0, i+1).join("/"))}`} style={{ color: "var(--text-muted)", textDecoration: "none" }}>{part}</Link>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {post.wip && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", background: "var(--wip-bg)", color: "var(--wip-text)", border: "1px solid var(--wip-border)", borderRadius: 3, flexShrink: 0 }}>WIP</span>
                      )}
                      <Link href={`/${teamSlug}/posts/${post.number}`} style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", textDecoration: "none", lineHeight: 1.4 }}>
                        {post.title}
                      </Link>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                        {tags.map((tag: string) => (
                          <Link key={tag} href={`/${teamSlug}/posts?tag=${encodeURIComponent(tag)}`} style={{ fontSize: 11, padding: "1px 7px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 2, color: "var(--text-secondary)", textDecoration: "none" }}>
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, fontSize: 11, color: "var(--text-muted)" }}>
                      <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{post.author.name || post.author.screenName}</span>
                      <span>updated {formatDistanceToNow(new Date(post.updatedAt), { locale: ja, addSuffix: true })}</span>
                      <span style={{ color: "#bbb" }}>#{post.number}</span>
                    </div>
                  </div>

                  {/* Counts */}
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                    {post._count.stars > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ color: "var(--star)" }}>★</span> {post._count.stars}
                      </span>
                    )}
                    {post._count.comments > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        💬 {post._count.comments}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 4, justifyContent: "center", padding: "24px 0" }}>
            {page > 1 && <PagLink href={`/${teamSlug}/posts?page=${page-1}${wip?"&wip="+wip:""}${q?"&q="+encodeURIComponent(q):""}`} label="← 前" />}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <PagLink key={p} href={`/${teamSlug}/posts?page=${p}${wip?"&wip="+wip:""}${q?"&q="+encodeURIComponent(q):""}`} label={String(p)} active={p === page} />
            ))}
            {page < totalPages && <PagLink href={`/${teamSlug}/posts?page=${page+1}${wip?"&wip="+wip:""}${q?"&q="+encodeURIComponent(q):""}`} label="次 →" />}
          </div>
        )}
      </div>
    </div>
  );
}

function PagLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href} style={{ padding: "4px 9px", borderRadius: 3, fontSize: 12, textDecoration: "none", background: active ? "var(--accent)" : "var(--bg-card)", color: active ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)" }}>
      {label}
    </Link>
  );
}
