"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faNewspaper,
  faPlus,
  faTags,
  faDashboard,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const AdminPage: React.FC = () => {
  const adminLinks = [
    {
      href: "/admin/posts",
      title: "記事の管理",
      description: "投稿記事の編集、削除",
      icon: faNewspaper,
    },
    {
      href: "/admin/posts/new",
      title: "新規記事作成",
      description: "新しい記事を投稿",
      icon: faPlus,
    },
    {
      href: "/admin/categories",
      title: "カテゴリの管理",
      description: "カテゴリの編集、削除",
      icon: faTags,
    },
    {
      href: "/admin/categories/new",
      title: "新規カテゴリ作成",
      description: "新しいカテゴリを作成",
      icon: faPlus,
    },
  ];

  return (
    <main className="mx-auto max-w-4xl p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white"
      >
        <div className="flex items-center">
          <FontAwesomeIcon icon={faDashboard} className="mr-4 text-3xl" />
          <h1 className="text-3xl font-bold">管理者機能</h1>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {adminLinks.map((link, index) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={link.href}>
              <div className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
                <div className="mb-4 flex items-center">
                  <FontAwesomeIcon
                    icon={link.icon}
                    className="mr-3 text-2xl text-blue-500 transition-transform group-hover:scale-110"
                  />
                  <h2 className="text-xl font-bold text-gray-800">
                    {link.title}
                  </h2>
                </div>
                <p className="mb-4 text-gray-600">{link.description}</p>
                <div className="flex items-center text-blue-500">
                  <span className="text-sm">編集</span>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="ml-2 transition-transform group-hover:translate-x-2"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
};

export default AdminPage;
