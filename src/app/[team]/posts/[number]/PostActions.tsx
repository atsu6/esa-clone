"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function PostActions({ postId, postNumber, teamScreenName, isStarred: initialStarred, starCount: initialCount, isAuthor }: {
  postId: string; postNumber: number; teamScreenName: string; isStarred: boolean; starCount: number; isAuthor: boolean;
}) {
  const router = useRouter();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggleStar() {
    if (loading) return;
    setLoading(true);
    const prev = starred;
    setStarred(!prev);
    setCount(c => prev ? c - 1 : c + 1);
    try { await fetch(`/api/posts/${postId}/star`, { method: "POST" }); } catch { setStarred(prev); setCount(c => prev ? c + 1 : c - 1); }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("この記事を削除しますか？")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.push(`/${teamScreenName}/posts`);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={toggleStar} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", border: `1px solid ${starred ? "#f0c040" : "var(--border)"}`, borderRadius: 3, background: starred ? "#fff9e6" : "var(--bg-card)", color: starred ? "#886600" : "var(--text-secondary)", fontWeight: starred ? 700 : 500, fontSize: 12, cursor: "pointer" }}>
        <span style={{ color: starred ? "#f0a020" : "#bbb" }}>★</span>
        Star{count > 0 ? ` (${count})` : ""}
      </button>
      {isAuthor && (
        <>
          <Link href={`/${teamScreenName}/posts/${postNumber}/edit`} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", border: "1px solid var(--border)", borderRadius: 3, background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 12, textDecoration: "none" }}>
            ✏️ 編集
          </Link>
          <button onClick={handleDelete} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", border: "1px solid var(--border)", borderRadius: 3, background: "var(--bg-card)", color: "var(--red)", fontSize: 12, cursor: "pointer" }}>
            🗑 削除
          </button>
        </>
      )}
    </div>
  );
}
