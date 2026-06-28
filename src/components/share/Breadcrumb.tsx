"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-gray-600 py-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-black transition-colors text-[#747474] dark:text-white/50 dark:hover:text-white-30"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-black dark:text-white">{item.label}</span>
            )}

            {!isLast && (
              <ChevronRight size={16} className="mx-1 text-[#747474] dark:text-white/50" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
