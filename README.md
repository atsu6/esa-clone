# esa clone

esa.io にインスパイアされたオープンソースのチームドキュメント管理ツール。

## 技術スタック

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM v7 + libsql adapter
- **Database**: SQLite（開発）/ Turso / PostgreSQL（本番）
- **Auth**: NextAuth.js v4

## セットアップ

```bash
# 1. clone & install
git clone https://github.com/atsu6/esa-clone
cd esa-clone
npm install

# 2. 環境変数
cp .env.example .env.local
# .env.local を編集（最低限これだけでOK）:
#   DATABASE_URL="file:./dev.db"
#   NEXTAUTH_SECRET="any-random-string"

# 3. DB セットアップ（必須・初回のみ）
npx prisma db push

# 4. 起動
npm run dev
```

→ http://localhost:3000

## 機能

- 📝 Markdown 記事作成・編集（WIP / 公開管理）
- 🗂 カテゴリ・タグ・全文検索
- ⭐ スター・💬 コメント
- 🔄 リビジョン履歴
- 👥 チーム管理
- 🔐 メール/パスワード認証 + GitHub OAuth

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | `file:./dev.db`（SQLite）または libsql/Turso URL |
| `NEXTAUTH_SECRET` | 任意のランダム文字列 |
| `NEXTAUTH_URL` | アプリURL（本番時） |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth（任意） |

## ライセンス

MIT
