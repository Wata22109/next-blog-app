import { Category } from "./Category";
import { CoverImage } from "./CoverImage";

export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  categories: Category[];
  coverImageKey: string;
};
