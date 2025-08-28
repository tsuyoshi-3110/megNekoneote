import type { Metadata } from "next";
import StoresClient from "@/components/StoresClient";
import { PhoneSection } from "@/components/PhoneSection";

export const metadata: Metadata = {
  title: "店舗一覧｜家事代行ねこのーと",
  description:
    "家事代行ねこのーとの店舗一覧・拠点ページ。大阪府高槻市を中心に、家事代行・ハウスクリーニングを主軸に、不動産・工務店の業務にも対応しています。",
  openGraph: {
    title: "店舗一覧｜家事代行ねこのーと",
    description:
      "家事代行・ハウスクリーニング（メイン）。大阪府高槻市中心で、不動産・工務店業務にも対応する各拠点情報を掲載しています。",
    url: "https://meg-nekoneote.com/stores",
    siteName: "家事代行ねこのーと",
    images: [
      {
        url: "/ogpLogo.png", // ★ファイル名は変更しない
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
};

export default function StoresPage() {
  return (
    <main className="px-4 py-16">
      {/* ページタイトル・説明文 */}
      <section className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-2xl lg:text-3xl font-extrabold mb-4 text-white text-outline">
          家事代行ねこのーと ─ 店舗一覧
        </h1>
        <p className="leading-relaxed text-white text-outline">
          <strong>家事代行ねこのーと</strong> は
          <strong>大阪府高槻市</strong>を中心に、
          <strong>家事代行・ハウスクリーニング</strong>を主軸としてサービスを提供しています。
          <br className="hidden lg:block" />
          併せて、<strong>不動産・工務店</strong>の業務にも対応しています。
          各拠点の対応エリアや詳細情報をこちらからご確認いただけます。
        </p>
      </section>

      {/* 電話番号や連絡先セクション */}
      <section className="max-w-4xl mx-auto text-center mb-12">
        <PhoneSection />
      </section>

      {/* 店舗カードのクライアントレンダリング（Firestore対応） */}
      <StoresClient />
    </main>
  );
}
