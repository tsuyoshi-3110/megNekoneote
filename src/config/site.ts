/*
 * Refactored /config/site.ts
 * 目的：新規 Pageit 作成時に「最小の上書き」だけで全体が組み上がるようにする。
 * 使い方：
 *   1) SITE_BRAND / SITE_OVERRIDES の値だけを書き換える（店舗名・キャッチ・説明など）
 *   2) 必要なら copy, PAGES の文言や画像パスを調整
 *   3) それ以外は触らずに使い回し可能
 */

import type { Metadata } from "next";
import { SITE_KEY } from "@/lib/atoms/siteKeyAtom";
import { type AiSiteConfig } from "@/types/AiSite";
import { type FooterI18n } from "@/types/FooterI18n";
import { type FaqItem } from "@/types/FaqItem";
import { type PageDef } from "@/types/PageDef";

/* =========================
   URL / 環境ユーティリティ
========================= */
const ENV_BASE_URL_RAW =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const BASE_URL = ENV_BASE_URL_RAW.replace(/\/$/, "");

function safeHost(input: string, fallback = "localhost:3000"): string {
  try {
    return new URL(input).host;
  } catch {
    return fallback;
  }
}

function safeMetadataBase(input: string): URL | undefined {
  try {
    return new URL(input);
  } catch {
    return undefined;
  }
}

const DOMAIN = safeHost(BASE_URL);
const METADATA_BASE_SAFE = safeMetadataBase(BASE_URL);

/* =========================
   サイト定義ファクトリ（単一情報源）
========================= */
export type SiteOverrides = {
  /** 店舗名（ブランド名） */
  name: string;
  /** キャッチコピー */
  tagline: string;
  /** サイト説明（OG/SEO 共通） */
  description: string;
  /** 検索キーワード */
  keywords: ReadonlyArray<string>;
  /** 代表TEL（任意） */
  tel?: string;
  /** ロゴ/OG既定パス */
  logoPath?: string;
  /** Google Site Verification（任意） */
  googleSiteVerification?: string;
  /** SNS（任意） */
  socials?: Partial<{
    instagram: string;
    line: string;
    x: string;
    facebook: string;
    note: string; // ★追加（NOTE）
  }>;
  /** baseUrl を個別指定したい場合のみ */
  baseUrl?: string;
};

function createSite(overrides: SiteOverrides) {
  const baseUrl = (overrides.baseUrl ?? BASE_URL).replace(/\/$/, "");
  const domain = safeHost(baseUrl, DOMAIN);
  return {
    key: SITE_KEY,
    domain,
    baseUrl,
    name: overrides.name,
    tagline: overrides.tagline,
    description: overrides.description,
    keywords: overrides.keywords as readonly string[],
    tel: overrides.tel ?? "",
    // ★OGP/ロゴパスは指示どおり /images/ogpLogo.png を既定に
    logoPath: overrides.logoPath ?? "/images/ogpLogo.png",
    googleSiteVerification: overrides.googleSiteVerification ?? "",
    socials: {
      instagram: overrides.socials?.instagram ?? "",
      line: overrides.socials?.line ?? "",
      x: overrides.socials?.x ?? "",
      facebook: overrides.socials?.facebook ?? "",
      note: overrides.socials?.note ?? "",
    },
  } as const;
}

/* =========================
   ★ 店舗ごとの最小上書き（ここだけ編集）
========================= */
const SITE_BRAND = "家事代行ねこのーと"; // 表示用のフル表記（全角スペース等もOK）

const SITE_OVERRIDES: SiteOverrides = {
  name: "家事代行ねこのーと",
  tagline: "家事代行・ハウスクリーニング（高槻）",
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
  tel: "+81 70-8354-6929",
  logoPath: "/images/ogpLogo.png",
  // Search Console は発行後に差し替え（未設定でOK）
  googleSiteVerification: "",
  socials: {
    instagram:
      "https://www.instagram.com/megu_nekonote?igsh=MW9ieHZpa2tkZTU2cw==",
    line: "https://lin.ee/25fxWSm",
    note: "https://note.com/meg_nekonote",
  },
};

/* =========================
   サイト定義（以降は原則編集不要）
========================= */
export const siteName = SITE_BRAND; // 互換：従来の siteName を残す
export const site = createSite(SITE_OVERRIDES);

