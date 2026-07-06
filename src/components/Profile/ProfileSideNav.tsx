/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  Edit2,
  LogOut,
  Moon,
  Star,
  Sun,
  X,
  Camera,
  Loader2,
} from "lucide-react";
import { ActiveLabel } from "./profile.types";
import { menuItems } from "./profile.data";
import { useTheme } from "next-themes";
import { logout } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/store/hooks";
import { useUpdateUserInfo, getInitials } from "@/hooks/useUserProfile";
import Image from "next/image";
import NoImages from "@/images/no_images.png";

interface ProfileSideNavProps {
  activeLabel: ActiveLabel;
  darkMode: boolean;
  onMenuClick: (label: ActiveLabel) => void;
  onToggleDarkMode: () => void;
  showChevrons?: boolean;
}

// ─── Edit Profile Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  onClose: () => void;
}

const EditProfileModal: React.FC<EditModalProps> = ({ onClose }) => {
  // সরাসরি Redux store থেকে profile data
  const profileData = useAppSelector((state) => state.profile.data);
  const {
    mutate: updateUser,
    isPending,
    error,
    data: updateResult,
  } = useUpdateUserInfo();

  const [fullName, setFullName] = useState(profileData?.userFullName ?? "");
  const [mobile, setMobile] = useState(profileData?.mobile ?? "");
  const [address, setAddress] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profileData?.userAvatar ?? null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileData) {
      setFullName((prev) => prev || profileData.userFullName);
      setMobile((prev) => prev || profileData.mobile);
      setAvatarPreview(profileData.userAvatar ?? null);
    }
  }, [profileData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateUser(
      {
        userFullName: fullName,
        mobile,
        address: address || undefined,
        userAvatar: avatarFile,
      },
      {
        onSuccess: (res) => {
          if (res.statusCode === 200) onClose();
        },
      },
    );
  };

  const apiErrors: string[] = (() => {
    if (updateResult?.errors?.length) return updateResult.errors;
    if (error) {
      try {
        const parsed = JSON.parse(error.message);
        return parsed.errors ?? (parsed.message ? [parsed.message] : []);
      } catch {
        return [error.message];
      }
    }
    return [];
  })();

  const initials = fullName ? getInitials(fullName) : "?";

  // blob: URL বা যেকোনো external URL — Next.js <Image> না দিয়ে <img> use করো
  const AvatarPreview = () => {
    if (avatarPreview) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarPreview}
          alt="Avatar preview"
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <span className="text-2xl font-bold text-gray-500 dark:text-gray-300">
        {initials}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#1c1917] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Top Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Avatar picker */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-[#393430] flex items-center justify-center shrink-0">
                <AvatarPreview />
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00AE51] flex items-center justify-center shadow-md hover:bg-[#009944] transition-colors"
              >
                <Camera size={13} className="text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-label="Upload avatar"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1E1B18] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D3F0E]/40 transition"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              required
              placeholder="Numbers only"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1E1B18] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D3F0E]/40 transition"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Address{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1E1B18] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D3F0E]/40 transition"
            />
          </div>

          {/* API errors */}
          {apiErrors.length > 0 && (
            <ul className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-3 space-y-1">
              {apiErrors.map((err, i) => (
                <li key={i} className="text-xs text-red-600 dark:text-red-400">
                  {err}
                </li>
              ))}
            </ul>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#00AE51] hover:bg-[#009944] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── ProfileSideNav ────────────────────────────────────────────────────────────

const ProfileSideNav: React.FC<ProfileSideNavProps> = ({
  activeLabel,
  onMenuClick,
  onToggleDarkMode,
  showChevrons = false,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);

  // ── সরাসরি Redux store থেকে profile data ──
  const profileData = useAppSelector((state) => state.profile.data);
  const isFetched = useAppSelector((state) => state.profile.isFetched);

  const initials = profileData?.userFullName
    ? getInitials(profileData.userFullName)
    : null;
  const isLoading = !isFetched && !profileData;

  const onToggleDarkMode2 = () => {
    onToggleDarkMode();
    setTheme(isDark ? "light" : "dark");
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/";
  };

  return (
    <>
      <div className="w-full">
        {/* Profile card */}
        <div className="bg-[#F7F7F7] dark:bg-[#393430] p-[6px] pr-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="bg-white rounded-lg w-[62px] h-[62px] flex justify-center items-center shadow-sm overflow-hidden shrink-0">
              {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : profileData?.avatarSrc ? (
                <Image
                  src={profileData.avatarSrc}
                  alt={profileData?.userFullName || "User"}
                  width={54}
                  height={54}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : profileData?.userAvatar ? (
                <Image
                  src={NoImages}
                  alt="Default avatar"
                  width={54}
                  height={54}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : initials ? (
                <span className="text-xl font-bold text-[#6D3F0E]">
                  {initials}
                </span>
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
              )}
            </div>

            {/* Name + mobile — Redux store থেকে */}
            <div>
              {isLoading ? (
                <>
                  <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-1.5" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <p className="text-base text-gray-800 dark:text-white font-semibold leading-tight">
                    {profileData?.userFullName ?? "—"}
                  </p>
                  <p className="text-sm font-medium text-gray-400 mt-0.5">
                    {profileData?.mobile ?? "—"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-[#00AE51] flex items-center gap-1.5 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-[#009944] transition-colors shrink-0"
          >
            <Edit2 size={13} /> Edit
          </button>
        </div>

        {/* Earning Points — Redux store থেকে */}
        <div
          className="p-0.5 mt-3 rounded-full cursor-pointer"
          style={{
            background:
              "linear-gradient(90deg,#3202B9 0%,#85FFB4 43.75%,#FF9800 100%)",
          }}
        >
          <div className="bg-white dark:bg-[#2A2520] p-1.5 pr-5 rounded-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FFF8EC] rounded-full flex items-center justify-center">
                <Star size={18} className="text-yellow-500 fill-yellow-400" />
              </div>
              <span className="text-sm text-gray-800 dark:text-white font-semibold">
                Your Earning Points
              </span>
            </div>
            <span className="text-sm text-[#965C20] font-bold">
              {isLoading ? (
                <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse" />
              ) : (
                (profileData?.purchasePoint ?? 0)
              )}
            </span>
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
                  ${isActive ? "bg-[#6D3F0E] text-white" : "text-gray-400 hover:bg-[#6D3F0E] hover:text-white"}`}
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
                    className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-800 dark:text-white group-hover:text-white"}`}
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
          <div className="md:hidden flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2.5">
              {isDark ? (
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
              className={`w-11 h-6 rounded-full transition-colors relative ${isDark ? "bg-gray-800" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDark ? "translate-x-5 left-0.5" : "left-0.5"}`}
              />
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full text-gray-400 hover:text-[#d4a97a] transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium text-gray-800 dark:text-white hover:text-[#d4a97a]">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
};

export default ProfileSideNav;
