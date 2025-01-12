"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrash,
  faPen,
  faPlus,
  faNewspaper,
  faCalendarAlt,
  faTag,
  faArrowLeft,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import { motion, AnimatePresence } from "framer-motion";

const AdminPostsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostApiResponse[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/posts", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setPosts(data);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : `予期せぬエラー: ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`「${title}」を本当に削除しますか？`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      window.alert(data.msg);
      await fetchPosts();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `削除に失敗しました: ${error.message}`
          : `予期せぬエラー: ${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = posts?.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      post.categories.some((cat) => cat.category.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const allCategories = Array.from(
    new Set(
      posts?.flatMap((post) =>
        post.categories.map((cat) => cat.category.name)
      ) || []
    )
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg bg-white p-8 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-2xl text-blue-500"
            />
            <span className="text-lg text-gray-700">読み込み中...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!posts) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="m-6 rounded-lg bg-red-50 p-6 text-red-700"
      >
        <h2 className="mb-2 text-lg font-bold">エラーが発生しました</h2>
        <p>{fetchErrorMsg}</p>
      </motion.div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6 flex items-center">
            <Link
              href="/admin"
              className="mr-4 rounded-lg bg-white p-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">記事の管理</h1>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <input
                type="text"
                placeholder="記事を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <FontAwesomeIcon
                icon={faPen}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="rounded-lg border border-gray-300 bg-white p-3 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">全てのカテゴリ</option>
              {allCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <Link
              href="/admin/posts/new"
              className="flex items-center justify-center rounded-lg bg-blue-500 p-3 text-white shadow-sm transition-all hover:bg-blue-600"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              <span>新規記事を作成</span>
            </Link>
          </div>
        </motion.div>

        <AnimatePresence>
          {filteredPosts?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm"
            >
              <FontAwesomeIcon
                icon={faNewspaper}
                className="mb-4 text-4xl text-gray-400"
              />
              <p>該当する記事が見つかりません</p>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {filteredPosts?.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="mb-4">
                      <h2 className="mb-2 text-xl font-bold text-gray-800">
                        {post.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="mr-2"
                          />
                          {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                        </div>
                        {post.categories.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <FontAwesomeIcon icon={faTag} />
                            {post.categories.map(({ category }) => (
                              <span
                                key={category.id}
                                className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                      <Link
                        href={`/posts/${post.id}`}
                        className="flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                        target="_blank"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-2" />
                        <span>プレビュー</span>
                      </Link>

                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                      >
                        <FontAwesomeIcon icon={faPen} className="mr-2" />
                        <span>編集</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className={twMerge(
                          "flex items-center rounded-lg bg-red-500 px-4 py-2 text-white transition-all hover:bg-red-600",
                          isSubmitting && "cursor-not-allowed opacity-50"
                        )}
                        disabled={isSubmitting}
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                        <span>削除</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin text-xl text-blue-500"
                />
                <span className="text-gray-700">処理中...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default AdminPostsPage;
