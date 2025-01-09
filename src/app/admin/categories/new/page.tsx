"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
  faArrowLeft,
  faTags,
  faPlus,
  faCheck,
  faInfoCircle,
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

const NewCategoryPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [nameError, setNameError] = useState("");
  const [existingCategories, setExistingCategories] = useState<
    Category[] | null
  >(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
      setExistingCategories(data);
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

  const validateCategoryName = (name: string): string => {
    if (name.length < 2) {
      return "カテゴリ名は2文字以上で入力してください";
    }
    if (name.length > 16) {
      return "カテゴリ名は16文字以内で入力してください";
    }
    if (existingCategories?.some((cat) => cat.name === name)) {
      return "同じ名前のカテゴリが既に存在します";
    }
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setNewCategoryName(newName);
    setNameError(validateCategoryName(newName));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      setNewCategoryName("");
      setShowSuccessMessage(true);
      await fetchCategories();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの作成に失敗しました: ${error.message}`
          : `予期せぬエラー: ${error}`;
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              既存のカテゴリを読み込み中...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (fetchErrorMsg) {
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
      <div className="mx-auto max-w-4xl p-6">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6 flex items-center">
            <Link
              href="/admin/categories"
              className="mr-4 rounded-lg bg-white p-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                新規カテゴリの作成
              </h1>
              <p className="mt-2 text-gray-600">
                ブログ記事を整理するための新しいカテゴリを作成できます
              </p>
            </div>
          </div>
        </motion.div>

        {/* 成功メッセージ */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 rounded-lg bg-green-50 p-4 text-green-700"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                <span>カテゴリを作成しました！</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* カテゴリ作成フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white p-6 shadow-sm"
        >
          <form
            onSubmit={handleSubmit}
            className={twMerge(isSubmitting && "opacity-50")}
          >
            <div className="mb-6">
              <label
                htmlFor="name"
                className="mb-2 block font-bold text-gray-700"
              >
                <FontAwesomeIcon icon={faTags} className="mr-2" />
                カテゴリ名
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={newCategoryName}
                  onChange={handleNameChange}
                  placeholder="新しいカテゴリ名を入力"
                  className={twMerge(
                    "w-full rounded-lg border p-3 transition-colors focus:outline-none",
                    nameError
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  )}
                  disabled={isSubmitting}
                  required
                />
                <AnimatePresence>
                  {nameError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 flex items-center text-sm text-red-600"
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="mr-2"
                      />
                      {nameError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 既存カテゴリ一覧 */}
            <div className="mb-6">
              <h2 className="mb-3 font-bold text-gray-700">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                既存のカテゴリ
              </h2>
              <div className="flex flex-wrap gap-2">
                {existingCategories?.length === 0 ? (
                  <p className="text-gray-500">
                    カテゴリはまだ作成されていません
                  </p>
                ) : (
                  existingCategories?.map((category) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {category.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !!nameError || !newCategoryName}
                className={twMerge(
                  "flex items-center rounded-lg bg-blue-500 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-600",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="mr-2 animate-spin"
                    />
                    作成中...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    カテゴリを作成
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
};

export default NewCategoryPage;
