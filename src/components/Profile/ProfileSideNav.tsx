"use client";
import { ChevronRight, Edit2, LogOut, Moon, Star, Sun } from "lucide-react";
import { ActiveLabel } from "./profile.types";
import { menuItems } from "./profile.data";
import { useTheme } from "next-themes";

interface ProfileSideNavProps {
  activeLabel: ActiveLabel;
  darkMode: boolean;
  onMenuClick: (label: ActiveLabel) => void;
  onToggleDarkMode: () => void;
  showChevrons?: boolean;
}

const ProfileSideNav: React.FC<ProfileSideNavProps> = ({
  activeLabel,
  darkMode,
  onMenuClick,
  onToggleDarkMode,
  showChevrons = false,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  const isDark = currentTheme === "dark";
  const onToggleDarkMode2 = () => {
    onToggleDarkMode();
    setTheme(isDark ? "light" : "dark");
  };
  return (
    <div className="w-full">
      {/* Profile card */}
      <div className="bg-[#F7F7F7] dark:bg-[#393430]  p-[6px] pr-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg w-[62px] h-[62px] flex justify-center items-center shadow-sm">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          </div>
          <div>
            <p className="text-base text-gray-800 dark:text-white font-semibold">
              Rahnum Ema
            </p>
            <p className="text-sm font-medium text-gray-400">01737838838</p>
          </div>
        </div>
        <button className="bg-[#00AE51] flex items-center gap-1.5 text-white rounded-md px-3 py-1 text-sm font-medium">
          <Edit2 size={13} /> Edit
        </button>
      </div>

      {/* Earning Points */}
      <div
        className="p-0.5 mt-3 rounded-full cursor-pointer"
        style={{
          background:
            "linear-gradient(90deg,#3202B9 0%,#85FFB4 43.75%,#FF9800 100%)",
        }}
      >
        <div className="bg-white p-1.5 pr-5 rounded-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#FFF8EC] rounded-full flex items-center justify-center">
              <Star size={18} className="text-yellow-500 fill-yellow-400" />
            </div>
            <span className="text-sm text-gray-800 font-semibold">
              Your Earning Points
            </span>
          </div>
          <span className="text-sm text-[#965C20] font-bold">800</span>
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-[#F7F7F7] dark:bg-[#393430] rounded-xl mt-4 p-4 space-y-1">
        {menuItems.map(({ label, icon: Icon }) => {
          const isActive = activeLabel === label && !showChevrons;
          return (
            <button
              key={label}
              onClick={() => onMenuClick(label as ActiveLabel)}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-colors
                ${
                  isActive
                    ? "bg-[#6D3F0E] text-white"
                    : "text-gray-400 hover:bg-[#6D3F0E] hover:text-white"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={18}
                  className={
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }
                />
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-white"
                      : "text-gray-800 dark:text-white group-hover:text-white"
                  }`}
                >
                  {label}
                </span>
              </div>
              {showChevrons && (
                <ChevronRight
                  size={16}
                  className="text-gray-400 group-hover:text-white"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Dark Mode + Logout */}
      <div className="bg-[#F7F7F7] dark:bg-[#393430] rounded-xl mt-3 p-4 space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2.5">
            {darkMode ? (
              <Moon size={18} className="text-gray-400" />
            ) : (
              <Sun size={18} className="text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              Dark Mode
            </span>
          </div>
          <button
            onClick={onToggleDarkMode2}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              darkMode ? "bg-gray-800" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                darkMode ? "translate-x-5 left-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>
        <button className="flex items-center gap-2.5 px-3 py-2.5 w-full text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={18} />
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSideNav;
