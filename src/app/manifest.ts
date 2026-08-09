import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrueNorth — Your Financial Decision Engine",
    short_name: "TrueNorth",
    description:
      "Not a tracker. An operator's manual for your money. Four engines, one page, fifteen minutes a month.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#12233B",
    theme_color: "#12233B",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
