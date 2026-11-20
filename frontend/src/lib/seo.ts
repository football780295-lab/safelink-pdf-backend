import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdftools.app";

interface MetadataOptions {
  title: string;
  description: string;
  path: string; // e.g. "/compress" or ""
  lang: "en" | "bn";
  keywords?: string[];
}

export function constructMetadata({
  title,
  description,
  path,
  lang,
  keywords = [],
}: MetadataOptions): Metadata {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const canonicalUrl = `${SITE_URL}/${lang}${cleanPath}`;

  const defaultKeywords = [
    "pdf tools",
    "free pdf online",
    "compress pdf online free",
    "merge pdf",
    "split pdf",
    "jpg to pdf",
    "pdf to jpg",
    "protect pdf",
    "unlock pdf",
    "pdf size komano",
    "bangla pdf tools",
  ];

  return {
    title: `${title} | PDF Tools`,
    description,
    keywords: Array.from(new Set([...keywords, ...defaultKeywords])),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${SITE_URL}/en${cleanPath}`,
        bn: `${SITE_URL}/bn${cleanPath}`,
        "x-default": `${SITE_URL}/en${cleanPath}`,
      },
    },
    openGraph: {
      title: `${title} | PDF Tools`,
      description,
      url: canonicalUrl,
      siteName: "PDF Tools",
      locale: lang === "bn" ? "bn_BD" : "en_US",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/logo.svg`,
          width: 512,
          height: 512,
          alt: "PDF Tools - Free & Secure Online PDF Problem Solver",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | PDF Tools`,
      description,
      images: [`${SITE_URL}/logo.svg`],
    },
  };
}
