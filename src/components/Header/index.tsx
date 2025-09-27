import React, { useState, useEffect, FC } from "react";
import Logo from "@/shared/Logo";
import MenuBar from "@/shared/MenuBar";
import LangDropdown from "@/app/(site)/[lang]/(client-components)/(Header)/LangDropdown";
import NotifyDropdown from "@/app/(site)/[lang]/(client-components)/(Header)/NotifyDropdown";
import AvatarDropdown from "@/app/(site)/[lang]/(client-components)/(Header)/AvatarDropdown";
import HeroSearchForm2MobileFactory from "@/app/(site)/[lang]/(client-components)/(HeroSearchForm2Mobile)/HeroSearchForm2MobileFactory";
import Link from "next/link";
import ShimmerButton from "@/components/ui/shimmer-button";
import GlobalSearchModal from "../GlobalSearch";
import SwitchDarkMode from "@/shared/SwitchDarkMode";
import { usePathname } from "next/navigation";
import { onScroll } from "@/libs/scrollActive";
import { useSession } from "next-auth/react";
import { Route } from "@/routers/types";

export interface MainNav2Props {
  className?: string;
}

const MainNav2: FC<MainNav2Props> = ({ className = "" }) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

  const { data: session } = useSession();
  const pathUrl = usePathname();

  const handleStickyMenu = () => {
    if (window.scrollY > 0) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  useEffect(() => {
    if (pathUrl === "/") {
      window.addEventListener("scroll", onScroll);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathUrl]);

  const isActive = (path: string) => pathUrl === path;

  return (
    <div className={`MainNav2 relative z-10 ${className}`}>
      <div className="container mx-auto px-4">
        <div
          className={`px-6 h-16 flex justify-between items-center transition-all duration-300 ${
            stickyMenu
              ? "fixed top-4 left-4 right-4 bg-white/90 backdrop-blur-sm shadow-sm dark:bg-neutral-900/90 z-50 rounded-[30px]"
              : "relative rounded-[30px] bg-white/90 backdrop-blur-sm shadow-sm dark:bg-neutral-900/90"
          }`}
        >
          {/* Left Section (Web Only) */}
          <div className="hidden md:flex justify-start flex-1 space-x-3 sm:space-x-8 lg:space-x-10">
            <Logo size="md" />
            <div className="hidden lg:block self-center h-10 border-l border-neutral-300 dark:border-neutral-500"></div>
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/price-intelligence"
                className={`text-sm font-medium ${
                  isActive("/price-intelligence")
                    ? "bg-primary/5 text-primary dark:bg-white/5 dark:text-white"
                    : "text-black hover:bg-primary/5 hover:text-primary dark:text-gray-5 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                Price Intelligence
              </Link>
              <Link
                href="/listing-session"
                className={`text-sm font-medium relative cursor-not-allowed opacity-70 ${
                  isActive("/listing-session")
                    ? "bg-primary/5 text-primary dark:bg-white/5 dark:text-white"
                    : "text-black hover:bg-primary/5 hover:text-primary dark:text-gray-5 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
                onClick={(e) => e.preventDefault()}
              >
                Trend Forecasts
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Soon
                </span>
              </Link>
              <Link
                href="/author"
                className={`text-sm font-medium relative cursor-not-allowed opacity-70 ${
                  isActive("/author")
                    ? "bg-primary/5 text-primary dark:bg-white/5 dark:text-white"
                    : "text-black hover:bg-primary/5 hover:text-primary dark:text-gray-5 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
                onClick={(e) => e.preventDefault()}
              >
                Fashion Intelligence
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Soon
                </span>
              </Link>
              <Link
                href={"/#pricing" as Route<string>}
                className={`text-sm font-medium relative cursor-not-allowed opacity-70 ${
                  isActive("/#pricing")
                    ? "bg-primary/5 text-primary dark:bg-white/5 dark:text-white"
                    : "text-black hover:bg-primary/5 hover:text-primary dark:text-gray-5 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
                onClick={(e) => e.preventDefault()}
              >
                Plans & Pricing
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Soon
                </span>
              </Link>
            </div>
          </div>

          {/* Center Section (Mobile Only) */}
          <div className="self-center lg:hidden flex-[3] max-w-lg mx-auto md:px-3 flex items-center">
            {/* Mobile Logo */}
            <div className="flex-shrink-0 mr-2">
              <Logo size="sm" />
            </div>
            <button
              onClick={() => setSearchModalOpen(true)}
              className="dark:border-neutral-6000 relative flex w-full items-center rounded-full border border-neutral-200 px-4 py-2 pr-12 shadow-lg"
            >
              <span className="flex-1 text-left">
                <span className="block text-sm font-medium">Search Trends</span>
                <span className="mt-0.5 block text-xs font-light text-neutral-500 dark:text-neutral-400">
                  Forecasts, demand, assortments
                </span>
              </span>
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-black">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 18 18"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_369_1884)">
                      <path
                        d="M16.9347 15.3963L12.4816 11.7799C14.3168 9.26991 14.1279 5.68042 11.8338 3.41337C10.6194 2.19889 9.00003 1.52417 7.27276 1.52417C5.54549 1.52417 3.92617 2.19889 2.71168 3.41337C0.201738 5.92332 0.201738 10.0256 2.71168 12.5355C3.92617 13.75 5.54549 14.4247 7.27276 14.4247C8.91907 14.4247 10.4574 13.804 11.6719 12.6975L16.179 16.3409C16.287 16.4219 16.4219 16.4759 16.5569 16.4759C16.7458 16.4759 16.9077 16.3949 17.0157 16.26C17.2316 15.9901 17.2046 15.6122 16.9347 15.3963ZM7.27276 13.2102C5.86935 13.2102 4.5739 12.6705 3.57532 11.6719C1.52418 9.62076 1.52418 6.30116 3.57532 4.27701C4.5739 3.27843 5.86935 2.73866 7.27276 2.73866C8.67617 2.73866 9.97162 3.27843 10.9702 4.27701C13.0213 6.32815 13.0213 9.64775 10.9702 11.6719C9.99861 12.6705 8.67617 13.2102 7.27276 13.2102Z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_369_1884">
                        <rect
                          width="17.2727"
                          height="17.2727"
                          fill="white"
                          transform="translate(0.363647 0.363647)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
              </div>
            </button>
            <Link 
              href="/search"
              className="flex h-9 w-9 items-center justify-center rounded-full ml-2 text-black"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5Z"/>
              </svg>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex space-x-4 items-center">
              {session && (
                <div className="relative">
                  <Link href={"/add-session" as Route<string>} onClick={(e) => e.preventDefault()}>
                    <ShimmerButton
                      shimmerColor="#ffffff33"
                      className="font-medium dark:!text-white opacity-70 cursor-not-allowed"
                    >
                      New Forecast
                    </ShimmerButton>
                  </Link>
                  <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-medium text-white">
                    Soon
                  </span>
                </div>
              )}
              <div className="mt-7 flex flex-wrap items-center lg:mt-0">
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="text-waterloo hidden h-[38px] w-[38px] items-center justify-center rounded-full sm:flex"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 18 18"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_369_1884)">
                      <path
                        d="M16.9347 15.3963L12.4816 11.7799C14.3168 9.26991 14.1279 5.68042 11.8338 3.41337C10.6194 2.19889 9.00003 1.52417 7.27276 1.52417C5.54549 1.52417 3.92617 2.19889 2.71168 3.41337C0.201738 5.92332 0.201738 10.0256 2.71168 12.5355C3.92617 13.75 5.54549 14.4247 7.27276 14.4247C8.91907 14.4247 10.4574 13.804 11.6719 12.6975L16.179 16.3409C16.287 16.4219 16.4219 16.4759 16.5569 16.4759C16.7458 16.4759 16.9077 16.3949 17.0157 16.26C17.2316 15.9901 17.2046 15.6122 16.9347 15.3963ZM7.27276 13.2102C5.86935 13.2102 4.5739 12.6705 3.57532 11.6719C1.52418 9.62076 1.52418 6.30116 3.57532 4.27701C4.5739 3.27843 5.86935 2.73866 7.27276 2.73866C8.67617 2.73866 9.97162 3.27843 10.9702 4.27701C13.0213 6.32815 13.0213 9.64775 10.9702 11.6719C9.99861 12.6705 8.67617 13.2102 7.27276 13.2102Z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_369_1884">
                        <rect
                          width="17.2727"
                          height="17.2727"
                          fill="white"
                          transform="translate(0.363647 0.363647)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
                <Link 
                  href="/search"
                  className="text-waterloo hidden h-[38px] w-[38px] items-center justify-center rounded-full sm:flex ml-2"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5Z"/>
                  </svg>
                </Link>
              </div>
              <LangDropdown />
              <SwitchDarkMode />
              {session && <NotifyDropdown />}
              <AvatarDropdown />
            </div>

            <div className="flex space-x-2 lg:hidden items-center">
              {session && <NotifyDropdown />}
              <AvatarDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - keep outside the container for full-width background */}
      <div
        className={`lg:hidden ${
          navbarOpen ? "block" : "hidden"
        } bg-white dark:bg-gray-dark p-4`}
      >
        <nav>
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                href="/price-intelligence"
                onClick={() => setNavbarOpen(false)}
                className={`text-sm font-medium ${
                  isActive("/price-intelligence")
                    ? "bg-primary/5 text-primary dark:bg-white/5 dark:text-white"
                    : "text-black hover:bg-primary/5 hover:text-primary dark:text-gray-5 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                Price Intelligence
              </Link>
            </li>
            <li>
              <Link
                href="/listing-session"
                onClick={(e) => {
                  e.preventDefault();
                  setNavbarOpen(false);
                }}
                className={`text-sm font-medium relative cursor-not-allowed opacity-70 ${
                  isActive("/listing-session")
                    ? "bg-primary/5 text-primary dark:bg-white/5 dark:text-white"
                    : "text-black hover:bg-primary/5 hover:text-primary dark:text-gray-5 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                Trend Forecasts
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Soon
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/author"
                onClick={(e) => {
                  e.preventDefault();
                  setNavbarOpen(false);
                }}
                className={`text-sm font-medium relative cursor-not-allowed opacity-70 ${
                  isActive("/author")
                    ? "bg-primary/5 text-primary dark:bg-white/5 dark:text-white"
                    : "text-black hover:bg-primary/5 hover:text-primary dark:text-gray-5 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                Fashion Intelligence
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Soon
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={"/#pricing" as Route<string>}
                onClick={(e) => {
                  e.preventDefault();
                  setNavbarOpen(false);
                }}
                className={`text-sm font-medium relative cursor-not-allowed opacity-70 ${
                  isActive("/#pricing")
                    ? "bg-primary/5 text-primary dark:bg-white/5 dark:text-white"
                    : "text-black hover:bg-primary/5 hover:text-primary dark:text-gray-5 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                Plans & Pricing
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Soon
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <GlobalSearchModal
        searchModalOpen={searchModalOpen}
        setSearchModalOpen={setSearchModalOpen}
      />
    </div>
  );
};

export default MainNav2;
