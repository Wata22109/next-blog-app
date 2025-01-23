import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/utils/supabase";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";

export const revalidate = 0; // ◀ サーバサイドのキャッシュを無効化する設定

export const GET = async (req: NextRequest) => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        coverImageKey: true, // coverImageURLからcoverImageKeyに変更
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const token = req.headers.get("Authorization") ?? "";
  const { data, error } = await supabase.auth.getUser(token);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });
  try {
    const requestData = await req.json();
    console.log("受信したデータ:", requestData); // デバッグ用のログ出力

    const { title, content, coverImageKey, categoryIds } = requestData;

    // バリデーション
    if (!title || !content || !coverImageKey || !categoryIds) {
      // どのフィールドが不足しているかを特定
      const missingFields = [];
      if (!title) missingFields.push("title");
      if (!content) missingFields.push("content");
      if (!coverImageKey) missingFields.push("coverImageKey");
      if (!categoryIds) missingFields.push("categoryIds");

      return NextResponse.json(
        {
          error: `必須のフィールドが不足しています: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 記事の作成
    const post = await prisma.post.create({
      data: {
        title,
        content,
        coverImageKey,
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        coverImageKey: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("APIエラー:", error); // エラー詳細をログ出力
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `投稿の作成に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 }
    );
  }
};
