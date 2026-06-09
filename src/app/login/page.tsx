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
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) setError("メールアドレスまたはパスワードが正しくありません");
    else { router.push("/"); router.refresh(); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 4, padding: "32px 36px", width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, background: "var(--accent)", borderRadius: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>(\( ⁰⊖⁰)/)</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>esa clone</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>チームの情報を育てよう</p>
        </div>
        {error && <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 3, padding: "8px 12px", marginBottom: 14, color: "var(--red)", fontSize: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4 }}>
            メールアドレス
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 3, fontSize: 13, outline: "none", background: "#fff" }} />
          </label>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4 }}>
            パスワード
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 3, fontSize: 13, outline: "none", background: "#fff" }} />
          </label>
          <button type="submit" disabled={loading} style={{ padding: "8px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 3, fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 4 }}>
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
          アカウントをお持ちでない方は <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>新規登録</Link>
        </p>
      </div>
    </div>
  );
}
