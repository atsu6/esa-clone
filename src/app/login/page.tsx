"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email, password, redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", padding: "2.5rem", width: "100%", maxWidth: 400, boxShadow: "var(--shadow-md)", border: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center" }}>ログイン</h1>
        {error && <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "var(--radius)", padding: "0.6rem 0.8rem", marginBottom: "1rem", color: "#b91c1c", fontSize: "0.9rem" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: 500 }}>
            メールアドレス
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.95rem", outline: "none", background: "var(--bg)" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: 500 }}>
            パスワード
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.95rem", outline: "none", background: "var(--bg)" }} />
          </label>
          <button type="submit" disabled={loading} style={{ padding: "0.65rem", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", marginTop: "0.25rem" }}>
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
        <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          アカウントをお持ちでない方は <Link href="/register">新規登録</Link>
        </p>
      </div>
    </main>
  );
}
