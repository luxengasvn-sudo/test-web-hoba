import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import DataSeeder from "@/components/DataSeeder";
import { executeDirectQuery } from "@/lib/db-direct";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = "/favicon.ico";
  let siteName = "HOBA LPG - Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM";
  let siteDesc = "HOBA - Ngôi nhà chung của cộng đồng doanh nghiệp LPG, cam kết đồng hành cùng sự an toàn, chuyên nghiệp và thịnh vượng của ngành năng lượng phía Nam.";

  try {
    const configData = await executeDirectQuery({
      method: "SELECT",
      table: "website_config",
      filters: [{ col: "key", val: "general" }],
      isSingle: true,
    });
    if (configData && configData.value) {
      if (configData.value.faviconUrl) faviconUrl = configData.value.faviconUrl;
      if (configData.value.siteName) siteName = configData.value.siteName;
      if (configData.value.siteDescription) siteDesc = configData.value.siteDescription;
      else if (configData.value.footerDesc) siteDesc = configData.value.footerDesc;
    }
  } catch (error) {
    console.error("Error fetching metadata config:", error);
  }

  return {
    title: siteName,
    description: siteDesc,
    keywords: "HOBA, LPG, khí hóa lỏng, hiệp hội gas, TP.HCM, an toàn gas",
    icons: {
      icon: faviconUrl,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var path = window.location.pathname;
                if (path.endsWith('/index.html')) {
                  var cleanPath = path.substring(0, path.length - 10);
                  window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
                } else if (path.endsWith('/index.html/')) {
                  var cleanPath = path.substring(0, path.length - 11);
                  window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background">
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-PVN2MM33X0"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-PVN2MM33X0');
          `}
        </Script>
        <DataSeeder />
        {children}
      </body>
    </html>
  );
}
