"use client";
import { useState, useEffect } from "react";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faNewspaper,
  faSearch,
  faStar,
  faCalendarAlt,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { motion } from "framer-motion";

const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const requestUrl = `/api/posts`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const postResponse: PostApiResponse[] = await response.json();
        setPosts(
          postResponse.map((rawPost) => ({
            id: rawPost.id,
            title: rawPost.title,
            content: rawPost.content,
            coverImage: {
              url: rawPost.coverImageURL,
              width: 1000,
              height: 1000,
            },
            createdAt: rawPost.createdAt,
            updatedAt: rawPost.updatedAt,
            categories: rawPost.categories.map((category) => ({
              id: category.category.id,
              name: category.category.name,
            })),
          }))
        );
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました"
        );
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredPosts = posts?.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      post.categories.some((cat) => cat.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const allCategories = Array.from(
    new Set(
      posts?.flatMap((post) => post.categories.map((cat) => cat.name)) || []
    )
  );

  if (fetchError) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-700">
        <p className="font-bold">エラーが発生しました</p>
        <p>{fetchError}</p>
      </div>
    );
  }

  if (!posts) {
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

  return (
    <main className="mx-auto max-w-4xl p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faNewspaper} className="mr-3 text-3xl" />
            <h1 className="text-4xl font-bold">記事一覧</h1>
          </div>
          <Link
            href="/admin"
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
          >
            管理者機能
          </Link>
        </div>
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="記事を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 pl-10 focus:border-blue-500 focus:outline-none"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-3 text-gray-400"
            />
          </div>
        </div>
        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="">全てのカテゴリ</option>
          {allCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6">
        {filteredPosts?.length === 0 ? (
          <p className="text-center text-gray-500">該当する投稿がありません</p>
        ) : (
          filteredPosts?.map((post, index) => (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              key={post.id}
              className="group overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-xl"
            >
              <Link href={`/posts/${post.id}`}>
                <div className="p-6">
                  <PostSummary post={post} />
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 transition-colors group-hover:bg-slate-200"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-2"
                        />
                        <span className="font-medium">作成:</span>{" "}
                        {formatDate(post.createdAt)}
                      </div>
                      {post.updatedAt && post.updatedAt !== post.createdAt && (
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faStar} className="mr-2" />
                          <span className="font-medium">更新:</span>{" "}
                          {formatDate(post.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))
        )}
      </div>

      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full bg-slate-800 p-4 text-white shadow-lg transition-colors hover:bg-slate-700"
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </motion.button>
      )}
    </main>
  );
};

export default Page;
