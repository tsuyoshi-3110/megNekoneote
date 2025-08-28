import type { Metadata } from "next";
import ProductsClient from "@/components/ProductsClient";

export const metadata: Metadata = {
  title: "サービス一覧｜家事代行ねこのーと",
  description:
    "家事代行ねこのーとのサービス一覧ページ。大阪府高槻市を中心に、家事代行・ハウスクリーニングの各種サービスを写真付きでご紹介します。※不動産・工務店の業務にも対応。",
  openGraph: {
    title: "サービス一覧｜家事代行ねこのーと",
    description:
      "家事代行・ハウスクリーニングのサービス紹介ページ。水回り清掃やリビング清掃などを写真付きで掲載し、自由に編集できます。※不動産・工務店にも対応",
    url: "https://meg-nekoneote.com/products",
    siteName: "家事代行ねこのーと",
    images: [
      {
        url: "https://meg-nekoneote.com/ogpLogo.png", // ★ファイル名は変更しない
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}
