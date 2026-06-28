# 🛒 Dazzle - Premium Multivendor eCommerce Platform

Dazzle is a modern, high-performance Multivendor eCommerce platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **TailwindCSS v4**. The application is optimized for speed, visual elegance (supporting light/dark theme modes), Server-Side Rendering (SSR), and Search Engine Optimization (SEO).

---

## 🚀 Tech Stack

- **Core Framework:** [Next.js 16.2.1](https://nextjs.org/) (App Router)
- **UI Library:** [React 19.2.4](https://react.dev/)
- **Programming Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [TailwindCSS v4](https://tailwindcss.com/) with [@tailwindcss/postcss](https://github.com/tailwindlabs/tailwindcss/tree/main/packages/%40tailwindcss-postcss)
- **State & Theme Management:** `next-themes` (Dark/Light mode toggler)
- **Forms & Validation:** `react-hook-form` + `yup` + `@hookform/resolvers`
- **Sliders & Carousels:** `swiper`
- **Routing Loader:** `nextjs-toploader`

---

## 📂 Project Directory Structure

```
dazzle/
├── public/                     # Static assets (images, icons, logos)
├── src/
│   ├── app/                    # Next.js App Router root
│   │   ├── (public)/           # Public page groups (SEO-focused)
│   │   │   ├── about-us/       # About page (Server Component)
│   │   │   ├── blogs/          # Blogs directory
│   │   │   │   ├── [blogSlug]/ # Dynamic blog details (Dynamic SEO)
│   │   │   │   └── page.tsx    # Blogs list
│   │   │   ├── brands/         # Brand listings
│   │   │   ├── categories/     # Categories directories
│   │   │   │   ├── [categorySlug]/ # Category details (Dynamic SEO)
│   │   │   │   │   └── [subCategorySlug]/ # Subcategory detail (Dynamic SEO)
│   │   │   │   └── page.tsx    # Category list
│   │   │   ├── career/         # Careers directory
│   │   │   │   ├── [slug]/     # Dynamic job details (Server Component, Dynamic SEO)
│   │   │   │   └── page.tsx    # Job board (Server Component + Client Slider)
│   │   │   ├── corporate/      # Corporate Connectivity page (Client Form + Layout SEO)
│   │   │   ├── feedback/       # Feedback submission (Client Form + Layout SEO)
│   │   │   ├── privacy-policy/ # Privacy Policy policy page (Server Component)
│   │   │   ├── product/        # Shop and Product listings
│   │   │   │   ├── [productSlug]/ # Dynamic product details (Dynamic SEO)
│   │   │   │   └── page.tsx    # Product catalog list
│   │   │   ├── profile/        # User dashboard & Profile settings
│   │   │   └── support/        # Help Desk & Contact (Client Form + Layout SEO)
│   │   ├── auth/               # Auth routes (Login, Registration, OTP, Forgot Password)
│   │   ├── trade-in/           # Trade-In page (Client Page + Layout SEO)
│   │   ├── globals.css         # Tailwind v4 globals stylesheet
│   │   ├── layout.tsx          # Root Layout (global metadata template, top loader)
│   │   ├── not-found.tsx       # Custom 404 Error page
│   │   └── providers.tsx       # Global contexts and provider wrappers
│   ├── components/             # Reusable UI Components
│   │   ├── career/             # Career components (CareerSlider client swiper)
│   │   ├── HomePage/           # Home-specific layouts (bannners, tabs, countdowns)
│   │   ├── layout/             # Layout components (Header, Footer, MainNav, MobileFooter)
│   │   ├── share/              # Shared elements (Breadcrumbs, Countdown, Tabs)
│   │   └── ui/                 # Atomic UI primitives
│   ├── context/                # Theme and Modal React context files
│   ├── hooks/                  # Custom React hooks (useCountdown)
│   ├── icon/                   # SVG Icons and Lucide wrappers
│   ├── images/                 # Bundled static images
│   ├── schemas/                # Yup Form Validation Schemas (register, login, corporate)
│   └── types/                  # Shared TypeScript interfaces & types
├── next.config.ts              # Next.js configurations (image remotePatterns)
├── package.json                # Project script commands and dependencies
└── tsconfig.json               # TypeScript configurations
```

---

## 🛠️ Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

3. **Production build:**
   ```bash
   npm run build
   ```

4. **Start the built production server:**
   ```bash
   npm run start
   ```

5. **Linting and code style checking:**
   ```bash
   npm run lint
   ```

---

## 🔍 SEO & SSR Architecture

To achieve the best possible performance and organic search rankings, we use a hybrid rendering approach:

### 1. Static and Policy Pages (Pure SSR/SSG)
Pages such as `about-us`, `privacy-policy`, `emi-policy`, `exchange-policy`, `refund-policy`, `terms-conditions`, and `warranty-policy` are written as **React Server Components** (RSCs) without `"use client"`. They export static metadata:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title - Dazzle",
  description: "Meta description for indexing.",
};
```

### 2. Pages with Client Interaction (Layout Metadata Wrapper)
For pages that contain heavy state management or forms (e.g. `corporate`, `feedback`, `support`, `trade-in`), the page files use `"use client"`. To provide SEO metadata without shifting client forms, we use a parent `layout.tsx` file inside that route's directory:
```tsx
// src/app/(public)/support/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get In Touch & Support Center - Dazzle",
  description: "Reach out to Dazzle customer support.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### 3. Dynamic Pages (Dynamic Server Rendering)
Dynamic routes like `/product/[productSlug]`, `/categories/[categorySlug]`, and `/blogs/[blogSlug]` use dynamic SEO generation to resolve headings and description tags on the server before sending HTML to the client:
```tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productSlug } = await params;
  const decoded = decodeURIComponent(productSlug);
  const title = decoded.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    title: `${title} - Buy Online at Best Price in BD - Dazzle`,
    description: `Buy ${title} in Bangladesh from Dazzle with official brand warranty.`,
  };
}
```

---

## 🛠️ How to Extend the Project

This project is built to be easily expandable. Follow these patterns when adding new features:

### 1. Adding a New Page (SSR Page)
1. Create a folder in `src/app/(public)/new-page/`
2. Create `page.tsx`:
   ```tsx
   import type { Metadata } from "next";

   export const metadata: Metadata = {
     title: "New Page - Dazzle",
     description: "Describe the new page.",
   };

   export default function NewPage() {
     return (
       <main className="max-w-355 mx-auto px-4 py-8">
         <h1>New Page</h1>
       </main>
     );
   }
   ```

### 2. Adding a New Client-Interactive Page (with Form)
1. Create `src/app/(public)/contact-form/page.tsx` with `"use client"` at the top.
2. Define the schema in `src/schemas/contactSchema.ts`.
3. Create `src/app/(public)/contact-form/layout.tsx` as a Server Component and export its `metadata` (so it indexes with SEO).

### 3. Creating a Client-only Carousel or Interactive Element on a Server Page
Keep the main page as a Server Component, and extract the interactive widget to the `src/components/` folder:
1. Define the widget in `src/components/share/NewSlider.tsx` with `"use client"`.
2. Import the widget in your `page.tsx` (Server Component). This is the best approach to balance UX and SSR performance.

### 4. Adding a Global State Context
1. Create a context file in `src/context/CartContext.tsx` (using `"use client"`).
2. Register the context inside the global theme and wrapper providers.

---

## 🔌 API Integration, Proxy (URL Hiding) & React Query Hydration

This project is configured with a production-grade API architecture that implements **backend URL privacy** and **hybrid SSR using React Query hydration**.

### 💡 Quick Comparison: Using API on both Server & Client

The `api` helper at `src/lib/api.ts` automatically adapts its behavior based on where it is executed:

| Feature / Aspect | Server-Side Fetching (No `"use client"`) | Client-Side Fetching (With `"use client"`) |
| :--- | :--- | :--- |
| **Execution Environment** | Next.js Server Components / Actions / Route Handlers | Browser (React Client Components) |
| **API Path Used** | `https://apix.bigpoint.com.bd` (Direct, server-to-server) | `/api/proxy` (Proxied through Route Handlers) |
| **URL Exposure** | Fully hidden (runs completely behind the firewall) | Fully hidden (Network tab only displays `/api/proxy/...`) |
| **Performance** | Maximum speed (direct server fetch) | Optimized caching via client proxy |
| **Authorization Token** | Auto-reads token from browser **cookies** | Auto-reads token from **cookies** or **localStorage** |

---

### Key Features
1. **Backend URL Hiding (Proxy)**: 
   - Requests from the browser go to the local route `/api/proxy/...` (e.g. `/api/proxy/auth/login`).
   - The server catches these requests and forwards them to `https://apix.bigpoint.com.bd` via Next.js Route Handlers (`src/app/api/proxy/[...path]/route.ts`).
   - The browser's Network tab **only** displays `/api/proxy/...`, completely hiding the real backend domain.
   - Server-side calls bypass the proxy and talk directly to the backend for maximum speed.
2. **React Query Hydration (Hybrid SSR)**:
   - Data is pre-fetched on the server (Server Component) during request time.
   - The cache state is dehydrated and passed to the client via `<HydrationBoundary>`.
   - On the client side, React Query hydrates this state, providing instantaneous, interactive data with zero initial browser fetch calls.

---

### Configuration

#### 1. Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_API_BASE=https://apix.bigpoint.com.bd
```

---

### Usage Patterns

#### 1. Server-Side Fetching (Direct SSR)
Used for purely static or server-rendered pages without client-side state interactions:
```tsx
import { api } from "@/lib/api";

interface Product {
  id: string;
  name: string;
}

export default async function ProductsPage() {
  try {
    // This call is made server-to-server. The URL is hidden from the client's network tab.
    const products = await api.get<Product[]>("/products", {
      cache: "no-store", // SSR Mode (always fetch fresh data)
    });

    return (
      <div>
        {products.map((p) => <p key={p.id}>{p.name}</p>)}
      </div>
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading products";
    return <p>{message}</p>;
  }
}
```

#### 2. Hybrid SSR (React Query + Hydration) - RECOMMENDED
Use this pattern when you want SEO-friendly initial render but also want React Query features like auto-refetching, caching, pagination, or client-side filtering.

##### Step A: Server Component (`page.tsx`)
```tsx
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { api } from "@/lib/api";
import ProductListClient from "./ProductListClient";

export default async function ProductsPage() {
  const queryClient = getQueryClient();

  // Prefetch data directly on the server
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListClient />
    </HydrationBoundary>
  );
}
```

##### Step B: Client Component (`ProductListClient.tsx`)
```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Product {
  id: string;
  name: string;
}

export default function ProductListClient() {
  // Instantly loads the data prefetched on the server.
  // When refetching, it automatically queries "/api/proxy/products" to hide the real URL.
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api.get("/products"),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {products?.map((p) => <p key={p.id}>{p.name}</p>)}
    </div>
  );
}
```

---

#### 3. Authentication & Auto Token Resolution
The `apiFetch` helper automatically attaches `Authorization: Bearer <token>` to headers:
- **On Browser (Client-side)**: It reads `token` cookie or `localStorage.getItem("token")`.
- **On Server (SSR)**: It reads the `token` cookie dynamically using `next/headers`.

To login and set the cookie:
```tsx
"use client";
import { api } from "@/lib/api";

export default function LoginForm() {
  const handleLogin = async () => {
    try {
      const res = await api.post<{ token: string }>("/auth/login", { email: "...", password: "..." });
      
      // Store in cookies so the Server can read it during SSR fetches
      document.cookie = `token=${res.token}; path=/; max-age=86400;`;
      localStorage.setItem("token", res.token);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to log in";
      alert(message);
    }
  };

  return <button onClick={handleLogin}>Log In</button>;
}
```
