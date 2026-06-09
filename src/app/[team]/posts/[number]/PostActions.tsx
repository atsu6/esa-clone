"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function PostActions({
  postId,
  postNumber,
  teamScreenName,
  isStarred: initialStarred,
  starCount: initialCount,
  isAuthor,
}: {
  postId: string;
  postNumber: number;
  teamScreenName: string;
  isStarred: boolean;
  starCount: number;
  isAuthor: boolean;
}) {
  const router = useRouter();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function toggleStar() {
    if (loading) return;
    setLoading(true);
    const prev = starred;
    setStarred(!prev);
    setCount(c => prev ? c - 1 : c + 1);
    try {
      await fetch(`/api/posts/${postId}/star`, { method: "POST" });
    } catch {
      setStarred(prev);
      setCount(c => prev ? c + 1 : c - 1);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("この記事を削除しますか？この操作は元に戻せません。")) return;
    setDeleting(true);
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.push(`/${teamScreenName}/posts`);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
      <button
        onClick={toggleStar}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.45rem 0.9rem",
          border: `1px solid ${starred ? "var(--star, #f59e0b)" : "var(--border)"}`,
          borderRadius: "var(--radius)",
          background: starred ? "#fefce8" : "var(--bg-card)",
          color: starred ? "var(--star, #f59e0b)" : "var(--text-secondary)",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: "pointer",
          transition: "all 0.1s",
        }}
      >
        {starred ? "⭐" : "☆"} {count}
      </button>

      {isAuthor && (
        <>
          <Link
            href={`/${teamScreenName}/posts/${postNumber}/edit`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.45rem 0.9rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              fontWeight: 500,
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            ✏️ 編集
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.45rem 0.9rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--bg-card)",
              color: "var(--red, #e53935)",
              fontWeight: 500,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            🗑 削除
          </button>
        </>
      )}
    </div>
  );
}
