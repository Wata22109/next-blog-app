"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";

const Page: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = useParams() as { id: string };

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const requestUrl = `/api/posts/${id}`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const postApiResponse: PostApiResponse = await response.json();
        setPost({
          id: postApiResponse.id,
          title: postApiResponse.title,
          content: postApiResponse.content,
          coverImage: {
            url: postApiResponse.coverImageURL,
            width: 1000,
            height: 1000,
          },
          createdAt: postApiResponse.createdAt,
          categories: postApiResponse.categories.map((category) => ({
            id: category.category.id,
            name: category.category.name,
          })),
        });
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [id]);

  if (fetchError) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-700">
        <p className="font-bold">エラーが発生しました</p>
        <p>{fetchError}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <FontAwesomeIcon
          icon={faSpinner}
          className="mr-2 animate-spin text-xl"
        />
        <span className="text-lg">Loading...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-lg bg-yellow-100 p-4 text-yellow-700">
        指定idの投稿の取得に失敗しました。
      </div>
    );
  }

  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });

  return (
    <main className="mx-auto max-w-4xl p-4">
      <button
        onClick={() => router.push("/")}
        className="mb-4 flex items-center text-slate-600 hover:text-slate-800"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        記事一覧に戻る
      </button>

      <article className="overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="p-6">
          <h1 className="mb-4 text-3xl font-bold text-slate-800">
            {post.title}
          </h1>
          <div className="mb-4 flex gap-2">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
              >
                {category.name}
              </span>
            ))}
          </div>
          <time className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString("ja-JP")}
          </time>
        </div>

        <div className="relative aspect-video w-full">
          <Image
            src={post.coverImage.url}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="p-6">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: safeHTML }}
          />
        </div>
      </article>
    </main>
  );
};

export default Page;
