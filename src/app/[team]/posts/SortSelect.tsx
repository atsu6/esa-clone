"use client";
import { useRouter } from "next/navigation";

export function SortSelect({ teamSlug, sort, wip, q }: { teamSlug: string; sort: string; wip?: string; q?: string }) {
  const router = useRouter();
  return (
    <select
      value={sort}
      onChange={e => {
        const params = new URLSearchParams();
        params.set("sort", e.target.value);
        if (wip) params.set("wip", wip);
        if (q) params.set("q", q);
        router.push(`/${teamSlug}/posts?${params.toString()}`);
      }}
      style={{ fontSize: 12, padding: "4px 6px", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-secondary)", background: "var(--bg-card)", cursor: "pointer", outline: "none" }}
    >
      <option value="updated">更新日時が新しい順</option>
      <option value="created">作成日時が新しい順</option>
      <option value="stars">Starの多い順</option>
      <option value="comments">コメントの多い順</option>
    </select>
  );
}
