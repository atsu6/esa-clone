"use client";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Comment {
  id: string; bodyMd: string; createdAt: string;
  author: { id: string; name: string | null; screenName: string; };
}

export function CommentSection({ postId, comments: initialComments, currentUserId }: {
  postId: string; comments: Comment[]; currentUserId: string;
}) {
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
      const res = await fetch(`/api/posts/${postId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bodyMd: body }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "エラー"); setPosting(false); return; }
      setComments(c => [...c, data]);
      setBody("");
    } catch { setError("エラーが発生しました"); }
    setPosting(false);
  }

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              {(comment.author.name || "?").charAt(0)}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ padding: "6px 12px", background: "#fafafa", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{comment.author.name || comment.author.screenName}</span>
                <span style={{ color: "var(--text-muted)" }}>{formatDistanceToNow(new Date(comment.createdAt), { locale: ja, addSuffix: true })}</span>
              </div>
              <div style={{ padding: "10px 12px" }} className="prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.bodyMd}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* New comment */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <div style={{ width: 32, flexShrink: 0 }} />
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          {error && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 6 }}>{error}</div>}
          <div style={{ border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden", background: "var(--bg-card)" }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Markdownでコメントを書く..."
              rows={4}
              style={{ width: "100%", padding: "10px 12px", border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", resize: "vertical", background: "transparent", color: "var(--text-primary)" }}
            />
            <div style={{ padding: "6px 10px", background: "#fafafa", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={posting || !body.trim()} style={{ padding: "5px 14px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 3, fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: posting || !body.trim() ? 0.5 : 1 }}>
                {posting ? "送信中..." : "コメントする"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
