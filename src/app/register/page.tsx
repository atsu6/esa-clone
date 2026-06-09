"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", screenName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "登録に失敗しました"); setLoading(false); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/");
      router.refresh();
    } catch {
      setError("エラーが発生しました");
      setLoading(false);
    }
  }

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "var(--shadow-md)", border: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center" }}>アカウント作成</h1>
        {error && <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "var(--radius)", padding: "0.6rem 0.8rem", marginBottom: "1rem", color: "#b91c1c", fontSize: "0.9rem" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { key: "name", label: "表示名", type: "text", placeholder: "山田 太郎" },
            { key: "screenName", label: "スクリーンネーム", type: "text", placeholder: "yamada_taro" },
            { key: "email", label: "メールアドレス", type: "email", placeholder: "" },
            { key: "password", label: "パスワード", type: "password", placeholder: "" },
          ].map(({ key, label, type, placeholder }) => (
            <label key={key} style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: 500 }}>
              {label}
              <input type={type} value={(form as any)[key]} onChange={set(key)} required placeholder={placeholder} style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.95rem", outline: "none", background: "var(--bg)" }} />
            </label>
          ))}
          <button type="submit" disabled={loading} style={{ padding: "0.65rem", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", marginTop: "0.25rem" }}>
            {loading ? "作成中..." : "アカウントを作成"}
          </button>
        </form>
        <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          すでにアカウントをお持ちの方は <Link href="/login">ログイン</Link>
        </p>
      </div>
    </main>
  );
}
