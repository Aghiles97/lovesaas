/**
 * Modular Widget Registry & Layout Presets for Couple SaaS
 * Registers all 13 decomposed production modules from port 3000.
 */
const WIDGET_REGISTRY = {
  hero: {
    id: "hero",
    title: "Hero Header & LDR Clocks",
    icon: "👑",
    desc: "Partner names, live LDR clocks, flight ticket, countdown timer & music bar.",
    category: "header",
    defaultEnabled: true,
    required: false,
    css: "/public/css/widgets/hero.css",
    template: "/core/templates/hero.template.js",
    inspector: "/builder/inspectors/hero.inspector.js",
    runtime: "/public/js/widgets/ambient-effects.runtime.js",
    initFn: "setupQuintillionObserver"
  },
  love_meter: {
    id: "love_meter",
    title: "The Real-Time Lof-O-Meter",
    icon: "📈",
    desc: "Interactive pump meter, quintillion number counter, kiss/hug boosts.",
    category: "interactive",
    defaultEnabled: true,
    css: "/public/css/widgets/love_meter.css",
    template: "/core/templates/love_meter.template.js",
    inspector: "/builder/inspectors/love_meter.inspector.js",
    runtime: "/public/js/widgets/love-meter.runtime.js",
    initFn: "setupLoveMeter"
  },
  reasons: {
    id: "reasons",
    title: "Reasons Why I Lof You (Card Deck)",
    icon: "💌",
    desc: "Tactile deck with category filters (Romance, Adventures, Humor, Food).",
    category: "story",
    defaultEnabled: true,
    css: "/public/css/widgets/reasons.css",
    template: "/core/templates/reasons.template.js",
    inspector: "/builder/inspectors/reasons.inspector.js",
    runtime: "/public/js/reasons.js",
    initFn: "setupReasonsDeck"
  },
  timeline: {
    id: "timeline",
    title: "Chapters of Our Journey",
    icon: "📖",
    desc: "Chronological chapters with photo carousels, highlights, and full-story modals.",
    category: "story",
    defaultEnabled: true,
    css: "/public/css/widgets/timeline.css",
    template: "/core/templates/timeline.template.js",
    inspector: "/builder/inspectors/timeline.inspector.js",
    runtime: "/public/js/timeline.js",
    initFn: "renderTimeline"
  },
  map: {
    id: "map",
    title: "Interactive Love Map",
    icon: "🗺️",
    desc: "Custom Leaflet pins, route flight paths, and worldwide travel milestones.",
    category: "story",
    defaultEnabled: true,
    css: "/public/css/widgets/map.css",
    template: "/core/templates/map.template.js",
    inspector: "/builder/inspectors/map.inspector.js",
    runtime: "/public/js/map.js",
    initFn: "setupInteractiveMap"
  },
  truth_dare: {
    id: "truth_dare",
    title: "Truth or Dare: 100% Fair & Square",
    icon: "🍾",
    desc: "High-stakes couple's duel with animated spinning bottle and round scoreboard.",
    category: "games",
    defaultEnabled: false,
    css: "/public/css/widgets/truth_dare.css",
    template: "/core/templates/truth_dare.template.js",
    inspector: "/builder/inspectors/truth_dare.inspector.js",
    runtime: "/public/js/widgets/truth-dare.runtime.js",
    initFn: "setupTruthOrDareGame"
  },
  spinner: {
    id: "spinner",
    title: "Date Night Roulette Spinner",
    icon: "🎡",
    desc: "Slot machine reels for Dinner, Activity & Sweet Treat with WhatsApp date pass.",
    category: "games",
    defaultEnabled: false,
    css: "/public/css/widgets/spinner.css",
    template: "/core/templates/spinner.template.js",
    inspector: "/builder/inspectors/spinner.inspector.js",
    runtime: "/public/js/widgets/date-spinner.runtime.js",
    initFn: "setupDateSpinner"
  },
  memories: {
    id: "memories",
    title: "Polaroid Photo Wall",
    icon: "📸",
    desc: "Flippable polaroids with captions, 3D tilt hover, and lightbox viewer.",
    category: "gallery",
    defaultEnabled: true,
    css: "/public/css/widgets/memories.css",
    template: "/core/templates/memories.template.js",
    inspector: "/builder/inspectors/memories.inspector.js",
    runtime: "/public/js/memories.js",
    initFn: "renderPolaroids"
  },
  coupons: {
    id: "coupons",
    title: "Scratch-Off Love Coupons",
    icon: "🎟️",
    desc: "Interactive canvas scratch-to-reveal vouchers for massages, dinners, and dates.",
    category: "interactive",
    defaultEnabled: false,
    css: "/public/css/widgets/coupons.css",
    template: "/core/templates/coupons.template.js",
    inspector: "/builder/inspectors/coupons.inspector.js",
    runtime: "/public/js/widgets/scratch-coupons.runtime.js",
    initFn: "renderScratchCoupons"
  },
  boarding_pass: {
    id: "boarding_pass",
    title: "Next Adventure & Boarding Pass",
    icon: "✈️",
    desc: "Dream destination picker + First Class VIP Boarding Pass with barcode & PNG download.",
    category: "interactive",
    defaultEnabled: true,
    css: "/public/css/widgets/boarding_pass.css",
    template: "/core/templates/boarding_pass.template.js",
    inspector: "/builder/inspectors/boarding_pass.inspector.js",
    runtime: "/public/js/widgets/boarding-pass.runtime.js",
    initFn: "setupGiftBox"
  },
  quiz: {
    id: "quiz",
    title: "Couples Trivia Challenge",
    icon: "🧠",
    desc: "5 trivia questions about your relationship + Certificate of Infinite Lof.",
    category: "games",
    defaultEnabled: false,
    css: "/public/css/widgets/quiz.css",
    template: "/core/templates/quiz.template.js",
    inspector: "/builder/inspectors/quiz.inspector.js",
    runtime: "/public/js/widgets/quiz-trivia.runtime.js",
    initFn: "renderQuizStep"
  },
  letter: {
    id: "letter",
    title: "Wax-Sealed Love Letter",
    icon: "📜",
    desc: "Break wax seal to open parchment letter with synchronized audio voice reading.",
    category: "letter",
    defaultEnabled: true,
    css: "/public/css/widgets/letter.css",
    template: "/core/templates/letter.template.js",
    inspector: "/builder/inspectors/letter.inspector.js",
    runtime: "/public/js/widgets/love-letter.runtime.js",
    initFn: "setupLoveLetterFeatures"
  },
  playful: {
    id: "playful",
    title: "Playful Quick Question",
    icon: "🙈",
    desc: "Evasive 'Do you lof me?' question with runaway 'No' button.",
    category: "interactive",
    defaultEnabled: false,
    css: "/public/css/widgets/playful.css",
    template: "/core/templates/playful.template.js",
    inspector: "/builder/inspectors/playful.inspector.js",
    runtime: "/public/js/widgets/playful-game.runtime.js",
    initFn: "setupPlayfulGame"
  }
};

