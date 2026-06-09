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
  const [wip, setWip] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"edit" | "split" | "preview">("split");

  // titleからカテゴリを自動分離 (例: "開発/インフラ/メモ" → category="開発/インフラ", title="メモ")
  const titleParts = title.split("/");
  const displayCategory = titleParts.length > 1 ? titleParts.slice(0, -1).join("/") : "";
  const displayTitle = titleParts[titleParts.length - 1] || "";

  async function handleSave(publishNow?: boolean) {
    if (!displayTitle.trim()) { setError("タイトルを入力してください"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamScreenName: params.team,
          title: displayTitle.trim(),
          bodyMd,
          tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean),
          category: displayCategory || null,
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
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; });
    }
  }, [bodyMd]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 16px", height: 48, borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0, gap: 8 }}>
        {/* Title input with category support */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 0, overflow: "hidden" }}>
          {displayCategory && (
            <span style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{displayCategory} / </span>
          )}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="タイトル（カテゴリ/サブカテゴリ/タイトルと入力でカテゴリ設定）"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", background: "transparent", minWidth: 0 }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
          {(["edit", "split", "preview"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "4px 10px", border: "none", borderRight: v !== "preview" ? "1px solid var(--border)" : "none", background: view === v ? "#f0f0f0" : "#fff", color: view === v ? "var(--text-primary)" : "var(--text-muted)", fontSize: 11, cursor: "pointer", fontWeight: view === v ? 600 : 400 }}>
              {v === "edit" ? "編集" : v === "split" ? "分割" : "プレビュー"}
            </button>
          ))}
        </div>

        {/* WIP toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer", flexShrink: 0, padding: "4px 8px", border: `1px solid ${wip ? "var(--wip-border)" : "var(--border)"}`, borderRadius: 3, background: wip ? "var(--wip-bg)" : "#fff", color: wip ? "var(--wip-text)" : "var(--text-muted)" }}>
          <input type="checkbox" checked={wip} onChange={e => setWip(e.target.checked)} style={{ margin: 0 }} />
          WIP
        </label>

        <button onClick={() => handleSave()} disabled={saving} style={{ padding: "5px 12px", border: "1px solid var(--border)", borderRadius: 3, background: "#fff", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          保存
        </button>
        <button onClick={() => handleSave(true)} disabled={saving} style={{ padding: "5px 14px", border: "none", borderRadius: 3, background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
          {saving ? "保存中..." : "Ship!"}
        </button>
      </div>

      {/* Tags bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 16px", borderBottom: "1px solid var(--border-subtle)", background: "#fafafa", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>Tags:</span>
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="タグをカンマ区切りで入力（例: backend, memo）" style={{ flex: 1, border: "none", outline: "none", fontSize: 12, background: "transparent", color: "var(--text-primary)" }} />
        <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>Message:</span>
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="変更メモ（任意）" style={{ flex: 1, border: "none", outline: "none", fontSize: 12, background: "transparent", color: "var(--text-primary)" }} />
      </div>

      {error && <div style={{ padding: "6px 16px", background: "#fff0f0", color: "var(--red)", fontSize: 12, flexShrink: 0 }}>{error}</div>}

      {/* Toolbar */}
      <ToolBar onInsert={(text) => setBodyMd(b => b + text)} />

      {/* Editor */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {(view === "edit" || view === "split") && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: view === "split" ? "1px solid var(--border)" : "none", minWidth: 0 }}>
            <textarea
              value={bodyMd}
              onChange={e => setBodyMd(e.target.value)}
              onKeyDown={handleTab}
              placeholder={"記事の本文をMarkdownで書けます...\n\n# 見出し1\n## 見出し2\n\n- リスト\n- アイテム\n\n```js\nconsole.log('code')\n```"}
              style={{ flex: 1, padding: "14px 18px", border: "none", outline: "none", resize: "none", fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace", fontSize: 13, lineHeight: 1.8, background: "#fff", color: "var(--text-primary)", minHeight: 0 }}
            />
            <div style={{ padding: "3px 16px", fontSize: 11, color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", background: "#fafafa" }}>
              {bodyMd.length.toLocaleString()} 文字
            </div>
          </div>
        )}
        {(view === "preview" || view === "split") && (
          <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
            <div style={{ padding: "20px 28px", maxWidth: view === "preview" ? 760 : "none", margin: view === "preview" ? "0 auto" : "0" }}>
              {bodyMd.trim() ? (
                <div className="prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd}</ReactMarkdown>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 40, textAlign: "center" }}>プレビューがここに表示されます</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBar({ onInsert }: { onInsert: (text: string) => void }) {
  const groups = [
    [
      { label: "H1", title: "見出し1", text: "\n# " },
      { label: "H2", title: "見出し2", text: "\n## " },
      { label: "H3", title: "見出し3", text: "\n### " },
    ],
    [
      { label: "B", title: "太字", text: "****", style: { fontWeight: 700 as const } },
      { label: "I", title: "斜体", text: "**", style: { fontStyle: "italic" as const } },
      { label: "S", title: "取り消し線", text: "~~~~" },
    ],
    [
      { label: "`code`", title: "インラインコード", text: "``" },
      { label: "```", title: "コードブロック", text: "\n```\n\n```\n" },
    ],
    [
      { label: "UL", title: "箇条書き", text: "\n- " },
      { label: "OL", title: "番号付きリスト", text: "\n1. " },
      { label: "☐", title: "チェックリスト", text: "\n- [ ] " },
    ],
    [
      { label: ">", title: "引用", text: "\n> " },
      { label: "―", title: "区切り線", text: "\n---\n" },
      { label: "🔗", title: "リンク", text: "[テキスト](url)" },
      { label: "📷", title: "画像", text: "![alt](url)" },
    ],
  ];

  return (
    <div style={{ display: "flex", gap: 0, padding: "3px 12px", borderBottom: "1px solid var(--border)", background: "#f8f8f8", flexWrap: "wrap", flexShrink: 0, alignItems: "center" }}>
      {groups.map((group, gi) => (
        <span key={gi} style={{ display: "flex", marginRight: gi < groups.length - 1 ? 8 : 0 }}>
          {gi > 0 && <span style={{ width: 1, background: "var(--border)", margin: "2px 6px 2px 0", alignSelf: "stretch" }} />}
          {group.map(({ label, title, text, style }) => (
            <button key={label} onClick={() => onInsert(text)} title={title} style={{ padding: "3px 7px", border: "none", borderRadius: 3, background: "transparent", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer", fontFamily: "monospace", fontWeight: 500, ...(style || {}), lineHeight: 1.4 }}>
              {label}
            </button>
          ))}
        </span>
      ))}
    </div>
  );
}
