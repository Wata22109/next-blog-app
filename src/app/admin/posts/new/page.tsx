"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/_hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faArrowLeft,
  faExclamationTriangle,
  faPencilAlt,
  faTags,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageUploader from "@/app/_components/ImageUploader";
import { supabase } from "@/utils/supabase";

type SelectableCategory = {
  id: string;
  name: string;
  isSelect: boolean;
};

type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const NewPostPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageKey, setCoverImageKey] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>();
  const [checkableCategories, setCheckableCategories] = useState<
    SelectableCategory[] | null
  >(null);

  const router = useRouter();
  const { token } = useAuth();

  // coverImageKeyが変更されたときにURLを取得
  useEffect(() => {
    if (coverImageKey) {
      const { data } = supabase.storage
        .from("cover_image")
        .getPublicUrl(coverImageKey);
      setCoverImageUrl(data.publicUrl);
    }
  }, [coverImageKey]);

  useEffect(() => {
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

        const data: CategoryApiResponse[] = await response.json();
        setCheckableCategories(
          data.map((category) => ({
            id: category.id,
            name: category.name,
            isSelect: false,
          }))
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : `予期せぬエラー: ${error}`;
        setFetchErrorMsg(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    if (!checkableCategories) return;

    setCheckableCategories(
      checkableCategories.map((category) =>
        category.id === categoryId
          ? { ...category, isSelect: !category.isSelect }
          : category
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      window.alert("予期せぬ動作：トークンが取得できません。");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCategoryIds =
        checkableCategories?.filter((c) => c.isSelect).map((c) => c.id) || [];

      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          title,
          content,
          coverImageKey,
          categoryIds: selectedCategoryIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      router.push(`/posts/${data.id}`);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿に失敗しました: ${error.message}`
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6 flex items-center">
            <Link
              href="/admin/posts"
              className="mr-4 rounded-lg bg-white p-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">新規記事の作成</h1>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={twMerge(
            "rounded-lg bg-white p-6 shadow-sm",
            isSubmitting && "opacity-50"
          )}
          onSubmit={handleSubmit}
        >
          {/* タイトル入力 */}
          <div className="mb-6">
            <label
              className="mb-2 block font-bold text-gray-700"
              htmlFor="title"
            >
              <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-blue-500 focus:outline-none"
              placeholder="記事のタイトルを入力"
              required
            />
          </div>

          {/* 本文入力 */}
          <div className="mb-6">
            <label
              className="mb-2 block font-bold text-gray-700"
              htmlFor="content"
            >
              <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
              本文
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-64 w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-blue-500 focus:outline-none"
              placeholder="記事の本文を入力"
              required
            />
          </div>

          {/* カバー画像アップローダー */}
          <div className="mb-6">
            <label className="mb-2 block font-bold text-gray-700">
              カバー画像
            </label>
            <ImageUploader
              coverImageKey={coverImageKey}
              coverImageUrl={coverImageUrl}
              onImageUpload={(key) => setCoverImageKey(key)}
            />
          </div>

          {/* カテゴリ選択 */}
          <div className="mb-8">
            <label className="mb-2 block font-bold text-gray-700">
              <FontAwesomeIcon icon={faTags} className="mr-2" />
              カテゴリ
            </label>
            <div className="flex flex-wrap gap-3">
              {checkableCategories?.length ? (
                checkableCategories.map((category) => (
                  <label
                    key={category.id}
                    className={twMerge(
                      "flex cursor-pointer items-center rounded-full px-4 py-2 transition-colors",
                      category.isSelect
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={category.isSelect}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="mr-2"
                    />
                    {category.name}
                  </label>
                ))
              ) : (
                <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="mr-2"
                  />
                  カテゴリが存在しません
                </div>
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={twMerge(
                "rounded-lg bg-blue-500 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-600",
                "flex items-center space-x-2",
                isSubmitting && "cursor-not-allowed opacity-50"
              )}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  <span>投稿中...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPencilAlt} />
                  <span>記事を投稿</span>
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </main>
  );
};

export default NewPostPage;
