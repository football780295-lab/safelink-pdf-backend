import React from "react";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "bn" }];
}

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // Await params per Next.js 15+ dynamic route specifications
  await params;
  return <>{children}</>;
}
