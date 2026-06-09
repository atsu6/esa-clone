# esa clone

esa.io にインスパイアされたオープンソースのチームドキュメント管理ツールです。

## 機能

- 📝 **Markdown 記事作成・編集** — WIP / 公開ステータス管理
- 🗂 **カテゴリ & タグ** — 階層的な記事整理
- ⭐ **スター** — 記事へのリアクション
- 💬 **コメント** — 記事へのディスカッション
- 🔄 **リビジョン管理** — 変更履歴の保存
- 🔍 **全文検索** — タイトル・本文・タグで検索
- 👥 **チーム管理** — 複数チームに対応
- 🔐 **認証** — メール/パスワード + GitHub OAuth

## 技術スタック

- **Frontend**: Next.js 15 (App Router), TypeScript, CSS Variables
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite（開発）/ PostgreSQL（本番推奨）
- **Auth**: NextAuth.js

## セットアップ

```bash
# 依存パッケージインストール
npm install

# 環境変数設定
cp .env.example .env.local
# DATABASE_URL と NEXTAUTH_SECRET を設定

# DB マイグレーション（初回）
npx prisma db push

# 開発サーバー起動
npm run dev
```

開発サーバーは http://localhost:3000 で起動します。

## 本番デプロイ

### Vercel

```bash
vercel deploy
```

環境変数に `DATABASE_URL`（PostgreSQL）と `NEXTAUTH_SECRET` を設定してください。

### Docker

```bash
docker build -t esa-clone .
docker run -p 3000:3000 esa-clone
```

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | DB接続URL（SQLite: `file:./dev.db`） |
| `NEXTAUTH_SECRET` | NextAuth の署名キー（ランダム文字列） |
| `NEXTAUTH_URL` | アプリのURL（例: `https://your-app.vercel.app`） |
| `GITHUB_ID` | GitHub OAuth App ID（任意） |
| `GITHUB_SECRET` | GitHub OAuth App Secret（任意） |

## ライセンス

MIT
