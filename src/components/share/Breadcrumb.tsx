// Server Component (no "use client").
// This is purely presentational — no hooks, event handlers or browser APIs — and
// it is rendered from 26 server components (nearly every category/product/blog
// page), so keeping it in the client bundle added hydration work on almost every
// route for markup that never changes after render.
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
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm text-gray-600 lg:pt-6 pt-3 pb-3"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.href ?? ""}-${item.label}`} className="flex items-center">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-black dark:hover:text-white transition-colors text-[#747474] dark:text-white/50 dark:hover:text-white-30"
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
