"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/_hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import ImageUploader from "@/app/_components/ImageUploader";
import { supabase } from "@/utils/supabase";
import type { Post } from "@/app/_types/Post";
import type { Category } from "@/app/_types/Category";

type SelectableCategory = {
  id: string;
  name: string;
  isSelect: boolean;
};

const EditPostPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageKey, setCoverImageKey] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>();
  const [checkableCategories, setCheckableCategories] = useState<
    SelectableCategory[] | null
  >(null);

  const { id } = useParams() as { id: string };
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

  // 投稿記事とカテゴリの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // カテゴリの取得
        const categoriesRes = await fetch("/api/categories", {
          method: "GET",
          cache: "no-store",
        });

        if (!categoriesRes.ok) {
          throw new Error(`カテゴリの取得に失敗: ${categoriesRes.status}`);
        }

        const categoriesData = (await categoriesRes.json()) as Category[];

        // 投稿記事の取得
        const postRes = await fetch(`/api/posts/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!postRes.ok) {
          throw new Error(`投稿記事の取得に失敗: ${postRes.status}`);
        }

        const postData = (await postRes.json()) as Post;

        // 状態の更新
        setTitle(postData.title);
        setContent(postData.content);
        setCoverImageKey(postData.coverImageKey);

        setCheckableCategories(
          categoriesData.map((category) => ({
            id: category.id,
            name: category.name,
            isSelect: postData.categories.some((c) => c.id === category.id),
          }))
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : `予期せぬエラー: ${error}`;
        console.error(errorMsg);
        setFetchErrorMsg(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const switchCategoryState = (categoryId: string) => {
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
      const requestBody = {
        title,
        content,
        coverImageKey,
        categoryIds: checkableCategories
          ? checkableCategories.filter((c) => c.isSelect).map((c) => c.id)
          : [],
      };

      // デバッグログを追加
      console.log("更新リクエスト:", {
        url: `/api/admin/posts/${id}`,
        method: "PUT",
        body: requestBody,
      });

      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT", // ここがPUTになっているか確認
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `${res.status}: ${res.statusText}`);
      }

      window.alert("投稿記事を更新しました");
      router.push("/admin/posts");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `更新に失敗しました: ${error.message}`
          : `予期せぬエラー: ${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!window.confirm("この投稿記事を本当に削除しますか？")) {
      return;
    }

    if (!token) {
      window.alert("予期せぬ動作：トークンが取得できません。");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
        cache: "no-store",
        headers: {
          Authorization: token,
        },
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      window.alert(data.msg);
      router.replace("/admin/posts");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `削除に失敗しました: ${error.message}`
          : `予期せぬエラー: ${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (fetchErrorMsg) {
    return (
      <div className="text-red-500">
        <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
        {fetchErrorMsg}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">投稿記事の編集</h1>

      <form
        onSubmit={handleSubmit}
        className={twMerge("space-y-6", isSubmitting && "opacity-50")}
      >
        {/* タイトル入力 */}
        <div className="space-y-2">
          <label htmlFor="title" className="block font-bold text-gray-700">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* 本文入力 */}
        <div className="space-y-2">
          <label htmlFor="content" className="block font-bold text-gray-700">
            本文
          </label>
          <textarea
            id="content"
            name="content"
            className="h-64 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {/* カバー画像アップローダー */}
        <div className="space-y-2">
          <label className="block font-bold text-gray-700">カバー画像</label>
          <ImageUploader
            coverImageKey={coverImageKey}
            coverImageUrl={coverImageUrl}
            onImageUpload={(key) => setCoverImageKey(key)}
          />
        </div>

        {/* カテゴリ選択 */}
        <div className="space-y-2">
          <div className="font-bold text-gray-700">カテゴリ</div>
          <div className="flex flex-wrap gap-4 rounded-lg border border-gray-300 p-4">
            {checkableCategories?.length ? (
              checkableCategories.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center space-x-2 rounded-full bg-gray-100 px-4 py-2 hover:bg-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={c.isSelect}
                    className="size-4 cursor-pointer rounded border-gray-300"
                    onChange={() => switchCategoryState(c.id)}
                  />
                  <span className="text-gray-700">{c.name}</span>
                </label>
              ))
            ) : (
              <div className="text-gray-500">
                選択可能なカテゴリが存在しません。
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleDelete}
            className={twMerge(
              "rounded-lg px-6 py-2 font-bold",
              "bg-red-500 text-white transition-colors hover:bg-red-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={isSubmitting}
          >
            削除
          </button>
          <button
            type="submit"
            className={twMerge(
              "rounded-lg px-6 py-2 font-bold",
              "bg-indigo-500 text-white transition-colors hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={isSubmitting}
          >
            更新
          </button>
        </div>
      </form>

      {/* ローディングオーバーレイ */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center space-x-3 rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-gray-500"
            />
            <span className="text-gray-500">処理中...</span>
          </div>
        </div>
      )}
    </main>
  );
};

export default EditPostPage;
