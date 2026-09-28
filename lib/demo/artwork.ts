import { createRng } from "./seed-random";

const PALETTES: [string, string, string][] = [
  ["#FF6B6B", "#C44BC4", "#3B1E6B"],
  ["#FF9F45", "#F5386D", "#2A0944"],
  ["#3EECAC", "#EE74E1", "#150050"],
  ["#43CBFF", "#9708CC", "#12002A"],
  ["#FFD36E", "#FF6E7F", "#1B0B3B"],
  ["#7EE8FA", "#4A00E0", "#090015"],
  ["#FFAFBD", "#C471ED", "#1A0033"],
  ["#F6D242", "#FA5B0F", "#2B0B00"],
  ["#67F0C3", "#2B7CFF", "#050B2E"],
  ["#F857A6", "#FF5858", "#20002C"],
  ["#8EC5FC", "#E0C3FC", "#1B1035"],
  ["#F5F7FA", "#B8C6DB", "#0F1420"],
];

/**
 * Deterministic abstract-gradient "album art" so demo mode never depends on
 * network image hosts — same seed always renders the same artwork.
 */
export function generateArtwork(seed: string): string {
  const rng = createRng(seed);
  const [c1, c2, c3] = PALETTES[rng.int(0, PALETTES.length - 1)];
  const angle = rng.int(0, 360);
  const cx1 = rng.int(10, 90);
  const cy1 = rng.int(10, 90);
  const cx2 = rng.int(10, 90);
  const cy2 = rng.int(10, 90);
  const shape = rng.pick(["circle", "rect"]);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g" gradientTransform="rotate(${angle})">
          <stop offset="0%" stop-color="${c3}"/>
          <stop offset="100%" stop-color="${c1}"/>
        </linearGradient>
        <radialGradient id="r1" cx="${cx1}%" cy="${cy1}%" r="70%">
          <stop offset="0%" stop-color="${c2}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="r2" cx="${cx2}%" cy="${cy2}%" r="60%">
          <stop offset="0%" stop-color="${c1}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
        </radialGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="34"/></filter>
      </defs>
      <rect width="400" height="400" fill="url(#g)"/>
      <g filter="url(#blur)">
        <rect width="400" height="400" fill="url(#r1)"/>
        <rect width="400" height="400" fill="url(#r2)"/>
        ${shape === "circle"
          ? `<circle cx="${rng.int(60, 340)}" cy="${rng.int(60, 340)}" r="${rng.int(70, 140)}" fill="${c2}" opacity="0.5"/>`
          : `<rect x="${rng.int(0, 200)}" y="${rng.int(0, 200)}" width="${rng.int(120, 260)}" height="${rng.int(120, 260)}" fill="${c2}" opacity="0.45" transform="rotate(${angle} 200 200)"/>`}
      </g>
      <rect width="400" height="400" fill="black" opacity="0.06"/>
    </svg>`.trim();

  const encoded = typeof window === "undefined"
    ? Buffer.from(svg).toString("base64")
    : window.btoa(unescape(encodeURIComponent(svg)));

  return `data:image/svg+xml;base64,${encoded}`;
}
