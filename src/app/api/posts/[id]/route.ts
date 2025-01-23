import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Post } from "@prisma/client";

type RouteParams = {
  params: {
    id: string;
  };
};

export const GET = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const id = params.id;

    const post = await prisma.post.findUnique({
      where: { id },
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
    });

    if (!post) {
      return NextResponse.json(
        { error: "投稿記事が見つかりません" },
        { status: 404 }
      );
    }

    // カテゴリの形式を整形
    const formattedPost = {
      ...post,
      categories: post.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
      })),
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の取得に失敗しました" },
      { status: 500 }
    );
  }
};
