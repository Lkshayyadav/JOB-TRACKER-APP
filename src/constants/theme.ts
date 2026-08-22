export const COLORS = {
  // Deep OLED Matte Canvas
  bg: "#0B0C0E",
  bgSecondary: "#101216",
  
  // Surfaces & Containers
  card: "#14161B",
  cardElevated: "#1A1D24",
  surface: "#1D2028",
  surfaceHighlight: "#262B36",
  
  // Borders
  border: "#222630",
  borderLight: "#2D3340",
  borderFocus: "#CCFF00",
  
  // Electric Lime & Brand Accents (From Reference Design)
  primary: "#CCFF00",       // High-energy Electric Lime
  primaryBright: "#D4FF00", // Bright neon accent
  primaryDark: "#99BF00",
  onPrimary: "#0B0C0E",     // Bold contrast black on lime
  
  // Text Colors
  text: "#FFFFFF",
  textSecondary: "#8E95A5",
  textMuted: "#5F6575",
  textDisabled: "#3D4250",
  
  // Pipeline Stage Status Colors (Matching Web & Reference)
  status: {
    Wishlist: "#8E95A5",
    Applied: "#0EA5E9",
    OA: "#F59E0B",
    "Technical Round": "#A855F7",
    "HR Round": "#6366F1",
    Offer: "#CCFF00",
    Rejected: "#EF4444",
  },
  
  // Priority Colors
  priority: {
    High: "#EF4444",
    Medium: "#F59E0B",
    Low: "#10B981",
  },
  
  // Semantics
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#0EA5E9",
} as const;

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600" as const },
  bodyLarge: { fontSize: 16, fontWeight: "400" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  bodySmall: { fontSize: 12, fontWeight: "400" as const },
  caption: { fontSize: 11, fontWeight: "500" as const },
  mono: { fontFamily: "monospace" },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  glowLime: {
    shadowColor: "#CCFF00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
};