/* =========================
   住所（公開用）
   ※ ownerAddress は公開しない。SEO/リッチリザルト用にこちらを使う。
========================= */
export type PublicAddress = {
  text: string; // 表示用
  postal: {
    "@type": "PostalAddress";
    addressCountry: "JP";
    addressRegion: string;
    addressLocality: string;
    streetAddress: string;
    postalCode?: string;
  };
  hasMap: string; // Google Maps 検索URL
};
function mapUrlFromText(text: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    text
  )}`;
}

/** 店舗の公開住所（必要に応じてこの値だけ編集） */
export const PUBLIC_ADDRESS: PublicAddress = {
  text: "大阪府高槻市柱本新町1-B26-502",
  postal: {
    "@type": "PostalAddress",
    addressCountry: "JP",
    addressRegion: "大阪府",
    addressLocality: "高槻市",
    streetAddress: "柱本新町1-B26-502",
    postalCode: "569-0846",
  },
  hasMap: mapUrlFromText("大阪府高槻市柱本新町1-B26-502"),
};

/* =========================
   便利ヘルパ
========================= */
export const pageUrl = (path = "/") =>
  `${site.baseUrl.replace(/\/$/, "")}${
    path.startsWith("/") ? path : `/${path}`
  }`;

const ogImage = (p?: string) => pageUrl(p ?? site.logoPath);

/* =========================
   コピー（集中管理）★多言語対応
   - copy[lang].home.headline のように参照
   - lang は "ja" | "en" | "zh" | "zh-TW" | ...
========================= */

export type CopyBundle = {
  home: {
    headline: string;
    description: string;
  };
  stores: {
    heroTitle: string;
    heroAreas: string;
    heroLead: string;
    heroTail: string;
    heroIntroLine: string;
  };
  areasLocal: {
    h1: string;
    lead: string;
    services: {
      title: string;
      bullets: string[];
    }[];
    coverageTitle: string;
    coverageBody: string;
    faq: {
      q: string;
      a: string;
    }[];
    contactTitle: string;
    contactText: string;
    toProductsText: string;
  };
};

export const copy: Record<string, CopyBundle> = {
  /* ========= 日本語 ========= */
  ja: {
    home: {
      headline: site.name,
      description:
        "大阪府高槻市を中心に、家事代行／ハウスクリーニングを提供しています。キッチン・浴室などの水回りから、リビングの徹底清掃、定期プランまで。ご家庭の状態やご要望に合わせて、無理なく続けられるプランをご提案します。",
    },
    stores: {
      heroTitle: `${site.name} ─ 店舗一覧`,
      heroAreas: "大阪府（高槻市中心）",
      heroLead: "家事代行・ハウスクリーニングを提供しています。",
      heroTail:
        "対応エリアやサービスの詳細は、こちらのページからご確認いただけます。",
      heroIntroLine: `${site.name}は大阪府高槻市を中心に家事代行・ハウスクリーニングを提供しています。`,
    },
    areasLocal: {
      h1: "高槻市の家事代行・ハウスクリーニング",
      lead:
        "高槻市を中心に対応。まずは内容・ご希望日時をお気軽にご相談ください。",
      services: [
        {
          title: "家事代行（単発／定期）",
          bullets: ["掃除・片付け・洗濯などの日常家事", "定期利用のご相談も可能"],
        },
        {
          title: "ハウスクリーニング",
          bullets: [
            "水回り（キッチン・浴室・洗面・トイレ）",
            "リビングなどの徹底清掃",
            "不動産・工務店業務のご相談も可能",
          ],
        },
      ],
      coverageTitle: "対応エリア",
      coverageBody:
        "高槻市を中心に対応しています。近隣エリアも内容により対応可能な場合がありますので、まずはご相談ください。",
      faq: [
        {
          q: "当日予約は可能ですか？",
          a: "当日の空き状況によっては対応可能です。まずはお問い合わせください。",
        },
        {
          q: "不在時の作業はできますか？",
          a: "条件を確認のうえ、鍵管理のルールに基づいて対応可能です。詳細は事前にご相談ください。",
        },
        {
          q: "当日の追加依頼は可能ですか？",
          a: "スケジュールに空きがあれば対応いたします。まずはスタッフへご相談ください。",
        },
        {
          q: "定期利用はできますか？",
          a: "はい、可能です。頻度や内容に合わせてご提案します。",
        },
      ],
      contactTitle: "お問い合わせ",
      contactText:
        "予約状況の確認・見積りは、LINE／メールフォームからお気軽にどうぞ。",
      toProductsText: "トップページへ",
    },
  },

  /* ========= 英語 ========= */
  en: {
    home: {
      headline: site.name,
      description:
        "We provide housekeeping and house cleaning services mainly in Takatsuki, Osaka. From kitchens and bathrooms to deep cleaning for living rooms and regular plans, we propose options that fit your home and needs.",
    },
    stores: {
      heroTitle: `${site.name} ─ Locations`,
      heroAreas: "Takatsuki, Osaka",
      heroLead: "We offer housekeeping and house cleaning services.",
      heroTail: "Check service coverage and details from this page.",
      heroIntroLine: `${site.name} provides housekeeping and house cleaning mainly in Takatsuki, Osaka.`,
    },
    areasLocal: {
      h1: "Housekeeping & house cleaning in Takatsuki, Osaka",
      lead:
        "We mainly cover Takatsuki. Please contact us with your needs and preferred dates.",
      services: [
        {
          title: "Housekeeping (one-off / regular)",
          bullets: ["Cleaning, tidying, laundry", "Regular plans available"],
        },
        {
          title: "House cleaning",
          bullets: [
            "Wet areas (kitchen, bathroom, washstand, toilet)",
            "Deep cleaning for living rooms, etc.",
            "Support for real-estate / contractors upon request",
          ],
        },
      ],
      coverageTitle: "Service area",
      coverageBody:
        "We mainly serve Takatsuki. Nearby areas may be available depending on the request—please contact us.",
      faq: [
        {
          q: "Can I make a same-day booking?",
          a: "Depending on availability, same-day bookings may be possible. Please contact us first.",
        },
        {
          q: "Can you work while I am away?",
          a: "Yes, after confirming conditions and key-management rules. Please consult us in advance.",
        },
        {
          q: "Can I add extra tasks on the day?",
          a: "If the schedule allows, we will respond flexibly. Please ask the staff.",
        },
        {
          q: "Do you offer regular plans?",
          a: "Yes. We will suggest a plan that fits your needs and frequency.",
        },
      ],
      contactTitle: "Contact",
      contactText:
        "To check availability or request a quote, feel free to contact us via LINE or the inquiry form.",
      toProductsText: "Back to the top page",
    },
  },

  /* ========= 簡体中文 ========= */
  zh: {
    home: {
      headline: site.name,
      description:
        "我们主要在大阪府高槻市提供家政服务与家居清洁。从厨房、浴室等水区到客厅深度清洁，以及定期服务，都会根据您的家庭情况与需求提供合适方案。",
    },
    stores: {
      heroTitle: `${site.name} ─ 门店一览`,
      heroAreas: "大阪府（高槻市为主）",
      heroLead: "提供家政服务与家居清洁。",
      heroTail: "服务范围与详细信息请在本页面查看。",
      heroIntroLine: `${site.name} 主要在大阪府高槻市提供家政服务与家居清洁。`,
    },
    areasLocal: {
      h1: "大阪府高槻市的家政服务与家居清洁",
      lead: "以高槻市为中心。欢迎告知需求内容与期望日期。",
      services: [
        {
          title: "家务代办（单次／定期）",
          bullets: ["打扫、整理、洗衣等日常家务", "可咨询定期服务"],
        },
        {
          title: "家居清洁",
          bullets: [
            "水区（厨房、浴室、洗手台、卫生间）清洁",
            "客厅等深度清洁",
            "可咨询不动产／工务店相关业务",
          ],
        },
      ],
      coverageTitle: "服务范围",
      coverageBody:
        "主要覆盖高槻市。根据需求内容，周边地区也可能提供服务，欢迎咨询。",
      faq: [
        {
          q: "可以当天预约吗？",
          a: "视当日空档情况而定，有时可以当天安排。请先联系确认。",
        },
        {
          q: "不在家时也能服务吗？",
          a: "在事先确认条件并约定钥匙管理规则后，可以在您不在家时完成清洁。",
        },
        {
          q: "当天临时增加项目可以吗？",
          a: "若当日行程允许，我们会尽量灵活应对。请与工作人员沟通。",
        },
        {
          q: "有定期方案吗？",
          a: "有的。我们会根据频率与需求提出建议。",
        },
      ],
      contactTitle: "联系我们",
      contactText:
        "如需确认预约情况或索取报价，欢迎通过 LINE 或网站表单与我们联系。",
      toProductsText: "返回首页",
    },
  },

  /* ========= 繁體中文 ========= */
  "zh-TW": {
    home: {
      headline: site.name,
      description:
        "我們主要在大阪府高槻市提供家事代辦與居家清潔服務。從廚房、浴室等濕區到客廳深度清潔，以及定期方案，會依您的需求提供合適服務。",
    },
    stores: {
      heroTitle: `${site.name} ─ 店鋪一覽`,
      heroAreas: "大阪府（以高槻市為主）",
      heroLead: "提供家事代辦與居家清潔。",
      heroTail: "服務範圍與詳細資訊請於本頁查看。",
      heroIntroLine: `${site.name} 主要在大阪府高槻市提供家事代辦與居家清潔服務。`,
    },
    areasLocal: {
      h1: "大阪府高槻市的家事代辦與居家清潔",
      lead: "以高槻市為中心。歡迎告知需求內容與希望日期。",
      services: [
        {
          title: "家事代辦（單次／定期）",
          bullets: ["打掃、整理、洗衣等日常家務", "可洽詢定期服務"],
        },
        {
          title: "居家清潔",
          bullets: [
            "水區（廚房、浴室、洗手台、廁所）清潔",
            "客廳等深度清潔",
            "可洽詢不動產／工務店相關需求",
          ],
        },
      ],
      coverageTitle: "服務範圍",
      coverageBody:
        "主要服務高槻市。視需求內容，周邊地區亦可能提供服務，歡迎洽詢。",
      faq: [
        {
          q: "可以當天預約嗎？",
          a: "視當天空檔情況而定，有時可提供當日服務。請先與我們聯繫確認。",
        },
        {
          q: "不在家也能服務嗎？",
          a: "在事前確認條件並約定鑰匙管理方式後，可以於您不在家時完成清潔。",
        },
        {
          q: "當天臨時追加服務可以嗎？",
          a: "若當天行程許可，我們會盡量彈性配合。請與工作人員溝通。",
        },
        {
          q: "有定期方案嗎？",
          a: "有的。我們會依頻率與需求提出建議。",
        },
      ],
      contactTitle: "聯絡我們",
      contactText:
        "如需確認預約情況或索取報價，歡迎透過 LINE 或網站表單與我們聯繫。",
      toProductsText: "回到首頁",
    },
  },

  /* ========= 韓国語 ========= */
  ko: {
    home: {
      headline: site.name,
      description:
        "저희는 오사카부 다카츠키시를 중심으로 가사 대행 및 하우스 클리닝 서비스를 제공합니다. 주방/욕실 등의 물 사용 공간부터 거실 집중 청소, 정기 플랜까지 필요에 맞춰 제안드립니다.",
    },
    stores: {
      heroTitle: `${site.name} ─ 지점 목록`,
      heroAreas: "오사카(다카츠키시 중심)",
      heroLead: "가사 대행 및 하우스 클리닝 서비스를 제공합니다.",
      heroTail: "서비스 가능 지역과 상세 정보는 이 페이지에서 확인하실 수 있습니다.",
      heroIntroLine: `${site.name}는 오사카부 다카츠키시를 중심으로 가사 대행 및 하우스 클리닝 서비스를 제공합니다.`,
    },
    areasLocal: {
      h1: "오사카 다카츠키시의 가사 대행·하우스 클리닝",
      lead: "다카츠키시 중심으로 대응합니다. 요청 내용과 희망 일정을 알려 주세요.",
      services: [
        {
          title: "가사 대행 (단발 / 정기)",
          bullets: ["청소, 정리정돈, 세탁", "정기 플랜 상담 가능"],
        },
        {
          title: "하우스 클리닝",
          bullets: [
            "주방, 욕실, 세면대, 화장실 등 물 사용 공간",
            "거실 등 집중 청소",
            "부동산/공무점 관련 업무도 상담 가능",
          ],
        },
      ],
      coverageTitle: "서비스 지역",
      coverageBody:
        "주로 다카츠키시를 대상으로 합니다. 요청 내용에 따라 인근 지역도 가능할 수 있으니 문의해 주세요.",
      faq: [
        {
          q: "당일 예약이 가능한가요?",
          a: "당일 스케줄 상황에 따라 가능한 경우가 있습니다. 먼저 문의해 주세요.",
        },
        {
          q: "부재 중 청소도 가능한가요?",
          a: "조건을 확인한 뒤, 열쇠 관리 규정에 따라 안전하게 진행할 수 있습니다. 사전 상담이 필요합니다.",
        },
        {
          q: "당일에 추가 요청이 가능한가요?",
          a: "일정에 여유가 있으면 유연하게 대응해 드립니다. 스태프에게 말씀해 주세요.",
        },
        {
          q: "정기 플랜이 있나요?",
          a: "네. 빈도와 내용에 맞춰 제안드립니다.",
        },
      ],
      contactTitle: "문의하기",
      contactText:
        "예약 가능 여부 확인 및 견적 문의는 LINE 또는 문의 폼을 통해 연락해 주세요.",
      toProductsText: "맨 위 페이지로",
    },
  },

  /* ========= フランス語 ========= */
  fr: {
    home: {
      headline: site.name,
      description:
        "Nous proposons des services d’aide ménagère et de ménage principalement à Takatsuki (préfecture d’Osaka). De la cuisine et de la salle de bain au salon, ainsi que des formules régulières, nous vous proposons un service adapté à vos besoins.",
    },
    stores: {
      heroTitle: `${site.name} ─ Liste des agences`,
      heroAreas: "Takatsuki (Osaka)",
      heroLead: "Nous proposons des services d’aide ménagère et de ménage.",
      heroTail:
        "Consultez ici les zones desservies et les informations détaillées.",
      heroIntroLine: `${site.name} intervient principalement à Takatsuki (Osaka) pour l’aide ménagère et le ménage.`,
    },
    areasLocal: {
      h1: "Aide ménagère et ménage à Takatsuki (Osaka)",
      lead: "Intervention principalement à Takatsuki. Contactez-nous avec vos besoins et vos dates souhaitées.",
      services: [
        {
          title: "Aide ménagère (ponctuelle / régulière)",
          bullets: ["Ménage, rangement, lessive", "Formules régulières possibles"],
        },
        {
          title: "Ménage de la maison",
          bullets: [
            "Pièces d’eau (cuisine, salle de bain, lavabo, toilettes)",
            "Nettoyage approfondi du salon, etc.",
            "Demandes pour immobilier / entreprises du bâtiment sur consultation",
          ],
        },
      ],
      coverageTitle: "Zone d’intervention",
      coverageBody:
        "Principalement Takatsuki. Les zones voisines peuvent être possibles selon la demande.",
      faq: [
        {
          q: "Est-il possible de réserver pour le jour même ?",
          a: "Selon les disponibilités, cela peut être possible. Merci de nous contacter d’abord.",
        },
        {
          q: "Puis-je vous confier les clés pour une intervention en mon absence ?",
          a: "Oui, après validation des conditions et des règles de gestion des clés.",
        },
        {
          q: "Puis-je ajouter des tâches le jour même ?",
          a: "Si le planning le permet, nous ferons au mieux pour répondre à votre demande.",
        },
        {
          q: "Proposez-vous des formules régulières ?",
          a: "Oui. Nous vous proposerons une formule adaptée à vos besoins.",
        },
      ],
      contactTitle: "Contact",
      contactText:
        "Pour vérifier nos disponibilités ou demander un devis, contactez-nous via LINE ou le formulaire de contact.",
      toProductsText: "Retour à la page d’accueil",
    },
  },

  /* ========= スペイン語 ========= */
  es: {
    home: {
      headline: site.name,
      description:
        "Ofrecemos servicios de ayuda doméstica y limpieza del hogar principalmente en Takatsuki (Osaka). Desde cocina y baño hasta limpieza profunda del salón y planes periódicos, proponemos opciones adaptadas a sus necesidades.",
    },
    stores: {
      heroTitle: `${site.name} ─ Lista de sedes`,
      heroAreas: "Takatsuki (Osaka)",
      heroLead: "Prestamos servicios de ayuda doméstica y limpieza del hogar.",
      heroTail: "Consulte aquí la cobertura y la información detallada.",
      heroIntroLine: `${site.name} ofrece ayuda doméstica y limpieza del hogar principalmente en Takatsuki (Osaka).`,
    },
    areasLocal: {
      h1: "Ayuda doméstica y limpieza en Takatsuki (Osaka)",
      lead: "Principalmente en Takatsuki. Contáctenos con sus necesidades y fechas.",
      services: [
        {
          title: "Ayuda doméstica (puntual / periódica)",
          bullets: ["Limpieza, orden, lavado", "Planes periódicos disponibles"],
        },
        {
          title: "Limpieza del hogar",
          bullets: [
            "Zonas de agua (cocina, baño, lavabo, aseo)",
            "Limpieza profunda del salón, etc.",
            "Consultas para inmobiliarias / contratistas",
          ],
        },
      ],
      coverageTitle: "Zona de servicio",
      coverageBody:
        "Principalmente Takatsuki. Zonas cercanas pueden ser posibles según el caso.",
      faq: [
        {
          q: "¿Es posible reservar para el mismo día?",
          a: "Dependiendo de la disponibilidad, puede ser posible. Consúltenos primero.",
        },
        {
          q: "¿Puedo dejarles mis llaves para que trabajen cuando no estoy en casa?",
          a: "Sí, tras acordar las condiciones y las reglas de gestión de llaves.",
        },
        {
          q: "¿Se pueden añadir tareas adicionales el mismo día?",
          a: "Si el horario lo permite, intentaremos responder con flexibilidad.",
        },
        {
          q: "¿Ofrecen planes regulares?",
          a: "Sí. Propondremos un plan que se adapte a sus necesidades.",
        },
      ],
      contactTitle: "Contacto",
      contactText:
        "Para comprobar la disponibilidad o solicitar un presupuesto, contáctenos por LINE o mediante el formulario.",
      toProductsText: "Volver a la página principal",
    },
  },

  /* ========= ドイツ語 ========= */
  de: {
    home: {
      headline: site.name,
      description:
        "Wir bieten Haushaltshilfe und Hausreinigung hauptsächlich in Takatsuki (Osaka) an. Von Küche und Bad bis zur gründlichen Reinigung des Wohnzimmers sowie regelmäßigen Plänen – wir schlagen passende Optionen vor.",
    },
    stores: {
      heroTitle: `${site.name} ─ Standorte`,
      heroAreas: "Takatsuki (Osaka)",
      heroLead: "Wir bieten Haushaltshilfe und Hausreinigung an.",
      heroTail:
        "Einsatzgebiet und Details finden Sie auf dieser Seite.",
      heroIntroLine: `${site.name} bietet Haushaltshilfe und Hausreinigung hauptsächlich in Takatsuki (Osaka) an.`,
    },
    areasLocal: {
      h1: "Haushaltshilfe & Reinigung in Takatsuki (Osaka)",
      lead: "Hauptsächlich Takatsuki. Kontaktieren Sie uns mit Ihren Wünschen und Terminen.",
      services: [
        {
          title: "Haushaltshilfe (einmalig / regelmäßig)",
          bullets: ["Reinigung, Aufräumen, Wäsche", "Regelmäßige Pläne möglich"],
        },
        {
          title: "Hausreinigung",
          bullets: [
            "Nassbereiche (Küche, Bad, Waschbecken, WC)",
            "Gründliche Reinigung des Wohnzimmers usw.",
            "Anfragen für Immobilien / Bauunternehmen nach Absprache",
          ],
        },
      ],
      coverageTitle: "Einsatzgebiet",
      coverageBody:
        "Hauptsächlich Takatsuki. Nahegelegene Gebiete können je nach Anfrage möglich sein.",
      faq: [
        {
          q: "Ist eine Buchung am selben Tag möglich?",
          a: "Je nach Verfügbarkeit kann es möglich sein. Bitte kontaktieren Sie uns zuerst.",
        },
        {
          q: "Kann ich Ihnen den Schlüssel anvertrauen, damit Sie in meiner Abwesenheit reinigen?",
          a: "Ja, nach Absprache der Bedingungen und Schlüsselregeln.",
        },
        {
          q: "Kann ich am selben Tag zusätzliche Arbeiten beauftragen?",
          a: "Wenn der Zeitplan es erlaubt, reagieren wir so flexibel wie möglich.",
        },
        {
          q: "Gibt es regelmäßige Pläne?",
          a: "Ja. Wir schlagen einen Plan vor, der zu Ihren Bedürfnissen passt.",
        },
      ],
      contactTitle: "Kontakt",
      contactText:
        "Zur Verfügbarkeitsprüfung oder Angebotsanfrage kontaktieren Sie uns gerne über LINE oder das Kontaktformular.",
      toProductsText: "Zur Startseite",
    },
  },

  /* ========= ポルトガル語 ========= */
  pt: {
    home: {
      headline: site.name,
      description:
        "Oferecemos serviços de ajuda doméstica e limpeza residencial principalmente em Takatsuki (Osaka). Da cozinha e do banheiro à limpeza profunda da sala e planos regulares, sugerimos opções adequadas às suas necessidades.",
    },
    stores: {
      heroTitle: `${site.name} ─ Unidades`,
      heroAreas: "Takatsuki (Osaka)",
      heroLead: "Prestamos serviços de ajuda doméstica e limpeza residencial.",
      heroTail: "Confira a área de atendimento e detalhes nesta página.",
      heroIntroLine: `${site.name} oferece ajuda doméstica e limpeza residencial principalmente em Takatsuki (Osaka).`,
    },
    areasLocal: {
      h1: "Ajuda doméstica e limpeza em Takatsuki (Osaka)",
      lead: "Principalmente Takatsuki. Fale conosco com suas necessidades e datas.",
      services: [
        {
          title: "Ajuda doméstica (avulsa / regular)",
          bullets: ["Limpeza, organização, lavanderia", "Planos regulares disponíveis"],
        },
        {
          title: "Limpeza residencial",
          bullets: [
            "Áreas molhadas (cozinha, banheiro, lavatório, toalete)",
            "Limpeza profunda da sala, etc.",
            "Consultas para imobiliárias / construtoras",
          ],
        },
      ],
      coverageTitle: "Área de atendimento",
      coverageBody:
        "Principalmente Takatsuki. Áreas próximas podem ser possíveis dependendo do pedido.",
      faq: [
        {
          q: "É possível agendar para o mesmo dia?",
          a: "Dependendo da disponibilidade, pode ser possível. Entre em contato primeiro.",
        },
        {
          q: "Posso deixar a chave para limparem quando eu não estiver em casa?",
          a: "Sim, após combinar condições e regras de gerenciamento de chaves.",
        },
        {
          q: "Posso pedir tarefas adicionais no próprio dia?",
          a: "Se o horário permitir, tentaremos atender com flexibilidade.",
        },
        {
          q: "Vocês oferecem planos regulares?",
          a: "Sim. Sugerimos um plano adequado às suas necessidades.",
        },
      ],
      contactTitle: "Fale conosco",
      contactText:
        "Para verificar disponibilidade ou solicitar orçamento, fale conosco pelo LINE ou pelo formulário do site.",
      toProductsText: "Voltar à página inicial",
    },
  },

  /* ========= イタリア語 ========= */
  it: {
    home: {
      headline: site.name,
      description:
        "Offriamo servizi di assistenza domestica e pulizia della casa principalmente a Takatsuki (Osaka). Dalla cucina e dal bagno alla pulizia profonda del soggiorno e ai piani regolari, proponiamo soluzioni adatte alle vostre esigenze.",
    },
    stores: {
      heroTitle: `${site.name} ─ Elenco sedi`,
      heroAreas: "Takatsuki (Osaka)",
      heroLead: "Forniamo assistenza domestica e pulizie della casa.",
      heroTail: "Consulta in questa pagina area di servizio e dettagli.",
      heroIntroLine: `${site.name} offre assistenza domestica e pulizie principalmente a Takatsuki (Osaka).`,
    },
    areasLocal: {
      h1: "Assistenza domestica e pulizie a Takatsuki (Osaka)",
      lead: "Principalmente Takatsuki. Contattaci con le tue esigenze e date preferite.",
      services: [
        {
          title: "Assistenza domestica (singola / periodica)",
          bullets: ["Pulizia, riordino, bucato", "Piani periodici disponibili"],
        },
        {
          title: "Pulizia della casa",
          bullets: [
            "Zone umide (cucina, bagno, lavabo, WC)",
            "Pulizia profonda del soggiorno, ecc.",
            "Richieste per immobiliare / imprese su consultazione",
          ],
        },
      ],
      coverageTitle: "Zona di servizio",
      coverageBody:
        "Principalmente Takatsuki. Le aree vicine potrebbero essere disponibili a seconda della richiesta.",
      faq: [
        {
          q: "È possibile una prenotazione nello stesso giorno?",
          a: "A seconda della disponibilità, può essere possibile. Contattaci prima per confermare.",
        },
        {
          q: "Posso affidarvi le chiavi per effettuare le pulizie in mia assenza?",
          a: "Sì, dopo aver concordato condizioni e regole di gestione delle chiavi.",
        },
        {
          q: "Posso richiedere lavori aggiuntivi il giorno stesso?",
          a: "Se il programma lo consente, cercheremo di essere flessibili.",
        },
        {
          q: "Offrite piani regolari?",
          a: "Sì. Proporremo un piano adatto alle tue esigenze.",
        },
      ],
      contactTitle: "Contattaci",
      contactText:
        "Per verificare la disponibilità o richiedere un preventivo, contattaci tramite LINE o tramite il modulo sul sito.",
      toProductsText: "Torna alla pagina iniziale",
    },
  },

  /* ========= ロシア語 ========= */
  ru: {
    home: {
      headline: site.name,
      description:
        "Мы предлагаем помощь по дому и уборку в основном в городе Такацуки (префектура Осака). От кухни и ванной до глубокой уборки гостиной и регулярных планов — подберём вариант под ваши потребности.",
    },
    stores: {
      heroTitle: `${site.name} ─ Список филиалов`,
      heroAreas: "Такацуки (Осака)",
      heroLead: "Мы предоставляем услуги помощи по дому и уборки.",
      heroTail:
        "Здесь вы можете узнать зону обслуживания и подробности.",
      heroIntroLine: `${site.name} оказывает услуги помощи по дому и уборки в основном в Такацуки (Осака).`,
    },
    areasLocal: {
      h1: "Помощь по дому и уборка в Такацуки (Осака)",
      lead: "Основной район — Такацуки. Сообщите ваши пожелания и удобные даты.",
      services: [
        {
          title: "Помощь по хозяйству (разовая / регулярная)",
          bullets: ["Уборка, наведение порядка, стирка", "Доступны регулярные планы"],
        },
        {
          title: "Уборка дома",
          bullets: [
            "Влажные зоны (кухня, ванная, умывальник, туалет)",
            "Глубокая уборка гостиной и т. п.",
            "Запросы для недвижимости/подрядчиков — по согласованию",
          ],
        },
      ],
      coverageTitle: "Зона обслуживания",
      coverageBody:
        "В основном Такацуки. Соседние районы возможны в зависимости от запроса.",
      faq: [
        {
          q: "Возможна ли уборка в тот же день?",
          a: "В зависимости от загруженности это возможно. Сначала свяжитесь с нами.",
        },
        {
          q: "Можно ли убрать в моё отсутствие, если я передам ключ?",
          a: "Да, после согласования условий и правил хранения/управления ключом.",
        },
        {
          q: "Можно ли добавить работы в день уборки?",
          a: "Если позволяет расписание, постараемся отреагировать гибко.",
        },
        {
          q: "Есть ли регулярные планы?",
          a: "Да. Подберём план под ваши потребности и частоту.",
        },
      ],
      contactTitle: "Связаться с нами",
      contactText:
        "Чтобы узнать о доступности или запросить стоимость услуг, свяжитесь с нами через LINE или форму на сайте.",
      toProductsText: "Вернуться на главную страницу",
    },
  },

  /* ========= タイ語 ========= */
  th: {
    home: {
      headline: site.name,
      description:
        "เราให้บริการแม่บ้านช่วยงานและทำความสะอาดบ้านเป็นหลักในเมืองทาคัตสึกิ จังหวัดโอซาก้า ตั้งแต่ห้องครัว ห้องน้ำ ไปจนถึงทำความสะอาดห้องนั่งเล่นแบบละเอียด และแพ็กเกจแบบประจำ ตามความต้องการของคุณ",
    },
    stores: {
      heroTitle: `${site.name} ─ รายชื่อสาขา`,
      heroAreas: "ทาคัตสึกิ (โอซาก้า)",
      heroLead: "ให้บริการแม่บ้านช่วยงานและทำความสะอาดบ้าน",
      heroTail: "ตรวจสอบพื้นที่ให้บริการและรายละเอียดได้ที่หน้านี้",
      heroIntroLine: `${site.name} ให้บริการแม่บ้านและทำความสะอาดบ้านเป็นหลักในเมืองทาคัตสึกิ (โอซาก้า)`,
    },
    areasLocal: {
      h1: "แม่บ้านและทำความสะอาดในเมืองทาคัตสึกิ (โอซาก้า)",
      lead: "ให้บริการหลักในทาคัตสึกิ แจ้งความต้องการและวันที่สะดวกได้เลย",
      services: [
        {
          title: "แม่บ้านช่วยงาน (รายครั้ง / ประจำ)",
          bullets: ["ทำความสะอาด จัดของ ซักผ้า", "มีแพ็กเกจแบบประจำให้ปรึกษา"],
        },
        {
          title: "ทำความสะอาดบ้าน",
          bullets: [
            "พื้นที่เปียกน้ำ เช่น ห้องครัว ห้องน้ำ อ่างล้างหน้า ห้องสุขา",
            "ทำความสะอาดห้องนั่งเล่นแบบละเอียด",
            "งานสำหรับอสังหาฯ/ผู้รับเหมาสามารถปรึกษาได้",
          ],
        },
      ],
      coverageTitle: "พื้นที่ให้บริการ",
      coverageBody:
        "หลัก ๆ คือทาคัตสึกิ พื้นที่ใกล้เคียงอาจทำได้ตามประเภทงาน โปรดสอบถาม",
      faq: [
        {
          q: "จองงานวันเดียวกันได้ไหม?",
          a: "ขึ้นอยู่กับตารางงานในวันนั้น หากมีช่องว่างอาจทำได้ กรุณาติดต่อสอบถามก่อน",
        },
        {
          q: "ฝากกุญแจเพื่อทำความสะอาดตอนที่ไม่อยู่บ้านได้ไหม?",
          a: "ได้ หลังตกลงเงื่อนไขและวิธีการจัดการกุญแจล่วงหน้า",
        },
        {
          q: "ขอเพิ่มงานในวันทำความสะอาดได้ไหม?",
          a: "ถ้าตารางเวลาว่างพอ เราจะพยายามช่วยอย่างยืดหยุ่น",
        },
        {
          q: "มีแพ็กเกจแบบประจำไหม?",
          a: "มี เราจะเสนอแผนที่เหมาะกับความถี่และความต้องการของคุณ",
        },
      ],
      contactTitle: "ติดต่อเรา",
      contactText:
        "ตรวจสอบคิวว่างหรือขอใบเสนอราคา ติดต่อผ่าน LINE หรือแบบฟอร์มบนเว็บไซต์ได้",
      toProductsText: "กลับไปหน้าหลัก",
    },
  },

  /* ========= ベトナム語 ========= */
  vi: {
    home: {
      headline: site.name,
      description:
        "Chúng tôi cung cấp dịch vụ giúp việc và vệ sinh nhà ở chủ yếu tại Takatsuki, Osaka. Từ bếp, phòng tắm đến vệ sinh sâu phòng khách và các gói định kỳ, chúng tôi sẽ đề xuất phương án phù hợp nhu cầu của bạn.",
    },
    stores: {
      heroTitle: `${site.name} ─ Danh sách cơ sở`,
      heroAreas: "Takatsuki (Osaka)",
      heroLead: "Cung cấp dịch vụ giúp việc và vệ sinh nhà ở.",
      heroTail: "Xem khu vực phục vụ và thông tin chi tiết tại đây.",
      heroIntroLine: `${site.name} cung cấp dịch vụ giúp việc và vệ sinh nhà ở chủ yếu tại Takatsuki (Osaka).`,
    },
    areasLocal: {
      h1: "Giúp việc & vệ sinh nhà ở tại Takatsuki (Osaka)",
      lead: "Chủ yếu phục vụ Takatsuki. Hãy cho chúng tôi biết nhu cầu và thời gian mong muốn.",
      services: [
        {
          title: "Giúp việc (lẻ / định kỳ)",
          bullets: ["Dọn dẹp, sắp xếp, giặt giũ", "Có gói định kỳ"],
        },
        {
          title: "Vệ sinh nhà ở",
          bullets: [
            "Khu vực ướt (bếp, phòng tắm, bồn rửa, nhà vệ sinh)",
            "Vệ sinh sâu phòng khách, v.v.",
            "Hỗ trợ theo yêu cầu cho bất động sản/nhà thầu",
          ],
        },
      ],
      coverageTitle: "Khu vực phục vụ",
      coverageBody:
        "Chủ yếu Takatsuki. Khu vực lân cận có thể phục vụ tùy theo yêu cầu.",
      faq: [
        {
          q: "Có thể đặt trong ngày không?",
          a: "Tùy lịch trống trong ngày, đôi khi có thể. Vui lòng liên hệ trước.",
        },
        {
          q: "Có thể dọn khi tôi vắng nhà không?",
          a: "Có, sau khi thống nhất điều kiện và quy tắc quản lý chìa khóa.",
        },
        {
          q: "Có thể yêu cầu thêm việc trong ngày không?",
          a: "Nếu lịch cho phép, chúng tôi sẽ cố gắng hỗ trợ linh hoạt.",
        },
        {
          q: "Có gói định kỳ không?",
          a: "Có. Chúng tôi sẽ đề xuất theo tần suất và nhu cầu của bạn.",
        },
      ],
      contactTitle: "Liên hệ",
      contactText:
        "Để kiểm tra lịch trống hoặc yêu cầu báo giá, hãy liên hệ qua LINE hoặc mẫu liên hệ trên website.",
      toProductsText: "Quay lại trang chủ",
    },
  },

  /* ========= インドネシア語 ========= */
  id: {
    home: {
      headline: site.name,
      description:
        "Kami menyediakan layanan asisten rumah tangga dan pembersihan rumah terutama di Takatsuki, Osaka. Dari dapur dan kamar mandi hingga pembersihan mendalam ruang keluarga dan paket rutin, kami menawarkan layanan yang sesuai kebutuhan Anda.",
    },
    stores: {
      heroTitle: `${site.name} ─ Daftar cabang`,
      heroAreas: "Takatsuki (Osaka)",
      heroLead: "Menyediakan layanan asisten rumah tangga dan pembersihan rumah.",
      heroTail: "Lihat area layanan dan detailnya di halaman ini.",
      heroIntroLine: `${site.name} menawarkan layanan asisten rumah tangga dan pembersihan rumah terutama di Takatsuki (Osaka).`,
    },
    areasLocal: {
      h1: "Asisten rumah tangga & pembersihan di Takatsuki (Osaka)",
      lead: "Utamanya melayani Takatsuki. Beritahu kebutuhan dan tanggal yang diinginkan.",
      services: [
        {
          title: "Asisten rumah tangga (sekali / rutin)",
          bullets: ["Membersihkan, merapikan, mencuci", "Tersedia paket rutin"],
        },
        {
          title: "Pembersihan rumah",
          bullets: [
            "Area basah (dapur, kamar mandi, wastafel, toilet)",
            "Pembersihan mendalam ruang keluarga, dll.",
            "Dukungan untuk properti/kontraktor sesuai permintaan",
          ],
        },
      ],
      coverageTitle: "Area layanan",
      coverageBody:
        "Utamanya Takatsuki. Area sekitar mungkin bisa dilayani tergantung permintaan.",
      faq: [
        {
          q: "Apakah bisa memesan layanan di hari yang sama?",
          a: "Tergantung ketersediaan, kadang-kadang bisa. Silakan hubungi kami terlebih dahulu.",
        },
        {
          q: "Bisakah bekerja saat saya tidak di rumah?",
          a: "Bisa, setelah menyepakati kondisi dan aturan pengelolaan kunci.",
        },
        {
          q: "Bisakah menambah pekerjaan di hari yang sama?",
          a: "Jika jadwal memungkinkan, kami akan berusaha merespons dengan fleksibel.",
        },
        {
          q: "Apakah ada paket rutin?",
          a: "Ada. Kami akan mengusulkan sesuai kebutuhan dan frekuensi.",
        },
      ],
      contactTitle: "Hubungi kami",
      contactText:
        "Untuk mengecek ketersediaan jadwal atau meminta penawaran harga, hubungi kami melalui LINE atau formulir di situs.",
      toProductsText: "Kembali ke halaman utama",
    },
  },

  /* ========= ヒンディー語 ========= */
  hi: {
    home: {
      headline: site.name,
      description:
        "हम मुख्य रूप से ओसाका के ताकात्सुकी क्षेत्र में घरेलू सहायता और हाउस क्लीनिंग सेवा प्रदान करते हैं। किचन/बाथरूम से लेकर लिविंग रूम की डीप क्लीनिंग और नियमित प्लान तक, आपकी जरूरत के अनुसार सेवा सुझाते हैं।",
    },
    stores: {
      heroTitle: `${site.name} ─ शाखाओं की सूची`,
      heroAreas: "ताकात्सुकी (ओसाका)",
      heroLead: "हम घरेलू सहायता और हाउस क्लीनिंग सेवाएँ प्रदान करते हैं।",
      heroTail: "सेवा क्षेत्र और विवरण इस पेज पर देखें।",
      heroIntroLine: `${site.name} मुख्य रूप से ओसाका के ताकात्सुकी में घरेलू सहायता और हाउस क्लीनिंग सेवाएँ प्रदान करता है।`,
    },
    areasLocal: {
      h1: "ताकात्सुकी (ओसाका) में घरेलू सहायता और हाउस क्लीनिंग",
      lead: "मुख्य रूप से ताकात्सुकी। कृपया अपनी जरूरतें और पसंदीदा तारीखें बताएं।",
      services: [
        {
          title: "घरेलू सहायता (एक बार / नियमित)",
          bullets: ["सफाई, व्यवस्थित करना, कपड़े धोना", "नियमित प्लान उपलब्ध"],
        },
        {
          title: "हाउस क्लीनिंग",
          bullets: [
            "वेट एरिया (किचन, बाथरूम, वॉशबेसिन, टॉयलेट)",
            "लिविंग रूम की डीप क्लीनिंग आदि",
            "रियल एस्टेट/कॉन्ट्रैक्टर हेतु अनुरोध पर सहायता",
          ],
        },
      ],
      coverageTitle: "सेवा क्षेत्र",
      coverageBody:
        "मुख्य रूप से ताकात्सुकी। अनुरोध के अनुसार नजदीकी क्षेत्रों में भी संभव हो सकता है।",
      faq: [
        {
          q: "क्या उसी दिन बुकिंग संभव है?",
          a: "उपलब्धता पर निर्भर करता है। कभी-कभी संभव है—कृपया पहले संपर्क करें।",
        },
        {
          q: "क्या मेरी गैर-मौजूदगी में भी सेवा ली जा सकती है?",
          a: "हाँ, शर्तों और चाबी प्रबंधन नियमों पर सहमति के बाद संभव है।",
        },
        {
          q: "क्या उसी दिन अतिरिक्त काम की रिक्वेस्ट कर सकते हैं?",
          a: "यदि शेड्यूल अनुमति दे तो हम यथासंभव लचीला व्यवहार करेंगे।",
        },
        {
          q: "क्या नियमित प्लान उपलब्ध हैं?",
          a: "हाँ। हम आपकी जरूरत और फ्रीक्वेंसी के अनुसार प्रस्ताव देंगे।",
        },
      ],
      contactTitle: "संपर्क करें",
      contactText:
        "उपलब्धता जाँचने या अनुमान (कोट) के लिए, कृपया LINE या वेबसाइट के संपर्क फॉर्म के माध्यम से हमसे जुड़ें।",
      toProductsText: "टॉप पेज पर लौटें",
    },
  },

  /* ========= アラビア語 ========= */
  ar: {
    home: {
      headline: site.name,
      description:
        "نقدّم خدمات المساعدة المنزلية وتنظيف المنازل بشكل أساسي في تاكاتسوكي (أوساكا). من المطبخ والحمّام إلى تنظيف عميق لغرفة المعيشة وخطط دورية، نقترح خدمة تناسب احتياجاتك.",
    },
    stores: {
      heroTitle: `${site.name} ─ قائمة الفروع`,
      heroAreas: "تاكاتسوكي (أوساكا)",
      heroLead: "نقدّم خدمات المساعدة المنزلية وتنظيف المنازل.",
      heroTail: "اطّلع على منطقة الخدمة والتفاصيل في هذه الصفحة.",
      heroIntroLine: `${site.name} يقدّم خدمات المساعدة المنزلية وتنظيف المنازل بشكل أساسي في تاكاتسوكي (أوساكا).`,
    },
    areasLocal: {
      h1: "مساعدة منزلية وتنظيف في تاكاتسوكي (أوساكا)",
      lead: "نخدم بشكل أساسي تاكاتسوكي. أخبرنا باحتياجاتك والتواريخ المفضلة.",
      services: [
        {
          title: "مساعدة منزلية (مرة واحدة / دورية)",
          bullets: ["تنظيف، ترتيب، غسيل", "تتوفر خطط دورية"],
        },
        {
          title: "تنظيف المنزل",
          bullets: [
            "المناطق الرطبة (المطبخ، الحمّام، حوض الغسيل، دورة المياه)",
            "تنظيف عميق لغرفة المعيشة وغيرها",
            "طلبات للعقارات/المقاولين حسب الاستشارة",
          ],
        },
      ],
      coverageTitle: "منطقة الخدمة",
      coverageBody:
        "بشكل أساسي تاكاتسوكي. قد تكون المناطق القريبة ممكنة حسب الطلب.",
      faq: [
        {
          q: "هل يمكن الحجز في نفس اليوم؟",
          a: "قد يكون ذلك ممكنًا حسب التوفر. يُرجى التواصل معنا أولًا.",
        },
        {
          q: "هل يمكنكم العمل أثناء غيابي عن المنزل؟",
          a: "نعم، بعد الاتفاق على الشروط وقواعد إدارة المفاتيح.",
        },
        {
          q: "هل يمكن طلب أعمال إضافية في نفس اليوم؟",
          a: "إذا سمح الجدول الزمني، سنحاول الاستجابة بشكل مرن.",
        },
        {
          q: "هل توجد خطط دورية؟",
          a: "نعم. سنقترح خطة تناسب احتياجاتك وتكرارك.",
        },
      ],
      contactTitle: "اتصل بنا",
      contactText:
        "للاستفسار عن المواعيد المتاحة أو طلب عرض سعر، يُرجى التواصل معنا عبر LINE أو نموذج الاتصال على الموقع.",
      toProductsText: "العودة إلى الصفحة الرئيسية",
    },
  },
};

/* =========================
   Footer L10N（サイト名は自動追従）
========================= */
function footerAlt(name: string) {
  return name || "Official Website";
}

/** Footer の多言語テキスト */
export const FOOTER_STRINGS: Record<string, FooterI18n> = {
  ja: {
    cta: "無料相談・お問い合わせ",
    snsAria: "SNSリンク",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "公式サイト",
    siteAlt: site.name,
    areaLinkText: "高槻市の家事代行・ハウスクリーニング",
    rights: "All rights reserved.",
  },
  en: {
    cta: "Contact us",
    snsAria: "Social links",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Official website",
    siteAlt: footerAlt(site.name),
    areaLinkText: "Housekeeping & house cleaning in Takatsuki",
    rights: "All rights reserved.",
  },
  zh: {
    cta: "免费咨询・联系",
    snsAria: "社交链接",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "官网",
    siteAlt: `${site.name} 官方网站`,
    areaLinkText: "高槻市的家政与家居清洁",
    rights: "版权所有。",
  },
  "zh-TW": {
    cta: "免費諮詢・聯絡我們",
    snsAria: "社群連結",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "官方網站",
    siteAlt: `${site.name} 官方網站`,
    areaLinkText: "高槻市的家事服務・居家清潔",
    rights: "版權所有。",
  },
  ko: {
    cta: "문의하기",
    snsAria: "SNS 링크",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "공식 사이트",
    siteAlt: footerAlt(site.name),
    areaLinkText: "다카츠키시 가사도우미·하우스 클리닝",
    rights: "판권 소유.",
  },
  fr: {
    cta: "Nous contacter",
    snsAria: "Liens sociaux",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Site officiel",
    siteAlt: footerAlt(site.name),
    areaLinkText: "Aide ménagère & ménage à Takatsuki",
    rights: "Tous droits réservés.",
  },
  es: {
    cta: "Contáctanos",
    snsAria: "Enlaces sociales",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Sitio oficial",
    siteAlt: footerAlt(site.name),
    areaLinkText: "Ayuda doméstica y limpieza en Takatsuki",
    rights: "Todos los derechos reservados.",
  },
  de: {
    cta: "Kontakt",
    snsAria: "Soziale Links",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Offizielle Website",
    siteAlt: footerAlt(site.name),
    areaLinkText: "Haushaltshilfe & Hausreinigung in Takatsuki",
    rights: "Alle Rechte vorbehalten.",
  },
  pt: {
    cta: "Fale conosco",
    snsAria: "Redes sociais",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Site oficial",
    siteAlt: footerAlt(site.name),
    areaLinkText: "Serviços domésticos e limpeza em Takatsuki",
    rights: "Todos os direitos reservados.",
  },
  it: {
    cta: "Contattaci",
    snsAria: "Link social",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Sito ufficiale",
    siteAlt: footerAlt(site.name),
    areaLinkText: "Assistenza domestica e pulizie a Takatsuki",
    rights: "Tutti i diritti riservati.",
  },
  ru: {
    cta: "Связаться с нами",
    snsAria: "Ссылки на соцсети",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Официальный сайт",
    siteAlt: footerAlt(site.name),
    areaLinkText: "Помощь по дому и уборка в Такацуки",
    rights: "Все права защищены.",
  },
  th: {
    cta: "ติดต่อเรา",
    snsAria: "ลิงก์โซเชียล",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "เว็บไซต์ทางการ",
    siteAlt: footerAlt(site.name),
    areaLinkText: "แม่บ้านและทำความสะอาดในทาคัตสึกิ",
    rights: "สงวนลิขสิทธิ์",
  },
  vi: {
    cta: "Liên hệ",
    snsAria: "Liên kết mạng xã hội",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Trang chính thức",
    siteAlt: footerAlt(site.name),
    areaLinkText: "Giúp việc & vệ sinh nhà ở tại Takatsuki",
    rights: "Mọi quyền được bảo lưu.",
  },
  id: {
    cta: "Hubungi kami",
    snsAria: "Tautan sosial",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Situs resmi",
    siteAlt: footerAlt(site.name),
    areaLinkText: "Asisten rumah tangga & pembersihan di Takatsuki",
    rights: "Hak cipta dilindungi.",
  },
  hi: {
    cta: "संपर्क करें",
    snsAria: "सोशल लिंक",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "आधिकारिक वेबसाइट",
    siteAlt: footerAlt(site.name),
    areaLinkText: "ताकात्सुकी में घरेलू सहायता व हाउस क्लीनिंग",
    rights: "सर्वाधिकार सुरक्षित।",
  },
  ar: {
    cta: "اتصل بنا",
    snsAria: "روابط التواصل الاجتماعي",
    instagramAlt: "إنستغرام",
    lineAlt: "لاين",
    siteAria: "الموقع الرسمي",
    siteAlt: footerAlt(site.name) as unknown as string,
    areaLinkText: "مساعدة منزلية وتنظيف في تاكاتسوكي",
    rights: "جميع الحقوق محفوظة.",
  },
};

/* =========================
   FAQ データ（ここで集約管理）
========================= */
export const faqItems: FaqItem[] = [
  {
    question: "対応エリアはどこですか？",
    answer:
      "大阪府高槻市を中心に対応しています。近隣エリアも内容により対応可能な場合がありますので、まずはお気軽にご相談ください。",
  },
  {
    question: "見積もりは無料ですか？",
    answer:
      "はい、無料です。現地確認が必要な場合もありますが、費用はいただきません。",
  },
  {
    question: "支払い方法は？",
    answer:
      "現金・銀行振込・各種キャッシュレス（ご相談ください）に対応しています。",
  },
  {
    question: "当日の追加依頼や延長は可能ですか？",
    answer:
      "当日のスケジュール次第ですが、可能な限り柔軟に対応いたします。スタッフへご相談ください。",
  },
  {
    question: "キャンセル料はかかりますか？",
    answer:
      "前日キャンセルは無料、当日キャンセルは作業代の50％を頂戴しております（事前連絡なしの不在は100％）。",
  },
];

/* =========================
   ページ辞書（ogImage は任意）
========================= */
const PAGES = {
  home: {
    path: "/",
    title: `${site.name}｜家事代行・ハウスクリーニング（高槻）`,
    description:
      "大阪府高槻市を中心に、家事代行／ハウスクリーニングを提供。水回りから定期清掃まで丁寧に対応します。",
    ogType: "website",
  },
  about: {
    path: "/about",
    title: `私たちの想い｜${site.name}`,
    description:
      "暮らしに寄り添い、快適で清潔な空間づくりをサポートする私たちの想いをご紹介します。",
    ogType: "website",
  },
  news: {
    path: "/news",
    title: `お知らせ｜${site.name}`,
    description: `${site.name} の最新情報・キャンペーン・営業時間などのお知らせ。`,
    ogType: "website",
  },
  areasLocal: {
    path: "/areas/local",
    title: `高槻市の家事代行・ハウスクリーニング｜${site.name}`,
    description:
      "高槻市で家事代行・ハウスクリーニング。定期／スポット対応。水回り・リビングの清掃もご相談ください。",
    ogType: "article",
  },
  products: {
    path: "/products",
    title: `サービス一覧｜${site.name}`,
    description: `${site.name}のサービス一覧。家事代行、水回り清掃、リビングの徹底清掃、定期清掃などを掲載。`,
    ogType: "website",
    ogImage: "/images/ogpLogo.png", // ★統一
  },
  productsEC: {
    path: "/products-ec",
    title: `サービス一覧（オンライン予約）｜${site.name}`,
    description: `${site.name}のサービス一覧（オンライン予約対応）。家事代行・ハウスクリーニングを丁寧に実施します。`,
    ogType: "website",
    ogImage: "/images/ogpLogo.png", // ★統一
  },
  projects: {
    path: "/projects",
    title: `サービス紹介｜${site.name}`,
    description: `${site.name}のサービス紹介ページ。水回り清掃、リビング清掃、定期清掃などを掲載。`,
    ogType: "website",
  },
  stores: {
    path: "/stores",
    title: `店舗一覧｜${site.name}`,
    description: `${site.name}の店舗一覧ページ。対応エリアやサービスの詳細をご紹介します。`,
    ogType: "website",
  },
  faq: {
    path: "/faq",
    title: `よくある質問（FAQ）｜${site.name}`,
    description: `料金・対応エリア・キャンセル・支払い方法など、${site.name}の家事代行／ハウスクリーニングに関するよくある質問。`,
    ogType: "article",
  },
} as const;

export type PageKey = keyof typeof PAGES;
const pages: Record<PageKey, PageDef> = PAGES as unknown as Record<
  PageKey,
  PageDef
>;

/* =========================
   SEO メタデータビルダー
========================= */
export const seo = {
  base: (): Metadata => ({
    title: `${site.name}｜${site.tagline}`,
    description: site.description,
    keywords: Array.from(site.keywords),
    authors: [{ name: site.name }],
    metadataBase: METADATA_BASE_SAFE,
    alternates: { canonical: pageUrl("/") },

    verification: site.googleSiteVerification
      ? { google: site.googleSiteVerification }
      : undefined,

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title: `${site.name}｜${site.tagline}`,
      description: site.description,
      url: pageUrl("/"),
      siteName: site.name,
      type: "website",
      images: [
        {
          url: pageUrl(site.logoPath),
          width: 1200,
          height: 630,
          alt: `${site.name} OGP`,
        },
      ],
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name}｜${site.tagline}`,
      description: site.description,
      images: [pageUrl(site.logoPath)],
    },
    icons: {
      icon: [
        { url: "/favicon.ico?v=4" },
        { url: "/icon.png", type: "image/png", sizes: "any" },
      ],
      apple: "/icon.png",
      shortcut: "/favicon.ico?v=4",
    },
  }),

  page: (key: PageKey, extra?: Partial<Metadata>): Metadata => {
    const p = pages[key];
    return {
      title: p.title,
      description: p.description,
      keywords: Array.from(site.keywords),
      alternates: { canonical: pageUrl(p.path) },
      openGraph: {
        title: p.title,
        description: p.description,
        url: pageUrl(p.path),
        siteName: site.name,
        images: [
          {
            url: ogImage((p as any).ogImage),
            width: 1200,
            height: 630,
            alt: site.name,
          },
        ],
        locale: "ja_JP",
        type: p.ogType,
      },
      twitter: {
        card: "summary_large_image",
        title: p.title,
        description: p.description,
        images: [ogImage((p as any).ogImage)],
      },
      ...extra,
    };
  },
};

/* =========================
   FAQ → JSON-LD 変換
========================= */
export type QA = { q: string; a: string };
export function faqToJsonLd(faq: ReadonlyArray<QA>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/* =========================
   AI サイト設定（ブランド名/URLは site に追従）
========================= */
export const AI_SITE: AiSiteConfig = {
  brand: site.name,
  url: site.baseUrl,
  areasByLang: {
    ja: "大阪府（高槻市中心）",
    en: "Takatsuki, Osaka (Japan)",
  },
  servicesByLang: {
    ja: ["家事代行", "ハウスクリーニング"],
    en: ["housekeeping", "house cleaning"],
  },
  retail: true,
  productPageRoute: "/products",
  languages: {
    default: "ja",
    allowed: [
      "ja",
      "en",
      "zh",
      "zh-TW",
      "ko",
      "fr",
      "es",
      "de",
      "pt",
      "it",
      "ru",
      "th",
      "vi",
      "id",
      "hi",
      "ar",
    ],
  },
  limits: {
    qaBase: 30,
    qaOwner: 40,
    qaLearned: 60,
    menuLines: 120,
    productLines: 120,
    keywords: 200,
  },
};
