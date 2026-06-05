import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import DataSeeder from "@/components/DataSeeder";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HOBA LPG - Hiệp hội Kinh doanh Khí hóa lỏng TP.HCM",
  description: "HOBA - Ngôi nhà chung của cộng đồng doanh nghiệp LPG, cam kết đồng hành cùng sự an toàn, chuyên nghiệp và thịnh vượng của ngành năng lượng phía Nam.",
  keywords: "HOBA, LPG, khí hóa lỏng, hiệp hội gas, TP.HCM, an toàn gas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <DataSeeder />
        {children}
      </body>
    </html>
  );
}
