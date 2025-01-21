import { useRef, ChangeEvent } from "react";
import { supabase } from "@/utils/supabase";
import CryptoJS from "crypto-js";
import Image from "next/image";

type ImageUploaderProps = {
  coverImageKey: string;
  coverImageUrl: string | undefined;
  onImageUpload: (key: string) => void;
};

const calculateMD5Hash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  return CryptoJS.MD5(wordArray).toString();
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  coverImageKey,
  coverImageUrl,
  onImageUpload,
}) => {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const bucketName = "cover_image";

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileHash = await calculateMD5Hash(file);
    const path = `private/${fileHash}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, { upsert: true });

    if (error || !data) {
      window.alert(`アップロードに失敗しました: ${error?.message}`);
      return;
    }

    onImageUpload(data.path);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        hidden
        ref={hiddenFileInputRef}
      />
      <button
        type="button"
        onClick={() => hiddenFileInputRef.current?.click()}
        className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
      >
        画像を選択
      </button>

      {coverImageKey && (
        <div className="text-sm text-gray-600">画像キー: {coverImageKey}</div>
      )}

      {coverImageUrl && (
        <div className="mt-4">
          <Image
            src={coverImageUrl}
            alt="カバー画像プレビュー"
            width={400}
            height={300}
            className="rounded-lg border border-gray-200"
            priority
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
