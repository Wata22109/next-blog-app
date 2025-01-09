"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrash,
  faPen,
  faPlus,
  faTags,
  faArrowLeft,
  faSearch,
  faExclamationCircle,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const CategoryListPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : `予期せぬエラー: ${error}`;
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `カテゴリ「${name}」を削除してもよろしいですか？\n関連する記事のカテゴリ情報も削除されます。`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      await fetchCategories();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `削除に失敗しました: ${error.message}`
          : `予期せぬエラー: ${error}`;
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAndSortedCategories = categories
    ?.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const compareResult = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? compareResult : -compareResult;
    });

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
            <span className="text-lg text-gray-700">
              カテゴリを読み込み中...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-6">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="mr-4 rounded-lg bg-white p-2 text-gray-600 transition-colors hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  カテゴリの管理
                </h1>
                <p className="mt-2 text-gray-600">
                  カテゴリの作成、編集、削除ができます
                </p>
              </div>
            </div>
            <Link
              href="/admin/categories/new"
              className="flex items-center rounded-lg bg-blue-500 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-600"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              新規作成
            </Link>
          </div>

          {/* 検索バーとソート */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="カテゴリを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            <button
              onClick={() =>
                setSortOrder((current) => (current === "asc" ? "desc" : "asc"))
              }
              className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faSort} className="mr-2" />
              {sortOrder === "asc" ? "名前順" : "名前逆順"}
            </button>
          </div>
        </motion.div>

        {/* カテゴリ一覧 */}
        <AnimatePresence mode="wait">
          {fetchErrorMsg ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg bg-red-50 p-6 text-red-700"
            >
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="mr-2 text-xl"
                />
                <h2 className="text-lg font-bold">エラーが発生しました</h2>
              </div>
              <p className="mt-2">{fetchErrorMsg}</p>
            </motion.div>
          ) : filteredAndSortedCategories?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm"
            >
              <FontAwesomeIcon
                icon={faTags}
                className="mb-4 text-4xl text-gray-400"
              />
              <p>カテゴリが見つかりません</p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredAndSortedCategories?.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faTags}
                        className="mr-3 text-gray-400"
                      />
                      <span className="text-lg font-medium text-gray-800">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                      >
                        <FontAwesomeIcon icon={faPen} className="mr-2" />
                        <span>編集</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
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
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 処理中オーバーレイ */}
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

export default CategoryListPage;
