import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // サンプルカテゴリの作成
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "プログラミング",
      },
    }),
    prisma.category.create({
      data: {
        name: "技術",
      },
    }),
    prisma.category.create({
      data: {
        name: "デザイン",
      },
    }),
  ]);

  console.log("カテゴリを作成しました:", categories);

  // サンプル投稿記事の作成
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "Next.jsの基礎",
        content: `Next.jsは、Reactベースのフルスタックフレームワークです。
        
サーバーサイドレンダリング（SSR）やスタティックサイトジェネレーション（SSG）をサポートし、高速なWebアプリケーションを構築できます。

基本的な機能：
1. ファイルベースのルーティング
2. APIルートの作成
3. ビルトインの画像最適化
4. 自動コード分割`,
        coverImageKey: "sample/nextjs.jpg",
        categories: {
          create: [
            {
              category: {
                connect: { id: categories[0].id }, // プログラミング
              },
            },
            {
              category: {
                connect: { id: categories[1].id }, // 技術
              },
            },
          ],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: "モダンなUIデザインのトレンド",
        content: `2024年のUIデザインでは、以下のようなトレンドが注目されています：

1. ニューモーフィズム
2. ダークモード
3. マイクロインタラクション
4. 3Dエレメント
5. グラデーション

これらのトレンドを適切に組み合わせることで、魅力的なユーザーインターフェースを作成できます。`,
        coverImageKey: "sample/design.jpg",
        categories: {
          create: [
            {
              category: {
                connect: { id: categories[2].id }, // デザイン
              },
            },
          ],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: "TypeScriptとPrismaの組み合わせ",
        content: `TypeScriptとPrismaを組み合わせることで、型安全なデータベース操作が可能になります。

Prismaの主な利点：
- 型安全なデータベースクライアント
- 直感的なAPI
- マイグレーション管理
- スキーマ駆動開発

TypeScriptとの相性が良く、開発効率が大幅に向上します。`,
        coverImageKey: "sample/typescript.jpg",
        categories: {
          create: [
            {
              category: {
                connect: { id: categories[0].id }, // プログラミング
              },
            },
            {
              category: {
                connect: { id: categories[1].id }, // 技術
              },
            },
          ],
        },
      },
    }),
  ]);

  console.log("投稿記事を作成しました:", posts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
