"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronRight, ChevronLeft, LayoutDashboard } from "lucide-react";
import {
  AirpodIcon,
  CoverIcon,
  GadgetIcon,
  LaptopIcon,
  MobileIcon,
  ProtectorIcon,
  SoundIcon,
  TabletIcon,
  WatchIcon,
} from "@/icon";
import type { CategoryItem } from "./types";

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiBrand {
  uuid: string;
  brand_name: string;
  brand_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface ApiCategory {
  uuid: string;
  category_name: string;
  category_slug: string;
  thumbnail_img: string;
  is_featured: boolean;
  is_active: boolean;
  child: ApiBrand[];
}

type RawCategory = ApiCategory | CategoryItem;

// ─── Normalised Internal Types ────────────────────────────────────────────────

interface NormalizedBrand {
  uuid: string;
  label: string;
  brand_slug: string;
  logo: string;
  is_active: boolean;
  is_featured: boolean;
}

type CategoryIconName =
  | "MobileIcon"
  | "TabletIcon"
  | "LaptopIcon"
  | "WatchIcon"
  | "GadgetIcon"
  | "AirpodIcon"
  | "SoundIcon"
  | "CoverIcon"
  | "ProtectorIcon";

interface NormalizedCategory {
  uuid: string;
  label: string;
  category_slug: string;
  category_images?: string;
  icon: CategoryIconName | React.ReactNode;
  is_active: boolean;
  is_featured: boolean;
  children: NormalizedBrand[];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
  categories: RawCategory[];
  activeCategory: string;
  selectedBrand: string;
  onHoverCategory: (label: string) => void;
  onSelectBrand: (label: string) => void;
}

// ─── Type Guard ───────────────────────────────────────────────────────────────

function isApiCategory(cat: RawCategory): cat is ApiCategory {
  return "category_name" in cat;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryIconName(categoryName: string): CategoryIconName {
  const name = categoryName.toLowerCase().trim();
  if (name.includes("phone") || name.includes("mobile")) return "MobileIcon";
  if (name.includes("tablet")) return "TabletIcon";
  if (name.includes("laptop")) return "LaptopIcon";
  if (name.includes("smart watch") || name.includes("watch"))
    return "WatchIcon";
  if (name.includes("gadget")) return "GadgetIcon";
  if (name.includes("sound") || name.includes("audio")) return "SoundIcon";
  if (name.includes("accessories") || name.includes("cover"))
    return "CoverIcon";
  if (name.includes("airpod") || name.includes("earbud")) return "AirpodIcon";
  if (name.includes("protector") || name.includes("screen"))
    return "ProtectorIcon";
  return "GadgetIcon";
}

function renderCategoryIcon(icon: CategoryIconName | React.ReactNode) {
  if (typeof icon === "string") {
    const map: Record<CategoryIconName, React.ReactNode> = {
      MobileIcon: <MobileIcon />,
      TabletIcon: <TabletIcon />,
      LaptopIcon: <LaptopIcon />,
      WatchIcon: <WatchIcon />,
      GadgetIcon: <GadgetIcon />,
      AirpodIcon: <AirpodIcon />,
      SoundIcon: <SoundIcon />,
      CoverIcon: <CoverIcon />,
      ProtectorIcon: <ProtectorIcon />,
    };
    return map[icon as CategoryIconName] ?? <GadgetIcon />;
  }
  return icon;
}

function normalizeCategories(raw: RawCategory[]): NormalizedCategory[] {
  return raw.map((cat) => {
    // ── API format ──
    if (isApiCategory(cat)) {
      return {
        uuid: cat.uuid,
        label: cat.category_name,
        category_slug: cat.category_slug,
        category_images: cat.thumbnail_img,
        icon: getCategoryIconName(cat.category_name),
        is_active: cat.is_active,
        is_featured: cat.is_featured,
        children: (cat.child ?? []).map((brand) => ({
          uuid: brand.uuid,
          label: brand.brand_name,
          brand_slug: brand.brand_slug,
          logo: brand.thumbnail_img ?? "",
          is_active: brand.is_active,
          is_featured: brand.is_featured,
        })),
      };
    }

    return {
      uuid: "",
      label: cat.label,
      category_slug: cat.label.toLowerCase().replace(/\s+/g, "-"),
      icon: cat.icon,
      is_active: true,
      is_featured: false,
      children: (cat.children ?? []).map((child, idx) => ({
        uuid: String(idx),
        label: child.label,
        brand_slug: child.label.toLowerCase().replace(/\s+/g, "-"),
        logo: child.logo ?? "",
        is_active: true,
        is_featured: false,
      })),
    };
  });
}

function BrandLogo({
  logo,
  label,
  className,
}: {
  logo: string;
  label: string;
  className?: string;
}) {
  if (!logo) {
    return (
      <div className="h-8 w-full flex items-center justify-center rounded-md bg-gray-100">
        <span className="text-[10px] text-gray-400 font-medium text-center leading-tight px-1">
          No Image
        </span>
      </div>
    );
  }
  return (
    <Image
      src={logo}
      alt={label}
      width={80}
      height={32}
      className={className ?? "object-contain"}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExplorePanel({
  isOpen,
  onClose,
  isMobile,
  categories,
  activeCategory,
  selectedBrand: _selectedBrand,
  onHoverCategory,
  onSelectBrand,
}: Props) {
  const [mobileSubCategory, setMobileSubCategory] = useState<string | null>(
    null,
  );

  if (!isOpen) return null;
  const normalizedCategories = normalizeCategories(categories);
  
  const activeCat = normalizedCategories.find(
    (c) => c.label === activeCategory,
  );
  const mobileActiveCat = normalizedCategories.find(
    (c) => c.label === mobileSubCategory,
  );

  // ── Mobile: brand list ────────────────────────────────────────────────────
  if (isMobile && mobileSubCategory && mobileActiveCat) {
    return (
      <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-2xl bg-white shadow-xl border border-gray-100 max-h-[75vh] overflow-y-auto">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <button
            onClick={() => setMobileSubCategory(null)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F5F5] text-gray-600"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="flex items-center gap-2 font-semibold text-sm text-primary dark:text-black">
            {/* {renderCategoryIcon(mobileActiveCat.icon)} */}
            {mobileActiveCat.category_images ? (
                    <Image
                      src={mobileActiveCat.category_images}
                      alt={mobileActiveCat.label}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  ) : (
                    renderCategoryIcon(mobileActiveCat.icon)
                  )}

            {mobileActiveCat.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 py-2 px-4">
  {mobileActiveCat.children.map((brand) => (
    <Link
      key={brand.uuid || brand.label}
      href={`/brands/${brand.brand_slug || brand.label.toLowerCase()}`}
      onClick={() => {
        onSelectBrand(brand.label);
        onClose();
      }}
      className="flex flex-col items-center justify-center rounded-lg p-3 text-center text-sm text-[#222222] hover:bg-[#E9CCAE33] active:bg-[#E9CCAE66] transition-colors border border-[#2222]"
    >
      {/* {brand.logo && (
        <BrandLogo
          logo={brand.logo}
          label={brand.label}
          className="h-8 w-auto object-contain mb-2"
        />
      )} */}

      <span className="font-medium">{brand.label}</span>
    </Link>
  ))}
</div>
      </div>
    );
  }

  // ── Mobile: category list ─────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-2xl bg-white shadow-xl border border-gray-100 max-h-[75vh] overflow-y-auto">
        <div className="flex flex-col py-2">
          <Link
            href={`/categories`}
            onClick={() => {
              onClose();
            }}
            className="flex items-center gap-3 px-5 py-3.5 text-sm text-[#222222] hover:bg-[#E9CCAE33] active:bg-[#E9CCAE66] transition-colors"
          >
            <LayoutDashboard className="h-4 w-auto object-contain" />
            <span className="font-medium"> All Category </span>
          </Link>

          {normalizedCategories.map((cat) => {
            const hasChildren = cat.children.length > 0;
            if (hasChildren) {
              return (
                <button
                  key={cat.uuid || cat.label}
                  onClick={() => setMobileSubCategory(cat.label)}
                  className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-[#222222] hover:bg-[#E9CCAE33] active:bg-[#E9CCAE66] transition-colors"
                >
                  <span className="flex items-center gap-3">
                   {cat.category_images ? (
                    <Image
                      src={cat.category_images}
                      alt={cat.label}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  ) : (
                    renderCategoryIcon(cat.icon)
                  )}
                    {cat.label}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              );
            }
            return (
              <Link
                key={cat.uuid || cat.label}
                href={
                  cat.category_slug
                    ? `/categories/${cat.category_slug}`
                    : "/brands/"
                }
                onClick={onClose}
                className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-[#222222] hover:bg-[#E9CCAE33] active:bg-[#E9CCAE66] transition-colors"
              >
                <span className="flex items-center gap-3">
                  {cat.category_images ? (
                    <Image
                      src={cat.category_images}
                      alt={cat.label}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  ) : (
                    renderCategoryIcon(cat.icon)
                  )}
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Desktop ───────────────────────────────────────────────────────────────
  console.log("API Response for categories/brands:", activeCat);
  return (
    <div className="absolute z-999 top-full left-0 mt-2 bg-white dark:bg-[#393430] border border-gray-100 rounded-2xl shadow-2xl flex overflow-hidden w-[580px] max-h-[420px]">
      {/* Category sidebar */}
      <div className="w-53.75 shrink-0 border-r border-gray-100 overflow-y-auto p-2">
        {normalizedCategories.map((cat) => (
          <button
            key={cat.uuid || cat.label}
            onClick={() => onHoverCategory(cat.label)}
            className={`w-full flex items-center justify-between rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors ${
              activeCategory === cat.label
                ? "bg-[#E9CCAE66] text-black dark:text-white"
                : "text-[#222222] hover:bg-gray-50 dark:hover:bg-[#E9CCAE66]/20 dark:text-gray-300"
            }`}
          >
            <span className="flex items-center gap-1">
              {/* {renderCategoryIcon(cat.icon)} */}
              {cat.category_images ? (
                <Image
                  src={cat.category_images}
                  alt={cat.label}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              ) : (
                renderCategoryIcon(cat.icon)
              )}

              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Brand grid */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {activeCat?.children.map((brand) => (
            <Link
              key={brand.uuid || brand.label}
              href={`/brands/${brand.brand_slug || brand.label.toLowerCase()}`}
              onClick={() => {
                onSelectBrand(brand.label);
                onClose();
              }}
              className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border border-gray-200 hover:border-[#D4A97A]"
            >
              <BrandLogo
                logo={brand.logo}
                label={brand.label}
                className="h-8 w-auto object-contain"
              />
              <span className="text-[11px] text-black dark:text-gray-300 font-medium">
                {brand.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
