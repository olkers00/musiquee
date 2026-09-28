const PALETTES: [string, string][] = [
  ["#ff5f6d", "#fc3c6a"],
  ["#ff8a65", "#c026d3"],
  ["#43cbff", "#6a5cff"],
  ["#67f0c3", "#2dd4bf"],
  ["#f6d242", "#fc3c6a"],
  ["#8ec5fc", "#e0c3fc"],
  ["#fa709a", "#fee140"],
  ["#30cfd0", "#330867"],
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(label: string): string {
  const words = label.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("") || "M";
}

/** Deterministic gradient + initials artwork as an inline SVG data URI — the
 *  demo dataset ships zero network dependencies, matching the "works fully
 *  offline" promise of demo mode. */
export function placeholderArtwork(seed: string, label: string): string {
  const [from, to] = PALETTES[hashSeed(seed) % PALETTES.length];
  const text = initials(label);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/><text x="150" y="168" font-family="system-ui,sans-serif" font-size="96" font-weight="700" fill="rgba(255,255,255,0.92)" text-anchor="middle">${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
