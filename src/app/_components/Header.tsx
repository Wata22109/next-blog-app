"use client";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFish,
  faNewspaper,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const Header: React.FC = () => {
  const pathname = usePathname();

  const isActivePath = (path: string): boolean => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { path: "/", icon: faNewspaper, label: "記事一覧" },
    { path: "/about", icon: faCircleInfo, label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <nav className="bg-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* ロゴ部分 */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-xl font-bold text-white transition hover:text-blue-300"
              >
                <FontAwesomeIcon icon={faFish} className="mr-2 size-6" />
                <span>MyBlog</span>
              </Link>
            </div>

            {/* ナビゲーションリンク */}
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={twMerge(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition",
                    isActivePath(item.path)
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={twMerge(
                      "mr-1.5 size-4",
                      isActivePath(item.path)
                        ? "text-blue-300"
                        : "text-slate-400"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
