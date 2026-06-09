import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { PostActions } from "./PostActions";
import { CommentSection } from "./CommentSection";
import { MarkdownBody } from "./MarkdownBody";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ team: string; number: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { team: teamSlug, number: numberStr } = await params;
  const team = await db.team.findUnique({ where: { screenName: teamSlug } });
  if (!team) redirect("/");

  const postNumber = parseInt(numberStr);
  if (isNaN(postNumber)) notFound();

  const post = await db.post.findUnique({
    where: { teamId_number: { teamId: team.id, number: postNumber } },
    include: {
      author: { select: { id: true, name: true, screenName: true, image: true } },
      comments: {
        include: { author: { select: { id: true, name: true, screenName: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
      stars: { where: { userId: session.user.id } },
      _count: { select: { stars: true, comments: true } },
    },
  });

  if (!post) notFound();

  const tags = post.tags ? post.tags.split(",").filter(Boolean) : [];
  const isStarred = post.stars.length > 0;
  const isAuthor = post.authorId === session.user.id;
  const categoryParts = post.category ? post.category.split("/") : [];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 60px" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        <Link href={`/${teamSlug}/posts`} style={{ color: "var(--accent)" }}>Posts</Link>
        {categoryParts.map((part, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#ccc" }}>/</span>
            <Link href={`/${teamSlug}/posts?q=${encodeURIComponent(categoryParts.slice(0,i+1).join("/"))}`} style={{ color: "var(--accent)" }}>{part}</Link>
          </span>
        ))}
        <span style={{ color: "#ccc" }}>/</span>
        <span>#{post.number}</span>
      </nav>

      {/* WIP banner */}
      {post.wip && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "var(--wip-bg)", border: "1px solid var(--wip-border)", borderRadius: 4, marginBottom: 16, fontSize: 12, color: "var(--wip-text)", fontWeight: 600 }}>
          🚧 <span>この記事はまだ書きかけです。(WIP)</span>
        </div>
      )}

      {/* Article */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 4 }}>
        {/* Title area */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.4, color: "var(--text-primary)", marginBottom: 10 }}>
            {post.title}
          </h1>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                {(post.author.name || "?").charAt(0)}
              </div>
              <Link href="#" style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: 12 }}>{post.author.name || post.author.screenName}</Link>
            </div>
            <span>作成: {format(new Date(post.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })}</span>
            <span>更新: {format(new Date(post.updatedAt), "yyyy/MM/dd HH:mm", { locale: ja })}</span>
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {tags.map((tag: string) => (
                  <Link key={tag} href={`/${teamSlug}/posts?tag=${encodeURIComponent(tag)}`} style={{ fontSize: 11, padding: "1px 7px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 2, color: "var(--text-secondary)", textDecoration: "none" }}>{tag}</Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          <div className="prose">
            <MarkdownBody content={post.bodyMd} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 16 }}>
        <PostActions
          postId={post.id}
          postNumber={post.number}
          teamScreenName={teamSlug}
          isStarred={isStarred}
          starCount={post._count.stars}
          isAuthor={isAuthor}
        />
      </div>

      {/* Comments */}
      <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>
          {post._count.comments > 0 ? `コメント (${post._count.comments})` : "コメント"}
        </h2>
        <CommentSection postId={post.id} comments={post.comments as any} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