const PRESETS = {
  storyteller: {
    name: "Romantic Storyteller",
    desc: "Focus on your deep narrative: Hero → Map → Chapters → Polaroids → Boarding Pass → Love Letter.",
    widgets: ["hero", "map", "timeline", "memories", "boarding_pass", "letter"]
  },
  playful: {
    name: "Playful & Interactive",
    desc: "High energy games: Hero → Lof-O-Meter → Reasons → Truth/Dare → Spinner → Coupons → Quiz → Playful.",
    widgets: ["hero", "love_meter", "reasons", "truth_dare", "spinner", "coupons", "quiz", "playful"]
  },
  complete: {
    name: "The Full Experience (All 13)",
    desc: "All 13 production modules enabled in a harmonious, feature-packed sequence.",
    widgets: [
      "hero",
      "love_meter",
      "reasons",
      "map",
      "timeline",
      "truth_dare",
      "spinner",
      "memories",
      "coupons",
      "boarding_pass",
      "quiz",
      "letter",
      "playful"
    ]
  },
  minimal_gallery: {
    name: "Minimalist Photo Gallery",
    desc: "Clean & photo-first: Hero → Polaroid Wall → Wax-Sealed Letter.",
    widgets: ["hero", "memories", "letter"]
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { WIDGET_REGISTRY, PRESETS };
}
