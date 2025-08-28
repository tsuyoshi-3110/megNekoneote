// src/app/(routes)/home/page.tsx
import type { Metadata } from "next";
import BackgroundVideo from "@/components/backgroundVideo/BackgroundVideo";
import TopFixedText from "@/components/TopFixedText";

export const metadata: Metadata = {
  title: "家事代行ねこのーと｜家事代行・ハウスクリーニング（高槻）",
  description:
    "大阪府高槻市を中心に、家事代行・ハウスクリーニングを提供。水回りからリビングの徹底清掃、定期プランまで暮らしに寄り添う丁寧なサービスです。不動産・工務店の業務にも対応します。",
  openGraph: {
    title: "家事代行ねこのーと｜家事代行・ハウスクリーニング（高槻）",
    description:
      "家事代行メインの専門サービス。大阪・高槻エリアで高品質な清掃をサポート。※不動産・工務店業務にも対応しています。",
    url: "https://meg-nekoneote.com/",
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
  alternates: { canonical: "https://meg-nekoneote.com/" },
};

export default function HomePage() {
  return (
    <main className="w-full overflow-x-hidden">
      {/* ① ファーストビュー：背景動画または画像 */}
      <section className="relative h-screen overflow-hidden">
        <BackgroundVideo />
      </section>

      {/* ② テキスト紹介セクション */}
      <section className="relative z-10 text-white px-4 py-20">
        {/* 編集可能な固定テキストコンポーネント */}
        <TopFixedText />

        {/* ページタイトルとリード文 */}
        <h1 className="text-3xl lg:text-4xl font-extrabold text-center leading-tight mb-6 text-outline">
          家事代行ねこのーと
        </h1>

        <p className="max-w-3xl mx-auto text-center leading-relaxed text-outline">
          大阪府高槻市を中心に、<strong>家事代行（メイン）</strong>・ハウスクリーニングを提供しています。
          キッチン・浴室などの水回りから、リビングの徹底清掃、定期プランまで。
          ご家庭の状態やご要望に合わせて、無理なく続けられるプランをご提案します。
          また、<strong>不動産・工務店</strong>の業務にも対応しています。
        </p>
      </section>

      {/* ③ JSON-LD（構造化データ） */}
      <script
        type="application/ld+json"
        // ※「整理収納」は含めません
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "CleaningService",
              name: "家事代行ねこのーと",
              url: "https://meg-nekoneote.com/",
              description:
                "大阪府高槻市を中心に家事代行・ハウスクリーニングを提供するサービス。不動産・工務店の業務にも対応します。",
              serviceType: ["家事代行", "ハウスクリーニング"],
              areaServed: [
                { "@type": "AdministrativeArea", name: "大阪府" },
                { "@type": "City", name: "高槻市" },
              ],
              image: "https://meg-nekoneote.com/ogpLogo.png",
              address: {
                "@type": "PostalAddress",
                addressRegion: "大阪府",
                addressLocality: "高槻市",
                streetAddress: "柱本新町1-B26-502",
                postalCode: "569-0846",
              },
              telephone: "+81 70-8354-6929",
            },
          ]),
        }}
      />
    </main>
  );
}
