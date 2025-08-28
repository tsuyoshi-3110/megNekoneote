// src/app/(routes)/news/page.tsx
import type { Metadata } from "next";
import NewsClient from "@/components/NewsClient";

export const metadata: Metadata = {
  title: "お知らせ｜家事代行ねこのーと",
  description:
    "家事代行ねこのーとの最新情報・キャンペーン・営業時間や対応エリアに関するお知らせを掲載しています（大阪府高槻市周辺）。",
  openGraph: {
    title: "お知らせ｜家事代行ねこのーと",
    description:
      "最新のお知らせやキャンペーン情報、営業時間・対応エリアの変更などを随時ご案内します。",
    url: "https://meg-nekoneote.com/news",
    siteName: "家事代行ねこのーと",
    images: [{ url: "https://meg-nekoneote.com/ogpLogo.png", width: 1200, height: 630 }],
    locale: "ja_JP",
    type: "website",
  },
  alternates: { canonical: "https://meg-nekoneote.com/news" },
};

export default function NewsPage() {
  return (
    <main className="px-4 py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-white/80">
        お知らせ
      </h1>
      <NewsClient />
    </main>
  );
}
