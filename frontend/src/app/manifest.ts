import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PDF Tools - Free & Secure PDF Solver",
    short_name: "PDF Tools",
    description: "Compress, merge, split, convert, protect, and unlock PDF documents online.",
    start_url: "/en",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#f43f5e",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
