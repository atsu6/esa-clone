"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  number: number;
  title: string;
  bodyMd: string;
  tags: string;
  category: string | null;
  wip: boolean;
}

export function EditPostForm({
  post,
  teamScreenName,
}: {
  post: Post;
  teamScreenName: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [bodyMd, setBodyMd] = useState(post.bodyMd);
  const [tags, setTags] = useState(post.tags);
  const [category, setCategory] = useState(post.category || "");
  const [wip, setWip] = useState(post.wip);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim()) { setError("タイトルを入力してください"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          bodyMd,
          tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean),
          category: category.trim() || null,
          wip,
          message: message.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "保存に失敗しました"); setSaving(false); return; }
      router.push(`/${teamScreenName}/posts/${post.number}`);
      router.refresh();
    } catch {
      setError("エラーが発生しました");
      setSaving(false);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.5rem", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: "1.2rem", fontWeight: 700, background: "transparent", color: "var(--text-primary)" }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer" }}>
          <input type="checkbox" checked={wip} onChange={e => setWip(e.target.checked)} />
          WIP
        </label>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "0.4rem 0.9rem", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", padding: "0.5rem 1.5rem", background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="カテゴリ" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.3rem 0.6rem", fontSize: "0.8rem", outline: "none", background: "var(--bg)" }} />
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="タグ（カンマ区切り）" style={{ flex: 2, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.3rem 0.6rem", fontSize: "0.8rem", outline: "none", background: "var(--bg)" }} />
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="変更メモ" style={{ flex: 2, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.3rem 0.6rem", fontSize: "0.8rem", outline: "none", background: "var(--bg)" }} />
      </div>

      {error && <div style={{ padding: "0.5rem 1.5rem", background: "#fff0f0", color: "#b91c1c", fontSize: "0.85rem" }}>{error}</div>}

      <textarea
        value={bodyMd}
        onChange={e => setBodyMd(e.target.value)}
        style={{ flex: 1, padding: "1.5rem", border: "none", outline: "none", resize: "none", fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem", lineHeight: 1.7, background: "var(--bg)", color: "var(--text-primary)" }}
      />
    </div>
  );
}
