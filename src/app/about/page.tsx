import type { Metadata } from "next";
import AboutClient from "@/components/AboutClient";

export const metadata: Metadata = {
  title: "私たちの想い｜家事代行ねこのーと",
  description:
    "家事代行ねこのーとの想いをご紹介します。大阪府高槻市を中心に、家事代行・ハウスクリーニングで暮らしに寄り添い、快適な空間づくりを支えます。必要に応じて不動産・工務店の業務にも対応します。",
  openGraph: {
    title: "私たちの想い｜家事代行ねこのーと",
    description:
      "高槻市を中心に、心を込めた家事代行・ハウスクリーニングを提供。お客様の笑顔とゆとりある暮らしを第一に考えています。（不動産・工務店業務にも対応）",
    url: "https://meg-nekoneote.com/about",
    siteName: "家事代行ねこのーと",
    images: [
      {
        url: "https://meg-nekoneote.com/ogpLogo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  alternates: { canonical: "https://meg-nekoneote.com/about" },
};

export default function AboutPage() {
  return (
    <main className="px-4 py-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mt-4 text-center text-white/80 text-outline">
        私たちの想い
      </h1>
      <AboutClient />
    </main>
  );
}
