import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { ja } from "date-fns/locale";
import { PostActions } from "./PostActions";
import { CommentSection } from "./CommentSection";

export default async function PostDetailPage({
  params,
}: {
  params: { team: string; number: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const team = await db.team.findUnique({
    where: { screenName: params.team },
  });
  if (!team) redirect("/");

  const postNumber = parseInt(params.number);
  if (isNaN(postNumber)) notFound();

  const post = await db.post.findUnique({
    where: { teamId_number: { teamId: team.id, number: postNumber } },
    include: {
      author: { select: { id: true, name: true, screenName: true, image: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, screenName: true, image: true } },
        },
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

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
        <Link href={`/${params.team}/posts`} style={{ color: "var(--text-muted)" }}>記事一覧</Link>
        <span>/</span>
        {post.category && (
          <>
            <Link href={`/${params.team}/posts?q=${encodeURIComponent(post.category)}`} style={{ color: "var(--text-muted)" }}>{post.category}</Link>
            <span>/</span>
          </>
        )}
        <span>#{post.number}</span>
      </nav>

      {/* Article */}
      <article style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "2rem 2.5rem", marginBottom: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
        {/* Status badge */}
        {post.wip && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem", background: "var(--wip-bg, #fff8e6)", color: "var(--wip-text, #8a6d00)", border: "1px solid var(--wip-border, #f5c842)", borderRadius: 4, marginBottom: "1rem" }}>
            🚧 Work In Progress
          </div>
        )}

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.3, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle, #f0ede6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
              {post.author.name?.charAt(0) || "?"}
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{post.author.name || post.author.screenName}</span>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            {format(new Date(post.updatedAt), "yyyy/MM/dd HH:mm")} 更新
          </span>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {tags.map((tag: string) => (
                <Link key={tag} href={`/${params.team}/posts?tag=${encodeURIComponent(tag)}`} style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", background: "var(--border-subtle, #f0ede6)", borderRadius: 99, color: "var(--text-secondary)", textDecoration: "none" }}>
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="prose">
          <MarkdownBody content={post.bodyMd} />
        </div>
      </article>

      {/* Actions */}
      <PostActions
        postId={post.id}
        postNumber={post.number}
        teamScreenName={params.team}
        isStarred={isStarred}
        starCount={post._count.stars}
        isAuthor={isAuthor}
      />

      {/* Comments */}
      <CommentSection
        postId={post.id}
        comments={post.comments as any}
        currentUserId={session.user.id}
      />
    </div>
  );
}

function MarkdownBody({ content }: { content: string }) {
  if (!content.trim()) {
    return <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>（本文なし）</p>;
  }
  const html = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^#{6} (.+)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.+)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^---$/gm, "<hr>")
    .replace(/```[\w]*\n([\s\S]*?)```/gm, "<pre><code>$1</code></pre>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- \[ \] (.+)$/gm, "<li>☐ $1</li>")
    .replace(/^- \[x\] (.+)$/gm, "<li>☑ $1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return <div dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}
