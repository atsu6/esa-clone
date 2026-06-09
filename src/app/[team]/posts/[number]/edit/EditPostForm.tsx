"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Post { id: string; number: number; title: string; bodyMd: string; tags: string; category: string | null; wip: boolean; }

export function EditPostForm({ post, teamScreenName }: { post: Post; teamScreenName: string; }) {
  const router = useRouter();
  const fullTitle = post.category ? `${post.category}/${post.title}` : post.title;
  const [title, setTitle] = useState(fullTitle);
  const [bodyMd, setBodyMd] = useState(post.bodyMd);
  const [tags, setTags] = useState(post.tags);
  const [wip, setWip] = useState(post.wip);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"edit" | "split" | "preview">("split");

  const titleParts = title.split("/");
  const displayCategory = titleParts.length > 1 ? titleParts.slice(0, -1).join("/") : "";
  const displayTitle = titleParts[titleParts.length - 1] || "";

  async function handleSave() {
    if (!displayTitle.trim()) { setError("タイトルを入力してください"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: displayTitle.trim(), bodyMd, tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean), category: displayCategory || null, wip, message: message.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "保存に失敗しました"); setSaving(false); return; }
      router.push(`/${teamScreenName}/posts/${post.number}`);
      router.refresh();
    } catch { setError("エラーが発生しました"); setSaving(false); }
  }

  const handleTab = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const next = bodyMd.substring(0, start) + "  " + bodyMd.substring(el.selectionEnd);
    setBodyMd(next);
    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; });
  }, [bodyMd]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "0 16px", height: 48, borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0, gap: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", overflow: "hidden" }}>
          {displayCategory && <span style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{displayCategory} / </span>}
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", background: "transparent", minWidth: 0 }} />
        </div>
        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
          {(["edit", "split", "preview"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "4px 10px", border: "none", borderRight: v !== "preview" ? "1px solid var(--border)" : "none", background: view === v ? "#f0f0f0" : "#fff", color: view === v ? "var(--text-primary)" : "var(--text-muted)", fontSize: 11, cursor: "pointer", fontWeight: view === v ? 600 : 400 }}>
              {v === "edit" ? "編集" : v === "split" ? "分割" : "プレビュー"}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer", flexShrink: 0, padding: "4px 8px", border: `1px solid ${wip ? "var(--wip-border)" : "var(--border)"}`, borderRadius: 3, background: wip ? "var(--wip-bg)" : "#fff", color: wip ? "var(--wip-text)" : "var(--text-muted)" }}>
          <input type="checkbox" checked={wip} onChange={e => setWip(e.target.checked)} style={{ margin: 0 }} />
          WIP
        </label>
        <button onClick={handleSave} disabled={saving} style={{ padding: "5px 14px", border: "none", borderRadius: 3, background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
          {saving ? "保存中..." : "Save"}
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 16px", borderBottom: "1px solid var(--border-subtle)", background: "#fafafa", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>Tags:</span>
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="タグをカンマ区切りで" style={{ flex: 1, border: "none", outline: "none", fontSize: 12, background: "transparent" }} />
        <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>Message:</span>
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="変更メモ" style={{ flex: 1, border: "none", outline: "none", fontSize: 12, background: "transparent" }} />
      </div>
      {error && <div style={{ padding: "6px 16px", background: "#fff0f0", color: "var(--red)", fontSize: 12, flexShrink: 0 }}>{error}</div>}
      <ToolBar onInsert={(text) => setBodyMd(b => b + text)} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {(view === "edit" || view === "split") && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: view === "split" ? "1px solid var(--border)" : "none", minWidth: 0 }}>
            <textarea value={bodyMd} onChange={e => setBodyMd(e.target.value)} onKeyDown={handleTab} style={{ flex: 1, padding: "14px 18px", border: "none", outline: "none", resize: "none", fontFamily: "monospace", fontSize: 13, lineHeight: 1.8, background: "#fff", color: "var(--text-primary)", minHeight: 0 }} />
            <div style={{ padding: "3px 16px", fontSize: 11, color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", background: "#fafafa" }}>{bodyMd.length.toLocaleString()} 文字</div>
          </div>
        )}
        {(view === "preview" || view === "split") && (
          <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
            <div style={{ padding: "20px 28px" }}>
              {bodyMd.trim() ? <div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd}</ReactMarkdown></div> : <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginTop: 40 }}>プレビューがここに表示されます</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBar({ onInsert }: { onInsert: (text: string) => void }) {
  const groups = [
    [{ label: "H1", text: "\n# " },{ label: "H2", text: "\n## " },{ label: "H3", text: "\n### " }],
    [{ label: "B", text: "****", style: { fontWeight: 700 as const } },{ label: "I", text: "**", style: { fontStyle: "italic" as const } },{ label: "S", text: "~~~~" }],
    [{ label: "`code`", text: "``" },{ label: "```", text: "\n```\n\n```\n" }],
    [{ label: "UL", text: "\n- " },{ label: "OL", text: "\n1. " },{ label: "☐", text: "\n- [ ] " }],
    [{ label: ">", text: "\n> " },{ label: "―", text: "\n---\n" },{ label: "🔗", text: "[テキスト](url)" }],
  ];
  return (
    <div style={{ display: "flex", gap: 0, padding: "3px 12px", borderBottom: "1px solid var(--border)", background: "#f8f8f8", flexWrap: "wrap", flexShrink: 0, alignItems: "center" }}>
      {groups.map((group, gi) => (
        <span key={gi} style={{ display: "flex", marginRight: gi < groups.length - 1 ? 8 : 0 }}>
          {gi > 0 && <span style={{ width: 1, background: "var(--border)", margin: "2px 6px 2px 0", alignSelf: "stretch" }} />}
          {group.map(({ label, text, style }: any) => (
            <button key={label} onClick={() => onInsert(text)} style={{ padding: "3px 7px", border: "none", borderRadius: 3, background: "transparent", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", fontFamily: "monospace", fontWeight: 500, ...(style || {}), lineHeight: 1.4 }}>{label}</button>
          ))}
        </span>
      ))}
    </div>
  );
}
