# esa clone

esa.io にインスパイアされたオープンソースのチームドキュメント管理ツール。

## セットアップ（コピペするだけ）

```bash
git clone https://github.com/atsu6/esa-clone && cd esa-clone && bash setup.sh && npm run dev
```

→ http://localhost:3000 にアクセス

## 機能

- 📝 Markdown 記事作成・編集（WIP / 公開管理）
- 🗂 カテゴリ・タグ・全文検索
- ⭐ スター・💬 コメント
- 🔄 リビジョン履歴
- 👥 チーム管理
- 🔐 メール/パスワード認証 + GitHub OAuth

## 技術スタック

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM v7 + libsql adapter
- **Database**: SQLite（開発）/ Turso（本番）
- **Auth**: NextAuth.js v4

## 環境変数（setup.sh が自動生成します）

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | `file:./dev.db`（SQLite）または libsql/Turso URL |
| `NEXTAUTH_SECRET` | 自動生成されるランダム文字列 |
| `NEXTAUTH_URL` | アプリURL（本番時に変更） |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth（任意） |

## ライセンス

MIT
