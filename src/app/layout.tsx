import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { dehydrate } from "@tanstack/react-query";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/MobileFooter";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "@/app/providers/QueryProvider";
import ReduxProvider from "@/app/providers/ReduxProvider";
import { Toaster } from "react-hot-toast";
import { getSiteSettings, stripHtml } from "@/lib/getSiteSettings";
import { getQueryClient } from "@/lib/query-client";
import type { SiteSettingsData } from "@/store/slices/siteSettingsSlice";
import JsonLd from "@/components/share/JsonLd";
import {
  buildJsonLd,
  organizationSchema,
  webSiteSchema,
} from "@/lib/structured-data";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
});
const FALLBACK_ICON = "https://dazzle.sgp1.cdn.digitaloceanspaces.com/32680/logo.png";
const FALLBACK_TITLE = "Best Mobile, Laptop and Gadget Shop In Bangladesh - Dazzle";
const FALLBACK_DESCRIPTION =
  "Shop the best mobile phones, laptops, and gadgets in Bangladesh at Dazzle. Exclusive deals, genuine products, fast delivery.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();


  const title = settings.metaTitle || settings.siteTitle || FALLBACK_TITLE;
  const description = stripHtml(settings.metaDescription) || FALLBACK_DESCRIPTION;
  const siteName = settings.siteTitle || "Dazzle";

  const logoUrl = settings.siteLogo || FALLBACK_ICON;
  const iconUrl = settings.favicon || FALLBACK_ICON;

  return {
    title: {
      default: title,
      template: `%s - ${siteName}`,
    },
    description,
    keywords: settings.metaKeywords || undefined,
    metadataBase: new URL("https://dazzle.com.bd"),
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    },
    openGraph: {
      siteName,
      locale: "en_BD",
      type: "website",
      title,
      description,
      images: [{ url: logoUrl }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@dazzlebd",
      title,
      description,
      images: [logoUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Prefetch site settings here so Footer/MainNav's useSiteSettings() hydrates
  // instantly on the client instead of firing a second, duplicate fetch.
  // getSiteSettings() is wrapped in React's cache(), so this reuses the same
  // in-flight/resolved request already made above for generateMetadata().
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["siteSettings"],
    queryFn: (): Promise<SiteSettingsData> => getSiteSettings(),
  });
  const dehydratedState = dehydrate(queryClient);

  // Sitewide structured data. getSiteSettings() is React-cached, so this reuses
  // the same request already made for generateMetadata and the prefetch above.
  const settings = await getSiteSettings();
  const siteJsonLd = buildJsonLd(
    organizationSchema(settings),
    webSiteSchema(settings),
  );

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${urbanist.variable}  h-full antialiased`}
    >
      <head>
        {/* Preconnect to CDN and API host for faster image & data fetching */}
        <link rel="preconnect" href="https://dazzle.sgp1.cdn.digitaloceanspaces.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://dazzle.sgp1.cdn.digitaloceanspaces.com" />
        <link rel="preconnect" href="https://dzl.sgp1.cdn.digitaloceanspaces.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://dzl.sgp1.cdn.digitaloceanspaces.com" />
        <link rel="preconnect" href="https://apix.bigpoint.com.bd" />
        <link rel="dns-prefetch" href="https://apix.bigpoint.com.bd" />
      </head>
      <body>
        <JsonLd id="ld-site" data={siteJsonLd} />
        <ThemeProvider>
          <ReduxProvider>
            <QueryProvider state={dehydratedState}>
              <Toaster position="top-center" reverseOrder={false} />
              <NextTopLoader
                color="#d4a97a"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
              />
              <Header />
              <div className="">{children}</div>
              <Footer />
              <div className="lg:hidden block ">
                <MobileFooter />
              </div>
            </QueryProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}