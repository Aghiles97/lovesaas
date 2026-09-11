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
  },
  candle_blowout: {
    id: "candle_blowout",
    title: "Candle Blow-Out & Wish Reveal",
    icon: "🎂",
    desc: "Mic or click trigger to blow SVG candles with flame smoke, confetti eruption & secret wish.",
    category: "birthday",
    defaultEnabled: true,
    css: "/public/css/widgets/candle_blowout.css",
    template: "/core/templates/candle_blowout.template.js",
    inspector: "/builder/inspectors/candle_blowout.inspector.js",
    runtime: "/public/js/widgets/candle-blowout.runtime.js",
    initFn: "setupCandleBlowout"
  },
  milestone_stats: {
    id: "milestone_stats",
    title: "Milestone Life Stats",
    icon: "⏳",
    desc: "Live seconds alive ticker + quirky metrics (heartbeats, coffee, solar trips, sweet dreams).",
    category: "birthday",
    defaultEnabled: true,
    css: "/public/css/widgets/milestone_stats.css",
    template: "/core/templates/milestone_stats.template.js",
    inspector: "/builder/inspectors/milestone_stats.inspector.js",
    runtime: "/public/js/widgets/milestone-stats.runtime.js",
    initFn: "setupMilestoneStats"
  },
  gift_unboxer: {
    id: "gift_unboxer",
    title: "3D Surprise Gift Unboxer",
    icon: "🎁",
    desc: "Multi-stage 3D box unwrapping anim (untie ribbon, lift lid, tissue glow) to reveal hidden gift.",
    category: "birthday",
    defaultEnabled: true,
    css: "/public/css/widgets/gift_unboxer.css",
    template: "/core/templates/gift_unboxer.template.js",
    inspector: "/builder/inspectors/gift_unboxer.inspector.js",
    runtime: "/public/js/widgets/gift-unboxer.runtime.js",
    initFn: "setupGiftUnboxer"
  },
  roast_toast: {
    id: "roast_toast",
    title: "Roast & Toast Birthday Spinner",
    icon: "🥂",
    desc: "Decelerating wheel spinner alternating between playful funny roasts and heartfelt sweet toasts.",
    category: "birthday",
    defaultEnabled: true,
    css: "/public/css/widgets/roast_toast.css",
    template: "/core/templates/roast_toast.template.js",
    inspector: "/builder/inspectors/roast_toast.inspector.js",
    runtime: "/public/js/widgets/roast-toast.runtime.js",
    initFn: "setupRoastToast"
  },
  guestbook: {
    id: "guestbook",
    title: "Guestbook Wish Wall",
    icon: "📌",
    desc: "Corkboard sticky-notes grid with visitor message submissions, pins, and photo attachments.",
    category: "birthday",
    defaultEnabled: true,
    css: "/public/css/widgets/guestbook.css",
    template: "/core/templates/guestbook.template.js",
    inspector: "/builder/inspectors/guestbook.inspector.js",
    runtime: "/public/js/widgets/guestbook.runtime.js",
    initFn: "setupGuestbook"
  },
  party_jukebox: {
    id: "party_jukebox",
    title: "Party Jukebox & Playlist",
    icon: "📻",
    desc: "Vinyl turntable audio player with spinning platter, tone arm, and animated audio visualizer.",
    category: "birthday",
    defaultEnabled: true,
    css: "/public/css/widgets/party_jukebox.css",
    template: "/core/templates/party_jukebox.template.js",
    inspector: "/builder/inspectors/party_jukebox.inspector.js",
    runtime: "/public/js/widgets/party-jukebox.runtime.js",
    initFn: "setupPartyJukebox"
  },
  tenure_ticker: {
    id: "tenure_ticker",
    title: "Tenure Ticker",
    icon: "⏳",
    desc: "Precision counter (Y/M/D/S elapsed) + next milestone countdown.",
    category: "anniversary",
    defaultEnabled: true,
    css: "/public/css/widgets/tenure_ticker.css",
    template: "/core/templates/tenure_ticker.template.js",
    inspector: "/builder/inspectors/tenure_ticker.inspector.js",
    runtime: "/public/js/widgets/tenure-ticker.runtime.js",
    initFn: "setupTenureTicker"
  },
  star_map: {
    id: "star_map",
    title: "Night Sky Star Map",
    icon: "✨",
    desc: "Canvas render → constellation alignment on exact date & coordinates.",
    category: "anniversary",
    defaultEnabled: true,
    css: "/public/css/widgets/star_map.css",
    template: "/core/templates/star_map.template.js",
    inspector: "/builder/inspectors/star_map.inspector.js",
    runtime: "/public/js/widgets/star-map.runtime.js",
    initFn: "setupStarMap"
  },
  then_now_slider: {
    id: "then_now_slider",
    title: "Then vs. Now Slider",
    icon: "🌗",
    desc: "Split-screen draggable comparison of first vs recent photo.",
    category: "anniversary",
    defaultEnabled: true,
    css: "/public/css/widgets/then_now_slider.css",
    template: "/core/templates/then_now_slider.template.js",
    inspector: "/builder/inspectors/then_now_slider.inspector.js",
    runtime: "/public/js/widgets/then-now-slider.runtime.js",
    initFn: "setupThenNowSlider"
  },
  bucket_list: {
    id: "bucket_list",
    title: "Couple Bucket List",
    icon: "🎯",
    desc: "Shared checklist → completed vs future goals + progress bar.",
    category: "anniversary",
    defaultEnabled: true,
    css: "/public/css/widgets/bucket_list.css",
    template: "/core/templates/bucket_list.template.js",
    inspector: "/builder/inspectors/bucket_list.inspector.js",
    runtime: "/public/js/widgets/bucket-list.runtime.js",
    initFn: "setupBucketList"
  },
  audio_capsule: {
    id: "audio_capsule",
    title: "Audio Time Capsule",
    icon: "🎙️",
    desc: "Waveform audio player → archived voice memos & messages across years.",
    category: "anniversary",
    defaultEnabled: true,
    css: "/public/css/widgets/audio_capsule.css",
    template: "/core/templates/audio_capsule.template.js",
    inspector: "/builder/inspectors/audio_capsule.inspector.js",
    runtime: "/public/js/widgets/audio-capsule.runtime.js",
    initFn: "setupAudioCapsule"
  },
  milestone_odyssey: {
    id: "milestone_odyssey",
    title: "Milestone Odyssey",
    icon: "🚀",
    desc: "Horizontal line map connecting major relationship milestones.",
    category: "anniversary",
    defaultEnabled: true,
    css: "/public/css/widgets/milestone_odyssey.css",
    template: "/core/templates/milestone_odyssey.template.js",
    inspector: "/builder/inspectors/milestone_odyssey.inspector.js",
    runtime: "/public/js/widgets/milestone-odyssey.runtime.js",
    initFn: "setupMilestoneOdyssey"
  }
};

const PRESETS = {
  anniversary: {
    name: "Anniversary Odyssey",
    desc: "Celebrate your love journey: Hero → Tenure Ticker → Star Map → Then vs. Now → Milestone Odyssey → Bucket List → Audio Time Capsule → Letter.",
    widgets: [
      "hero",
      "tenure_ticker",
      "star_map",
      "then_now_slider",
      "milestone_odyssey",
      "bucket_list",
      "audio_capsule",
      "letter"
    ]
  },
  birthday: {
    name: "Birthday Celebration",
    desc: "The ultimate birthday bash: Hero → Candle Blow-Out → Milestone Stats → Gift Unboxer → Roast & Toast → Guestbook → Party Jukebox → Letter.",
    widgets: [
      "hero",
      "candle_blowout",
      "milestone_stats",
      "gift_unboxer",
      "roast_toast",
      "guestbook",
      "party_jukebox",
      "letter"
    ]
  },
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
