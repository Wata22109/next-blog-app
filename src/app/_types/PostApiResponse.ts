export type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageKey: string;
  createdAt: string;
  updatedAt?: string;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
};
