"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const params = useParams<{ team: string }>();
  const [title, setTitle] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [wip, setWip] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  async function handleSave(publishNow?: boolean) {
    if (!title.trim()) { setError("タイトルを入力してください"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamScreenName: params.team,
          title: title.trim(),
          bodyMd,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          category: category.trim() || null,
          wip: publishNow ? false : wip,
          message: message.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "保存に失敗しました"); setSaving(false); return; }
      router.push(`/${params.team}/posts/${data.number}`);
    } catch {
      setError("エラーが発生しました");
      setSaving(false);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.5rem", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="タイトル"
          style={{ flex: 1, border: "none", outline: "none", fontSize: "1.2rem", fontWeight: 700, background: "transparent", color: "var(--text-primary)" }}
        />
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={() => setPreview(!preview)}
            style={{ padding: "0.4rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: preview ? "var(--accent-subtle)" : "transparent", color: preview ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer" }}
          >
            {preview ? "編集" : "プレビュー"}
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer" }}>
            <input type="checkbox" checked={wip} onChange={e => setWip(e.target.checked)} />
            WIP
          </label>
          <button onClick={() => handleSave()} disabled={saving} style={{ padding: "0.4rem 0.9rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", color: "var(--text-primary)" }}>
            {saving ? "保存中..." : "下書き保存"}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} style={{ padding: "0.4rem 0.9rem", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
            公開
          </button>
        </div>
      </div>

      {/* Meta bar */}
      <div style={{ display: "flex", gap: "1rem", padding: "0.5rem 1.5rem", background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        <input
          type="text"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="カテゴリ（例: 開発/インフラ）"
          style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.3rem 0.6rem", fontSize: "0.8rem", outline: "none", background: "var(--bg)" }}
        />
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="タグ（カンマ区切り）"
          style={{ flex: 2, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.3rem 0.6rem", fontSize: "0.8rem", outline: "none", background: "var(--bg)" }}
        />
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="変更メモ（任意）"
          style={{ flex: 2, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.3rem 0.6rem", fontSize: "0.8rem", outline: "none", background: "var(--bg)" }}
        />
      </div>

      {error && (
        <div style={{ padding: "0.5rem 1.5rem", background: "#fff0f0", color: "#b91c1c", fontSize: "0.85rem", borderBottom: "1px solid #fca5a5" }}>{error}</div>
      )}

      {/* Editor / Preview */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {!preview ? (
          <textarea
            value={bodyMd}
            onChange={e => setBodyMd(e.target.value)}
            placeholder={"# 見出し\n\nMarkdownで書けます...\n\n```code\n// コードブロック\n```\n"}
            style={{ flex: 1, padding: "1.5rem", border: "none", outline: "none", resize: "none", fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem", lineHeight: 1.7, background: "var(--bg)", color: "var(--text-primary)" }}
          />
        ) : (
          <div style={{ flex: 1, padding: "1.5rem 2rem", overflow: "auto", background: "var(--bg-card)" }}>
            <div className="prose">
              <MarkdownPreview content={bodyMd} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  // Simple markdown rendering via dangerouslySetInnerHTML with basic transforms
  // In production, use a proper renderer
  const html = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(.+)$/gm, (line) => {
      if (line.startsWith("<")) return line;
      return line;
    });

  return <div dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}
