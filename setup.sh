#!/bin/bash
set -e

echo "=== esa-clone セットアップ ==="

# .env.local がなければ自動作成
if [ ! -f .env.local ]; then
  echo "DATABASE_URL=\"file:./dev.db\"" > .env.local
  echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env.local
  echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env.local
  echo "✅ .env.local を作成しました"
else
  echo "✅ .env.local は既に存在します"
fi

# グローバルのprismaを使わせない
echo "📦 npm install..."
npm install

# ローカルのprisma（v5）を明示的に使う
echo "⚙️  prisma generate..."
DATABASE_URL="file:./dev.db" ./node_modules/.bin/prisma generate

echo "🗄  prisma db push..."
DATABASE_URL="file:./dev.db" ./node_modules/.bin/prisma db push

echo ""
echo "✅ セットアップ完了！"
echo "👉 npm run dev で起動 → http://localhost:3000"
