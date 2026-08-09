import sharp from "sharp";
import { mkdirSync } from "node:fs";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="7" fill="#12233B"/>
  <circle cx="16" cy="16" r="11" stroke="#C9962E" stroke-width="1.5"/>
  <circle cx="16" cy="16" r="2.4" fill="#C9962E"/>
  <polygon points="16,5 17.6,15 16,13.4 14.4,15" fill="#E0B968"/>
  <polygon points="16,27 14.4,17 16,18.6 17.6,17" fill="#C9962E"/>
  <polygon points="5,16 15,14.4 13.4,16 15,17.6" fill="#A8322B"/>
  <polygon points="27,16 17,17.6 18.6,16 17,14.4" fill="#A8322B"/>
</svg>`;

// Maskable variant: same mark, more breathing room so Android's circular/
// squircle crop doesn't clip the compass points.
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" fill="#12233B"/>
  <circle cx="16" cy="16" r="9" stroke="#C9962E" stroke-width="1.3"/>
  <circle cx="16" cy="16" r="2" fill="#C9962E"/>
  <polygon points="16,7.5 17.3,15.5 16,14.2 14.7,15.5" fill="#E0B968"/>
  <polygon points="16,24.5 14.7,16.5 16,17.8 17.3,16.5" fill="#C9962E"/>
  <polygon points="7.5,16 15.5,14.7 14.2,16 15.5,17.3" fill="#A8322B"/>
  <polygon points="24.5,16 16.5,17.3 17.8,16 16.5,14.7" fill="#A8322B"/>
</svg>`;

mkdirSync("public", { recursive: true });

const targets = [
  { file: "public/icon-192.png", size: 192, src: svg },
  { file: "public/icon-512.png", size: 512, src: svg },
  { file: "public/apple-touch-icon.png", size: 180, src: svg },
  { file: "public/icon-maskable-512.png", size: 512, src: maskableSvg },
];

for (const t of targets) {
  await sharp(Buffer.from(t.src)).resize(t.size, t.size).png().toFile(t.file);
  console.log("wrote", t.file);
}
