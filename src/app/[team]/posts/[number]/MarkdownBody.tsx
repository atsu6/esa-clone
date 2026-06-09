"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownBody({ content }: { content: string }) {
  if (!content.trim()) {
    return <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>（本文なし）</p>;
  }
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
}
