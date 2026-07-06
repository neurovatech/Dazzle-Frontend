import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/MobileFooter";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "@/app/providers/QueryProvider";
import ReduxProvider from "@/app/providers/ReduxProvider";
import { Toaster } from "react-hot-toast";
import { getSiteSettings, stripHtml } from "@/lib/getSiteSettings";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
});

const FALLBACK_TITLE = "Best Mobile, Laptop and Gadget Shop In Bangladesh - Dazzle";
const FALLBACK_DESCRIPTION =
  "Shop the best mobile phones, laptops, and gadgets in Bangladesh at Dazzle. Exclusive deals, genuine products, fast delivery.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const title = settings.metaTitle || settings.siteTitle || FALLBACK_TITLE;
  const description = stripHtml(settings.metaDescription) || FALLBACK_DESCRIPTION;
  const siteName = settings.siteTitle || "Dazzle";

  return {
    title: {
      default: title,
      template: `%s - ${siteName}`,
    },
    description,
    keywords: settings.metaKeywords || undefined,
    metadataBase: new URL("https://dazzle.com.bd"),
    icons: settings.favicon ? { icon: settings.favicon } : undefined,
    openGraph: {
      siteName,
      locale: "en_BD",
      type: "website",
      title,
      description,
      images: settings.siteLogo ? [{ url: settings.siteLogo }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: "@dazzlebd",
      title,
      description,
      images: settings.siteLogo ? [settings.siteLogo] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${urbanist.variable}  h-full antialiased`}
    >
      <body>
        <ThemeProvider>
          <ReduxProvider>
            <QueryProvider>
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