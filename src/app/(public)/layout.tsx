import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { executeDirectQuery } from "@/lib/db-direct";
import fs from 'fs';
import path from 'path';

function checkImageFallback(url: string, defaultUrl: string): string {
  if (!url) return defaultUrl;
  return url;
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let generalConfig: any = null;
  try {
    const configData = await executeDirectQuery({
      method: "SELECT",
      table: "website_config",
      filters: [{ col: "key", val: "general" }],
      isSingle: true,
    });
    if (configData && configData.value) {
      generalConfig = { ...configData.value };
      if (generalConfig.logoUrl) {
        generalConfig.logoUrl = checkImageFallback(
          generalConfig.logoUrl,
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDGqQKdtsfpnEDKd7JAu8yQBX437NF9yre-G8AhC0L2jkhp6KVKASaL_r8TGZh_QRNtxoTKJXj2RXxkHdzbloP5qr9ddoI8OKoucsW0qAAsP4BTZGw_OuSxkWH_7yIFBmg6xnEcQ6TW4JHRFli25nYMjoLZ2HCRMhbnXTVG7sJKa0uboKFQS39PjtPXOEjGCHqrOCfHNMf3fKTvNlIsHiQw4bsKOCnLrOmA4gvrVMw8OI1QXoKnQvFoERk0EIu4ye4Mgt_9-lpAzjg'
        );
      }
    }

    let lpgCpEnabled = false;
    try {
      const lpgConfigData = await executeDirectQuery({
        method: "SELECT",
        table: "website_config",
        filters: [{ col: "key", val: "lpg_cp_data" }],
        isSingle: true,
      });
      if (lpgConfigData && lpgConfigData.value) {
        const parsedLpg = typeof lpgConfigData.value === 'string' ? JSON.parse(lpgConfigData.value) : lpgConfigData.value;
        lpgCpEnabled = parsedLpg?.enabled === true;
      }
    } catch (e) {
      console.error("Error fetching lpg config in layout:", e);
    }

    return (
      <>
        <Header initialConfig={generalConfig} initialLpgCpEnabled={lpgCpEnabled} />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer initialConfig={generalConfig} />
      </>
    );
  } catch (error) {
    console.error("Error fetching general config in layout:", error);
  }

  return (
    <>
      <Header initialConfig={generalConfig} initialLpgCpEnabled={false} />
      <main className="flex-grow flex flex-col">{children}</main>
      <Footer initialConfig={generalConfig} />
    </>
  );
}

