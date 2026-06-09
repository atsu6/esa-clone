"use client";
import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [view, setView] = useState<"edit" | "split" | "preview">("split");

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
          tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean),
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

  const handleTab = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = bodyMd.substring(0, start) + "  " + bodyMd.substring(end);
      setBodyMd(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  }, [bodyMd]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1.25rem", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="タイトルを入力..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: "1.15rem", fontWeight: 700, background: "transparent", color: "var(--text-primary)" }}
        />
        {/* View switcher */}
        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0 }}>
          {(["edit", "split", "preview"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "0.35rem 0.7rem", border: "none", background: view === v ? "var(--accent)" : "transparent", color: view === v ? "#fff" : "var(--text-secondary)", fontSize: "0.75rem", cursor: "pointer", fontWeight: 500 }}>
              {v === "edit" ? "編集" : v === "split" ? "分割" : "プレビュー"}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer", flexShrink: 0 }}>
          <input type="checkbox" checked={wip} onChange={e => setWip(e.target.checked)} />
          WIP
        </label>
        <button onClick={() => handleSave()} disabled={saving} style={{ padding: "0.4rem 0.85rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", color: "var(--text-primary)", flexShrink: 0 }}>
          下書き保存
        </button>
        <button onClick={() => handleSave(true)} disabled={saving} style={{ padding: "0.4rem 0.85rem", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", flexShrink: 0 }}>
          {saving ? "保存中..." : "公開"}
        </button>
      </div>

      {/* Meta bar */}
      <div style={{ display: "flex", gap: "0.75rem", padding: "0.45rem 1.25rem", background: "var(--bg-card)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="カテゴリ（例: 開発/インフラ）" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.28rem 0.6rem", fontSize: "0.78rem", outline: "none", background: "var(--bg)" }} />
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="タグ（カンマ区切り）" style={{ flex: 2, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.28rem 0.6rem", fontSize: "0.78rem", outline: "none", background: "var(--bg)" }} />
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="変更メモ（任意）" style={{ flex: 2, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.28rem 0.6rem", fontSize: "0.78rem", outline: "none", background: "var(--bg)" }} />
      </div>

      {error && <div style={{ padding: "0.4rem 1.25rem", background: "#fff0f0", color: "#b91c1c", fontSize: "0.82rem", borderBottom: "1px solid #fca5a5", flexShrink: 0 }}>{error}</div>}

      {/* Editor area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Editor pane */}
        {(view === "edit" || view === "split") && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: view === "split" ? "1px solid var(--border)" : "none", minWidth: 0 }}>
            <ToolBar onInsert={(text) => setBodyMd(b => b + text)} />
            <textarea
              value={bodyMd}
              onChange={e => setBodyMd(e.target.value)}
              onKeyDown={handleTab}
              placeholder={"# 見出し\n\nMarkdownで書けます...\n\n```js\nconsole.log('Hello')\n```\n\n- リスト\n- アイテム\n\n> 引用文\n"}
              style={{ flex: 1, padding: "1.25rem 1.5rem", border: "none", outline: "none", resize: "none", fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace", fontSize: "0.875rem", lineHeight: 1.75, background: "var(--bg)", color: "var(--text-primary)", minHeight: 0 }}
            />
            <div style={{ padding: "0.3rem 1.5rem", fontSize: "0.72rem", color: "var(--text-muted)", borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
              {bodyMd.length} 文字 · {bodyMd.split("\n").length} 行
            </div>
          </div>
        )}

        {/* Preview pane */}
        {(view === "preview" || view === "split") && (
          <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
            <div style={{ padding: "1.5rem 2rem", maxWidth: view === "preview" ? 760 : "none", margin: view === "preview" ? "0 auto" : "0" }}>
              {bodyMd.trim() ? (
                <div className="prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd}</ReactMarkdown>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic", marginTop: "2rem", textAlign: "center" }}>本文を入力するとここにプレビューが表示されます</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBar({ onInsert }: { onInsert: (text: string) => void }) {
  const tools = [
    { label: "H1", text: "\n# " },
    { label: "H2", text: "\n## " },
    { label: "H3", text: "\n### " },
    { label: "B", text: "****", style: { fontWeight: 700 } },
    { label: "I", text: "**", style: { fontStyle: "italic" } },
    { label: "~~", text: "~~~~" },
    { label: "`", text: "``" },
    { label: "```", text: "\n```\n\n```\n" },
    { label: "→", text: "\n- " },
    { label: "1.", text: "\n1. " },
    { label: "☐", text: "\n- [ ] " },
    { label: ">", text: "\n> " },
    { label: "---", text: "\n---\n" },
    { label: "🔗", text: "[リンクテキスト](url)" },
  ];
  return (
    <div style={{ display: "flex", gap: "1px", padding: "0.4rem 0.75rem", borderBottom: "1px solid var(--border)", background: "var(--bg-sidebar)", flexWrap: "wrap" }}>
      {tools.map(({ label, text, style }) => (
        <button key={label} onClick={() => onInsert(text)} title={text.trim()} style={{ padding: "0.2rem 0.5rem", border: "none", borderRadius: 4, background: "transparent", color: "var(--text-secondary)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "monospace", ...style }}>
          {label}
        </button>
      ))}
    </div>
  );
}
