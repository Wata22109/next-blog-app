import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";

export const GET = async (req: NextRequest) => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        coverImageURL: true,
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
  try {
    const { title, content, coverImageURL, categoryIds } = await req.json();

    // バリデーション
    if (!title || !content || !coverImageURL || !categoryIds) {
      return NextResponse.json(
        { error: "必須のフィールドが不足しています" },
        { status: 400 }
      );
    }

    // 記事の作成
    const post = await prisma.post.create({
      data: {
        title,
        content,
        coverImageURL,
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
        coverImageURL: true,
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
    console.error(error);
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
