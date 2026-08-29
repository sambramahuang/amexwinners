// -----------------------------------------------------------------------
// Store-type icons for graph nodes, hand-drawn in the same stroke-based,
// currentColor, rounded-cap style already used for every other inline SVG
// in the app (nav chevrons, carousel arrows, etc.) rather than emoji, which
// render inconsistently across platforms and don't match the site's line-art
// look. Each value is the inner markup for a 24x24 viewBox icon.
// -----------------------------------------------------------------------

export const GRAPH_ICONS: Record<string, string> = {
  coffee: `
    <path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z"/>
    <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/>
    <path d="M8 3v2M11 3v2"/>
  `,
  book: `
    <path d="M4 5a2 2 0 0 1 2-2h4v17H6a2 2 0 0 0-2 2V5Z"/>
    <path d="M20 5a2 2 0 0 0-2-2h-4v17h4a2 2 0 0 1 2 2V5Z"/>
  `,
  flower: `
    <circle cx="12" cy="7" r="2"/>
    <circle cx="17" cy="12" r="2"/>
    <circle cx="12" cy="17" r="2"/>
    <circle cx="7" cy="12" r="2"/>
    <circle cx="12" cy="12" r="1.6"/>
    <path d="M12 19v3"/>
  `,
  pulse: `<path d="M3 12h4l2 6 4-14 2 8h6"/>`,
  bike: `
    <circle cx="6" cy="17" r="3"/>
    <circle cx="18" cy="17" r="3"/>
    <path d="M6 17l4-8h5l3 8"/>
    <path d="M10 9h4"/>
  `,
  scissors: `
    <circle cx="6" cy="6" r="2.2"/>
    <circle cx="6" cy="18" r="2.2"/>
    <path d="M20 4 8 16"/>
    <path d="M8 8l12 12"/>
  `,
  restaurant: `
    <path d="M7 2v6a1 1 0 0 0 2 0V2M9 2v6a1 1 0 0 0 2 0V2M8 8v13"/>
    <path d="M17 2s-2 2-2 6 2 5 2 5v8"/>
  `,
  cross: `
    <rect x="4" y="4" width="16" height="16" rx="4"/>
    <path d="M12 8v8M8 12h8"/>
  `,
  heart: `
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/>
    <path d="M8 11h2l1.5-2 1 4 1.5-2H17"/>
  `,
  printer: `
    <path d="M6 9V4h12v5"/>
    <rect x="4" y="9" width="16" height="7" rx="1.5"/>
    <path d="M6 16v4h12v-4"/>
  `,
  hanger: `
    <path d="M12 4a2 2 0 1 1 2 2c-.6.4-1 .8-1 1.5v.5"/>
    <path d="M12 8l-9 6h18l-9-6Z"/>
    <path d="M5 17h14"/>
  `,
  shoe: `
    <path d="M3 17c0-2 1-3 3-4l6-3c1-.6 2-1 3-1h2a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H3Z"/>
    <path d="M3 17v-2"/>
  `,
  newspaper: `
    <path d="M4 4h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V4Z"/>
    <path d="M17 4h2a1 1 0 0 1 1 1v13"/>
    <path d="M7 8h7M7 11h7M7 14h4"/>
  `,
  blocks: `
    <rect x="4" y="13" width="6" height="6" rx="1"/>
    <rect x="11" y="13" width="6" height="6" rx="1"/>
    <rect x="7.5" y="6" width="6" height="6" rx="1"/>
  `,
  star: `<path d="M12 3l2.4 5.5 6 .6-4.5 4 1.3 5.9L12 16l-5.2 3 1.3-5.9-4.5-4 6-.6L12 3Z"/>`,
  knife: `
    <path d="M4 15l9-9a3 3 0 0 1 4 4l-9 9"/>
    <path d="M8 19l-3-3"/>
    <path d="M4 21l3-3"/>
  `,
  beer: `
    <path d="M6 8h9v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z"/>
    <path d="M15 10h2a2 2 0 0 1 0 4h-2"/>
    <path d="M6 8c0-2 1-3 1-3"/>
  `,
  pan: `
    <circle cx="10" cy="12" r="6"/>
    <path d="M16 10l6-2"/>
  `,
  sofa: `
    <path d="M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
    <rect x="3" y="12" width="18" height="6" rx="2"/>
    <path d="M5 18v2M19 18v2"/>
  `,
  vinyl: `
    <circle cx="12" cy="12" r="8"/>
    <circle cx="12" cy="12" r="2.5"/>
  `,
  fish: `
    <path d="M3 12c4-5 12-5 16 0-4 5-12 5-16 0Z"/>
    <circle cx="16" cy="11" r="0.6" fill="currentColor" stroke="none"/>
    <path d="M19 12l3-3M19 12l3 3"/>
  `,
  cart: `
    <circle cx="9" cy="20" r="1.3"/>
    <circle cx="17" cy="20" r="1.3"/>
    <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21 7H6"/>
  `,
}
