// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Script from "next/script";
import ThemeBackground from "@/components/ThemeBackground";
import WallpaperBackground from "@/components/WallpaperBackground";
import SubscriptionOverlay from "@/components/SubscriptionOverlay";
import { SITE_KEY } from "@/lib/atoms/siteKeyAtom";
import {
  kosugiMaru,
  notoSansJP,
  shipporiMincho,
  reggaeOne,
  yomogi,
  hachiMaruPop,
} from "@/lib/font";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// ✅ metadata から themeColor は削除（viewportで指定）
export const metadata: Metadata = {
  title: "家事代行ねこのーと｜家事代行・ハウスクリーニング（高槻）",
  description:
    "家事代行ねこのーとは、大阪府高槻市を中心に家事代行・ハウスクリーニングを提供。水回りやリビングの徹底清掃、定期利用にも対応します。不動産・工務店の業務にも対応しています。",
  keywords: [
    "家事代行ねこのーと",
    "家事代行",
    "ハウスクリーニング",
    "大阪",
    "高槻",
    "水回り掃除",
    "エアコンクリーニング",
    "不動産",
    "工務店",
  ],
  authors: [{ name: "家事代行ねこのーと" }],
  metadataBase: new URL("https://meg-nekoneote.com"),
  alternates: { canonical: "https://meg-nekoneote.com/" },
  openGraph: {
    title: "家事代行ねこのーと｜家事代行・ハウスクリーニング（高槻）",
    description:
      "大阪・高槻エリアで家事代行／ハウスクリーニングを提供。水回りから定期清掃まで丁寧に対応。不動産・工務店の業務にも対応しています。",
    url: "https://meg-nekoneote.com/",
    siteName: "家事代行ねこのーと",
    type: "website",
    images: [
      {
        url: "https://meg-nekoneote.com/ogpLogo.png", // ★ファイル名は変更しない
        width: 1200,
        height: 630,
        alt: "家事代行ねこのーと OGP",
      },
    ],
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "家事代行ねこのーと｜家事代行・ハウスクリーニング（高槻）",
    description:
      "大阪・高槻エリア対応。水回り／リビング／定期清掃まで丁寧に。不動産・工務店の業務にも対応。",
    images: ["https://meg-nekoneote.com/ogpLogo.png"], // ★ファイル名は変更しない
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=4" },
      { url: "/icon.png", type: "image/png", sizes: "any" }, // ★ファイル名は変更しない
    ],
    apple: "/icon.png",
    shortcut: "/favicon.ico?v=4",
  },
};

// ✅ ここで themeColor を指定（root で一括適用）
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`
        ${geistSans.variable} ${geistMono.variable}
        ${kosugiMaru.variable} ${notoSansJP.variable}
        ${yomogi.variable} ${hachiMaruPop.variable} ${reggaeOne.variable} ${shipporiMincho.variable}
        antialiased
      `}
    >
      <head>
        {/* OGP画像の事前読み込み（★ファイル名は変更しない） */}
        <link rel="preload" as="image" href="/ogpLogo.png" type="image/png" />
        {/* Search Console は発行後に差し替え */}
        {/* <meta name="google-site-verification" content="XXXX" /> */}
      </head>

      <body className="relative min-h-screen bg-[#ffffff]">
        <SubscriptionOverlay siteKey={SITE_KEY} />
        <WallpaperBackground />
        <ThemeBackground />
        <Header />
        {children}

        {/* 構造化データ（クライアント情報反映）※整理収納は含めない */}
        <Script id="ld-json" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CleaningService",
            name: "家事代行ねこのーと",
            url: "https://meg-nekoneote.com/",
            image: "https://meg-nekoneote.com/ogpLogo.png",
            description:
              "大阪府高槻市を中心に家事代行・ハウスクリーニングのサービスを提供。不動産・工務店の業務にも対応しています。",
            areaServed: [
              { "@type": "AdministrativeArea", name: "大阪府" },
              { "@type": "City", name: "高槻市" },
            ],
            serviceType: ["家事代行", "ハウスクリーニング"],
            address: {
              "@type": "PostalAddress",
              addressRegion: "大阪府",
              addressLocality: "高槻市",
              streetAddress: "柱本新町1-B26-502",
              postalCode: "569-0846",
            },
            telephone: "+81 70-8354-6929",
          })}
        </Script>
      </body>
    </html>
  );
}
