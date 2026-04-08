export type BuyRegionDescriptor = {
  key: string;
  name: string;
  label: string;
  location: [number, number];
  markerColor: [number, number, number];
  glowColor: [number, number, number];
  baseColor: [number, number, number];
};

type BuyRegionMatcher = Omit<BuyRegionDescriptor, "label"> & {
  patterns: RegExp[];
};

const graphiteOcean: [number, number, number] = [0.08, 0.09, 0.12];
const softGlow: [number, number, number] = [0.19, 0.22, 0.31];

const regionMatchers: BuyRegionMatcher[] = [
  {
    key: "hong-kong",
    name: "Hong Kong",
    location: [22.3193, 114.1694],
    markerColor: [0.78, 0.67, 0.47],
    glowColor: softGlow,
    baseColor: graphiteOcean,
    patterns: [/香港/u, /\bHONG\s*KONG\b/i, /\bHK\b/i],
  },
  {
    key: "tokyo",
    name: "Tokyo",
    location: [35.6762, 139.6503],
    markerColor: [0.72, 0.63, 0.86],
    glowColor: softGlow,
    baseColor: graphiteOcean,
    patterns: [/东京/u, /\bTOKYO\b/i, /\bJP\b/i, /日本/u],
  },
  {
    key: "singapore",
    name: "Singapore",
    location: [1.3521, 103.8198],
    markerColor: [0.54, 0.74, 0.76],
    glowColor: softGlow,
    baseColor: graphiteOcean,
    patterns: [/新加坡/u, /\bSINGAPORE\b/i, /\bSG\b/i],
  },
  {
    key: "frankfurt",
    name: "Frankfurt",
    location: [50.1109, 8.6821],
    markerColor: [0.66, 0.74, 0.87],
    glowColor: softGlow,
    baseColor: graphiteOcean,
    patterns: [/法兰克福/u, /\bFRANKFURT\b/i, /\bDE\b/i, /德国/u],
  },
  {
    key: "los-angeles",
    name: "Los Angeles",
    location: [34.0522, -118.2437],
    markerColor: [0.81, 0.62, 0.58],
    glowColor: softGlow,
    baseColor: graphiteOcean,
    patterns: [/洛杉矶/u, /\bLOS\s*ANGELES\b/i, /\bUS\b/i, /美国/u],
  },
  {
    key: "london",
    name: "London",
    location: [51.5072, -0.1276],
    markerColor: [0.74, 0.74, 0.82],
    glowColor: softGlow,
    baseColor: graphiteOcean,
    patterns: [/伦敦/u, /\bLONDON\b/i, /\bUK\b/i, /\bGB\b/i, /英国/u],
  },
  {
    key: "paris",
    name: "Paris",
    location: [48.8566, 2.3522],
    markerColor: [0.76, 0.71, 0.82],
    glowColor: softGlow,
    baseColor: graphiteOcean,
    patterns: [/巴黎/u, /\bPARIS\b/i, /\bFR\b/i, /法国/u],
  },
  {
    key: "dubai",
    name: "Dubai",
    location: [25.2048, 55.2708],
    markerColor: [0.82, 0.65, 0.46],
    glowColor: softGlow,
    baseColor: graphiteOcean,
    patterns: [/迪拜/u, /\bDUBAI\b/i, /\bAE\b/i, /阿联酋/u],
  },
  {
    key: "sydney",
    name: "Sydney",
    location: [-33.8688, 151.2093],
    markerColor: [0.58, 0.69, 0.84],
    glowColor: softGlow,
    baseColor: graphiteOcean,
    patterns: [/悉尼/u, /\bSYDNEY\b/i, /\bAU\b/i, /澳大利亚/u],
  },
];

export const resolveBuyRegion = (
  value: unknown
): BuyRegionDescriptor | null => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const label = value.trim();
  const matchedRegion = regionMatchers.find((region) =>
    region.patterns.some((pattern) => pattern.test(label))
  );

  if (!matchedRegion) {
    return null;
  }

  return {
    key: matchedRegion.key,
    name: matchedRegion.name,
    label,
    location: matchedRegion.location,
    markerColor: matchedRegion.markerColor,
    glowColor: matchedRegion.glowColor,
    baseColor: matchedRegion.baseColor,
  };
};
