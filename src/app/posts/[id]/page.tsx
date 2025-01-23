"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Post } from "@/app/_types/Post";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTriangleExclamation,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/utils/supabase";
import Image from "next/image";
import Link from "next/link";

const PostDetailPage = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams() as { id: string };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error("投稿記事の取得に失敗しました");
        }
        const data = await response.json();
        setPost(data);

        if (data.coverImageKey) {
          const { data: urlData } = supabase.storage
            .from("cover_image")
            .getPublicUrl(data.coverImageKey);
          setCoverImageUrl(urlData.publicUrl);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <FontAwesomeIcon
          icon={faSpinner}
          className="animate-spin text-2xl text-gray-500"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        投稿記事が見つかりません
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* 戻るボタン */}
      <div className="mx-auto mb-6 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 transition-colors hover:text-gray-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          <span>記事一覧に戻る</span>
        </Link>
      </div>

      <article className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">{post.title}</h1>

        {coverImageUrl && (
          <div className="relative mb-6 aspect-video">
            <Image
              src={coverImageUrl}
              alt={post.title}
              fill
              className="rounded-lg object-cover"
              priority
            />
          </div>
        )}

        <div className="prose max-w-none">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {post.categories.length > 0 && (
          <div className="mt-6 flex gap-2">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          <p>投稿日: {new Date(post.createdAt).toLocaleDateString()}</p>
          {post.updatedAt && (
            <p>更新日: {new Date(post.updatedAt).toLocaleDateString()}</p>
          )}
        </div>
      </article>
    </main>
  );
};

export default PostDetailPage;
