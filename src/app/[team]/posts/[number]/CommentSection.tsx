"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface Comment {
  id: string;
  bodyMd: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    screenName: string;
  };
}

export function CommentSection({
  postId,
  comments: initialComments,
  currentUserId,
}: {
  postId: string;
  comments: Comment[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyMd: body }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "エラー"); setPosting(false); return; }
      setComments(c => [...c, data]);
      setBody("");
    } catch {
      setError("エラーが発生しました");
    }
    setPosting(false);
  }

  return (
    <section style={{ marginTop: "1rem" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-secondary)" }}>
        コメント {comments.length > 0 && `(${comments.length})`}
      </h2>

      {comments.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          まだコメントはありません
        </p>
      )}

      {comments.map(comment => (
        <div
          key={comment.id}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1rem 1.25rem",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
              {(comment.author.name || comment.author.screenName).charAt(0)}
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{comment.author.name || comment.author.screenName}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {formatDistanceToNow(new Date(comment.createdAt), { locale: ja, addSuffix: true })}
            </span>
          </div>
          <div className="prose" style={{ fontSize: "0.9rem" }}>
            <p style={{ whiteSpace: "pre-wrap" }}>{comment.bodyMd}</p>
          </div>
        </div>
      ))}

      {/* New comment form */}
      <form onSubmit={handleSubmit} style={{ marginTop: "1.25rem" }}>
        {error && <div style={{ color: "var(--red, #e53935)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>{error}</div>}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Markdownでコメントを書く..."
          rows={4}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: "0.9rem",
            fontFamily: "var(--font-sans)",
            resize: "vertical",
            outline: "none",
            background: "var(--bg)",
            color: "var(--text-primary)",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.6rem" }}>
          <button
            type="submit"
            disabled={posting || !body.trim()}
            style={{
              padding: "0.45rem 1rem",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              opacity: posting || !body.trim() ? 0.6 : 1,
            }}
          >
            {posting ? "送信中..." : "コメントする"}
          </button>
        </div>
      </form>
    </section>
  );
}
