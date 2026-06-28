import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/MobileFooter";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "@/app/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
});

export const metadata: Metadata = {
  title: {
    default: "Best Mobile, Laptop and Gadget Shop In Bangladesh - Dazzle",
    template: "%s - Dazzle",
  },
  description:
    "Shop the best mobile phones, laptops, and gadgets in Bangladesh at Dazzle. Exclusive deals, genuine products, fast delivery.",
  metadataBase: new URL("https://dazzle.com.bd"),
  openGraph: {
    siteName: "Dazzle",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@dazzlebd",
  },
};

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
        </ThemeProvider>
      </body>
    </html>
  );
}
