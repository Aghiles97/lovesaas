const { Pool } = require("pg");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

// Load local .env
const envPath = path.join(__dirname, "..", "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [k, ...v] = trimmed.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  });
}

const auth = require("../auth");

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://dza@localhost:5432/couple_saas";
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "couple_saas.json");

let isPgConnected = false;

function loadLocalStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  let data = { tenants: {}, site_configs: {}, users: {}, user_sessions: {}, orders: {} };
  if (fs.existsSync(DATA_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch (e) {}
  }
  data.tenants = data.tenants || {};
  data.site_configs = data.site_configs || {};
  data.users = data.users || {};
  data.user_sessions = data.user_sessions || {};
  data.orders = data.orders || {};
  return data;
}

function saveLocalStore(store) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on("error", (err) => {
  // Silent fallback handled in initDb
});

const DEFAULT_PRESETS = {
  birthday: [
    "hero",
    "candle_blowout",
    "milestone_stats",
    "gift_unboxer",
    "roast_toast",
    "guestbook",
    "party_jukebox",
    "letter"
  ],
  storyteller: ["hero", "timeline", "map", "memories", "boarding_pass", "letter"],
  playful: ["hero", "love_meter", "reasons", "truth_dare", "spinner", "coupons", "quiz", "playful"],
  complete: [
    "hero",
    "love_meter",
    "reasons",
    "timeline",
    "map",
    "truth_dare",
    "spinner",
    "memories",
    "coupons",
    "boarding_pass",
    "quiz",
    "letter",
    "playful"
  ],
  minimal_gallery: ["hero", "memories", "letter"]
};

const DEFAULT_SECTIONS_DATA = {
  hero: {
    partner1: "Alex",
    partner2: "Sam",
    subtitle: "Our Infinite Love Story ❤️",
    anniversaryDate: "2024-06-15T00:00",
    flightNumber: "LOF-777",
    cityAlg: "Paris 🇫🇷",
    cityPartner: "Tokyo 🇯🇵",
    bgVolume: 80,
    voiceAudio: "audio/myrecording-volume-adjusted.m4r",
    musicTrackTitle: "The Fate of Ophelia • Taylor Swift ✨",
    musicTrackUrl: "taylor-swift-fate-of-ophelia.m4r"
  },
  love_meter: {
    title: "The Real-Time Lof-O-Meter 📈",
    tag: "Infinite Measurement",
    desc: "Pump to add quintillions more lof until we break the laws of physics!",
    baseNumber: "9,847,293,847,192,840,320",
    statusText: "Lof Level: Exploding ❤️",
    pumpBtnText: "Pump Lof Lof! 💖 (+500 Quadrillion)",
    kissBtnText: "Send Kiss Kiss 💋",
    hugBtnText: "Send Hug Hug 🤗",
    resetBtnText: "Reset"
  },
  reasons: [
    { id: "r1", title: "Your Gentle Smile", note: "How you light up every single room effortlessly.", category: "romance" },
    { id: "r2", title: "Our Airport Sprints", note: "Running with heavy luggage and laughing until dawn.", category: "travel" },
    { id: "r3", title: "Inside Jokes", note: "Those silly little phrases only the two of us understand.", category: "humor" },
    { id: "r4", title: "Late Night Cravings", note: "Midnight ramen and warm dessert dates together.", category: "food" }
  ],
  timeline: {
    tag: "Our Real World Travels & Cities",
    title: "Chapters of Our Lof Story 🗺️",
    desc: "From our 17h Vietnam transit to Bali beaches, Jakarta home days, and all our China city expeditions!",
    chapters: [
        {
            "id": "chap-guangzhou-start",
            "tag": "17 — 27 Sept • Canton Tower",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Guangzhou",
            "location": "Guangzhou, China 🇨🇳",
            "title": "Where Our Story Began 🗼✨",
            "desc": "Under the illuminated grandeur of Canton Tower at 11 PM on September 17, our paths crossed and my world changed forever. What was meant to be a simple meeting turned into seven magical hours of non-stop conversation until 6 AM dawn—the kind of effortless connection where time dissolves and two souls recognize each other instantly.\n\nWith only ten precious days together before my flight back home to Algeria, we made every single second count. We spent all our days inseparable, curled up by the window of my apartment overlooking the sprawling city skyline and flowing traffic below, talking endlessly about our lives, dreams, and feelings. When departure morning arrived at the airport, she bought me a sweet bottle of orange juice, and we shared one last bittersweet photo together—a snapshot of two hearts that already knew they could never be parted.",
            "highlights": [
                "7 hours talking non-stop until sunrise by Canton Tower",
                "Sitting by the window watching city traffic",
                "Ten unforgettable days falling hopelessly in love",
                "Airport orange juice & our bittersweet goodbye photo"
            ],
            "icon": "🗼",
            "cityKey": "guangzhou"
        },
        {
            "id": "chap-guangzhou-dec",
            "tag": "10 Dec — 19 Jan • Airport Reunion",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Guangzhou",
            "location": "Guangzhou, China 🇨🇳",
            "title": "Airport Reunion & Birthday Perfume 🎁❤️",
            "desc": "Every single hour I spent in Algeria felt like an eternity of counting down the minutes until I could hold my baby again. Finally, on December 10, my flight touched down in Guangzhou. Stepping through the arrival gate and seeing her beautiful face waiting for me was pure bliss.\n\nShe brought me straight home to her apartment, and the moment the door closed behind us, we wrapped each other in endless tight hugs and kisses, melting away months of distance in seconds. Right then, she surprised me with the most thoughtful birthday gift: the exact bottle of perfume I had been longing for! To be welcomed back to China with such tender affection and the scent of true love was the greatest birthday gift life could ever give me.",
            "highlights": [
                "December 10 airport pickup reunion",
                "Endless warm hugs and kisses welcoming me home",
                "Surprise birthday gift: the dream perfume I always wanted! 🎁",
                "The bliss of being reunited in her loving arms"
            ],
            "icon": "🎁",
            "cityKey": "guangzhou"
        },
        {
            "id": "chap-shenzhen",
            "tag": "19 — 23 Dec • Coastline & Ferris Wheel",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Shenzhen",
            "location": "Shenzhen, China 🌆🌊",
            "title": "Beach Sand Heart & Ferris Wheel 🌆🎡",
            "desc": "Our journey to Shenzhen was our very first couple vlog experience—we took the camera everywhere, laughing and capturing every heartbeat of our adventure. We visited the coastline together; although we didn't swim in the waves, we sat side by side on the warm beach, and I sculpted a beautiful 3D heart into the sand to immortalize our love.\n\nWhen my baby was feeling unwell with her period, I embarked on my very first pharmacy mission to buy feminine pads for my girlfriend. Searching the aisles specifically for size 420mm, the local pharmacist woman looked at me with the warmest, most knowing smile as she handed them to me. Shenzhen treated us to modern wonders too: baby ordered drone delivery right near the Hong Kong skyline (where we sadly lost our DJI secondary camera lens!), we rode in a futuristic autonomous driverless car, and pedaled bikes through the evening breeze to our hotel.\n\nThe next day, she took me to a scenic viewpoint facing Hong Kong where we bought colorful cotton candy just to pose for cute pictures ('it honestly didn't taste that great, but the photos were adorable!'). We finished the night inside a private cabin on the giant illuminated Ferris wheel, rising high above the glowing city lights and collecting memories that will remain forever etched in our hearts.",
            "highlights": [
                "First couple vlog adventure together",
                "Sculpting a romantic 3D heart in the beach sand",
                "Pharmacy mission for 420mm pads with a smiling pharmacist",
                "Futuristic drone delivery by HK skyline & autonomous car",
                "Cotton candy photoshoot & private giant Ferris wheel cabin"
            ],
            "icon": "🌆",
            "cityKey": "shenzhen"
        },
        {
            "id": "chap-chongqing",
            "tag": "2 — 8 Jan • Mountain BBQ & Skyline",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Chongqing",
            "location": "Chongqing, China 🌶️🏙️",
            "title": "Cobblestones & Skyline Mountain BBQ 🌶️🌃",
            "desc": "Chongqing completely stole my heart! Our hotel was tucked in the historic city center along winding cobblestone alleys with an electric, atmospheric charm. Even when my baby had to briefly fly back to Guangzhou for university classes while I explored CQ solo, the city remained enchanting. We indulged in mouth-watering Sichuan hotpot and discovered roadside fruit stalls selling the sweetest, most delicious mangoes for just 10–15 RMB that I became obsessed with!\n\nOne evening, we discovered one of the most romantic dining spots on earth: an open-air barbecue perched on the mountainside facing the jaw-dropping Chongqing skyline. It was hosted by a wonderful, generous Pakistani brother who always agreed to keep his doors open late just for us. We dined under the stars, surrounded by his friendly, cuddly cats that my baby fell head-over-heels in love with (and it made her appreciate Pakistani hospitality and cuisine so much more!).\n\nChongqing was filled with thrilling spectacles: baby took me to an awe-inspiring 360-degree immersive theater show about the 1949 Chinese civil war where I sat spellbound like an excited little kid, and we gazed up at the famous weekend drone light show. She even persuaded me to test our courage on a skyscraper rooftop, walking across a narrow steel bar suspended in the clouds with only a safety cable keeping us from falling ('one tiny slip and boom!'). Not satisfied with just that thrill, the next day she did another daring high-altitude cable photoshoot over the metropolis!",
            "highlights": [
                "Atmospheric cobblestone alleys & spicy Sichuan hotpot",
                "Addicted to 10-15 RMB sweet street mangoes",
                "Mountain BBQ facing the skyline with our Pakistani host & cats",
                "Mind-blowing 360° 1949 civil war theater & drone light show",
                "Thrilling skyscraper ledge cable walk over the abyss"
            ],
            "icon": "🌶️",
            "cityKey": "chongqing"
        },
        {
            "id": "chap-chengdu",
            "tag": "8 — 11 Jan • Panda Base Date",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Chengdu",
            "location": "Chengdu, Sichuan 🐼🎋",
            "title": "Panda Base & Twin Towers 🐼🎋",
            "desc": "We reunited in Chengdu to explore the world-famous Panda sanctuary, laughing endlessly as we treated ourselves to funny panda-butt-shaped ice creams ('eating his ass was the funniest treat ever!'). We strolled beneath towering green bamboo waterfalls glistening with soft colors, soaking in the laid-back Chengdu atmosphere.\n\nWhile admiring the futuristic Chengdu Twin Towers, I jokingly christened them 'Slimane and Abdenor,' turning the architectural marvel into our own private couple joke. Knowing extreme sub-zero temperatures awaited us in the high alpine valleys, we spent our afternoons shopping for thick thermal parkas and cozy winter gear. On our final night, our alarms went off long before dawn, waking up in the pitch dark to board our tour into the snowy wilderness before sunrise.",
            "highlights": [
                "Panda base date & eating hilarious panda-butt ice cream",
                "Bamboo waterfalls & Chengdu city vibes",
                "Nicknaming Chengdu Twin Towers 'Slimane and Abdenor'",
                "Hunting for heavy thermal snow gear",
                "Pre-dawn winter expedition departure in the dark"
            ],
            "icon": "🐼",
            "cityKey": "chengdu"
        },
        {
            "id": "chap-bipenggou",
            "tag": "12 Jan • Frozen Lake Wonderland",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Bipenggou",
            "location": "Bipenggou, Sichuan ❄️🏔️",
            "title": "Frozen Lake & Our WhatsApp Avatars ❄️⛄",
            "desc": "Our journey rolled deeper into the towering snow-covered mountains, the outside temperature plunging with every kilometer until we arrived at the winter wonderland of Bipenggou. Stepping out into the crisp alpine air, we were greeted by a breathtaking panorama: a vast, crystal-clear frozen lake blankets in pure white snow, surrounded by frosted pine forests and majestic jagged peaks.\n\nWe spent hours playing, laughing, and tossing fresh powder at each other like carefree kids. We took countless photos standing hand in hand across the frozen ice—and what makes Bipenggou uniquely sacred to us is that the photos we took right here by this frozen lake became our official WhatsApp profile pictures to this very day! Every time I glance at my phone, I am instantly transported back to that freezing, joyful winter paradise with my girl.",
            "highlights": [
                "Scenic winter expedition into deep alpine mountains",
                "Massive frozen alpine lake surrounded by snow-draped pines",
                "Our official WhatsApp profile pictures captured right here! 📷",
                "Playful snowball fights and laughing in the fresh powder"
            ],
            "icon": "❄️",
            "cityKey": "bipenggou"
        },
        {
            "id": "chap-dagu",
            "tag": "13 Jan • 5,000m Glacier Summit",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Dagu Glacier",
            "location": "Dagu Glacier, Sichuan 🗻❄️",
            "title": "5,000m Summit & Chalet Warmth 🗻☕",
            "desc": "Boarding the high-altitude cable car, we ascended into the clouds up to 5,000 meters above sea level where the oxygen is thin and every breath feels like an accomplishment. Inside the cabin, we struck up a warm conversation with a sweet traveling couple who shared in our awe.\n\nAt the summit, the glacial cold was intense and piercing. Wanting to give my baby the most beautiful memories, I took off my gloves to operate the phone camera since the touchscreen wouldn't register through thick mittens. By the time I finished taking her photos, my bare fingers were numb and freezing, and the brutal cold combined with the 5,000m altitude brought on severe dizziness. I urged her to hurry inside the mountaintop chalet, where I collapsed beside her, leaning my entire weight against her body to absorb her warmth. Wrapped in her gentle embrace, my dizziness slowly melted away—her presence was the only medicine I needed. Once recovered, my talented baby sat down at the chalet's grand piano, filling the alpine summit with enchanting melodies to show off her incredible musical skills!",
            "highlights": [
                "Cable car ascent to the thin air of the 5,000m glacier summit",
                "Freezing glove-less photoshoot to capture baby's best angles",
                "Leaning completely on baby inside the chalet to thaw and cure dizziness",
                "Baby serenading the mountains on the chalet piano"
            ],
            "icon": "🗻",
            "cityKey": "dagu"
        },
        {
            "id": "chap-jiuzhaigou",
            "tag": "14 Jan • Turquoise Waters & Hotel",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Jiuzhaigou Valley",
            "location": "Jiuzhaigou Valley, Sichuan 🏔️❄️",
            "title": "Sci-Fi Waters & Lucky Boutique Hotel 🏔️✨",
            "desc": "Jiuzhaigou felt like stepping straight into a science-fiction fairy tale. The crystalline water was such an impossible, luminous shade of turquoise that it seemed surreal against the snow-frosted pines and frozen tiered waterfalls.\n\nWe struck pure luck on this leg of our trip: while the rest of the tour group was assigned to a plain, boring hotel, we were blessed to receive a last-minute booking at a gorgeous, cozy boutique hotel reserved exclusively for us! We wandered through the snowy paradise capturing one stunning photo after another, holding hands tightly in the crisp winter air and marveling at nature's artistry with the person who matters most.",
            "highlights": [
                "Unearthly turquoise waters that look like science fiction",
                "Lucky last-minute luxury boutique hotel booking",
                "Snowy fairytale cascades and frozen lake reflections",
                "Inseparable romantic walks in the alpine valley"
            ],
            "icon": "🏔️",
            "cityKey": "jiuzhaigou"
        },
        {
            "id": "chap-huanglong",
            "tag": "15 Jan • Travertine Pools Hike",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Huanglong",
            "location": "Huanglong, Sichuan 🏞️✨",
            "title": "The Never-Ending Boardwalk Hike 🏞️😂",
            "desc": "Trekking up Huanglong's high-altitude terraced travertine pools tested every ounce of our stamina! The endless wooden boardwalk stretched forever into the thin mountain atmosphere. Halfway up, my exhausted baby was ready to surrender and turn back, and truth be told, I was fighting severe altitude dizziness and muscle fatigue myself. But determined to be her rock, I put on my best encouraging smile: 'Come on baby, look, it's right around the corner, we're almost there!'—even though I knew full well the summit was still miles away!\n\nOur strategy turned into comedy: for every five minutes of walking, we had to sit down and rest for ten minutes. Other tourists would hike past us, reach the scenic viewpoint at the top, snap their photos, walk all the way back down, and pass us resting in the exact same spot for the second time! We laughed until our stomachs hurt, proving that even the most grueling mountain climbs are unforgettable when shared with your best friend.",
            "highlights": [
                "High-altitude hike fighting thin air and exhaustion",
                "Cheering baby on with 'We're almost there!' when we totally weren't 😂",
                "Walking 5 minutes and resting 10 minutes",
                "Tourists passing us on the way up and again on the way down!"
            ],
            "icon": "🏞️",
            "cityKey": "huanglong"
        },
        {
            "id": "chap-chengdu-return",
            "tag": "16 Jan • Return to Cozy Chengdu",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Chengdu",
            "location": "Chengdu, Sichuan 🐼💨",
            "title": "Farewell to Tour & Private Didi 🚗💨",
            "desc": "On the final morning of our winter tour, the itinerary called for another scheduled group excursion. But after days of freezing summits and rigid schedules, me and my baby looked at each other and mutually agreed: we had had our fill of crowded group tours and just wanted the comfort of our own peaceful pace.\n\nWe politely asked the tour driver to drop us off along the highway where cars could reach us. We waved a cheerful goodbye to the tour group, hailed a comfortable private ride, and enjoyed a smooth, scenic drive straight back to the warmth of Chengdu, resting our tired feet and relishing our return to freedom.",
            "highlights": [
                "Deciding together to leave the structured group tour early",
                "Bidding farewell to the bus group on the highway",
                "Comfortable private ride back to cozy Chengdu",
                "Relaxing our exhausted feet after days in the snow"
            ],
            "icon": "🚗",
            "cityKey": "chengdu"
        },
        {
            "id": "chap-guangzhou-cozy",
            "tag": "16 — 19 Jan • Cozy Days & Warmth",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Guangzhou",
            "location": "Guangzhou, China ⭐🇨🇳",
            "title": "Cozy Days in Our Favorite City ⭐❤️",
            "desc": "Arriving back in Guangzhou felt like returning home. Of all the metropolises in China, Guangzhou will always be our absolute favorite—it offers the perfect balance of warmth, affordability, endless culinary delights, and the cozy rhythm of life we both adore.\n\nWe spent these peaceful days decompressing from the sub-zero mountains, visiting our go-to food haunts, holding each other close, and savoring everyday domestic bliss before packing our luggage for the tropical paradise of Southeast Asia.",
            "highlights": [
                "Returning to our beloved home base in South China",
                "Guangzhou culinary comfort and familiar city streets",
                "Peaceful, cozy days unwinding from the snowy peaks",
                "Packing our suitcases for Vietnam and Bali"
            ],
            "icon": "⭐",
            "cityKey": "guangzhou"
        },
        {
            "id": "chap-vietnam",
            "tag": "19 Jan • 16h Layover Adventure",
            "country": "Vietnam",
            "countryFlag": "🇻🇳",
            "city": "Hanoi / Saigon Transit",
            "location": "Vietnam (16h Layover) 🇻🇳",
            "title": "4-Pants Restroom Sprint & 16h Layover 🇻🇳🏃‍♂️",
            "desc": "Our journey to Bali included an infamous transit through Vietnam that turned into one of the funniest adventures of our lives. Because I was continuing on to Algeria after Indonesia, our luggage was massively overweight by over 10 kilograms! In a desperate attempt to dodge luggage fees, we stashed our heavy carry-ons near the airport seating and approached the counter with just our light bags. We successfully received our boarding passes, but to our horror, the vigilant check-in agent followed us, confiscated our tickets, and sternly marched us back to the scale!\n\nFacing hefty penalties, we bolted into the family restroom in sweltering 30°C humidity. Sweating profusely, we began piling on clothes like stuffed mannequins—layering four pairs of trousers, five shirts, and two thick winter jackets each, while ditching worn-out garments in the trash! We lost track of time, and when we scrambled back to the counter, the agents gasped: 'You are way too late, run, quick!' Without even checking our weight, they opened the VIP priority lane. We sprinted through security and down the concourse like Olympic athletes, boarding as the very last passengers. The flight attendants and seated passengers watched in utter bewilderment as two puffing, heavily-clothed travelers collapsed into their seats and spent the next twenty minutes peeling off layer after layer of clothing!\n\nLanding in Vietnam, we settled in for a 16-hour layover. We fell in love with the gentle politeness of the Vietnamese people, who respectfully bowed their heads whenever our eyes met (to the point where I looked away just to spare them the trouble!). We slept for six hours across airport benches, enjoyed a morning breakfast together, and booked my ticket from Jakarta to Algeria with peaceful hearts.",
            "highlights": [
                "10kg baggage overweight drama and airport hide-and-seek",
                "Wearing 4 pants, 5 shirts & 2 jackets in 30°C heat!",
                "High-speed sprint through the VIP priority lane to board last",
                "Hilariously stripping off dozens of layers in airplane seats 😂",
                "16-hour layover date with polite, bowing locals",
                "Sleeping 6 hours across terminal chairs & booking flights"
            ],
            "icon": "🇻🇳",
            "cityKey": "vietnam"
        },
        {
            "id": "chap-bali",
            "tag": "20 — 27 Jan • Tropical Villa & ATV",
            "country": "Indonesia",
            "countryFlag": "🇮🇩",
            "city": "Bali",
            "location": "Bali, Indonesia 🌴🏖️",
            "title": "Villa, ATV Trails & Waterbom 🌴🌊",
            "desc": "Arriving in tropical Bali was pure bliss! After picking up local SIM cards, we drove straight to our gorgeous private villa where our friends Rami and Elysia were eagerly awaiting us. Stepping out into the warm island sunshine wearing summer clothes felt heavenly after the freezing China winter.\n\nOur villa pool immediately claimed its first casualty: while diving deep, I scraped my chest and foot against a metal fixture at the bottom ('Why on earth did I swim that low? Am I a fish or what?!'). But nothing could dampen our spirits. We tackled beach watersports on inflatable rafts, went jet skiing across the waves, visited the famous monkey forest temple, and embarked on wild, muddy ATV quad bike trails through the jungle—hands down one of the absolute greatest thrills of my life!\n\nWe shared endless laughter dining on Bebek ('duck', which sounds hilariously close to 'your father' in my Algerian dialect!). A sudden stomach bug left me sick and vomiting for a day; although my sweet baby offered to stay behind, I insisted she visit Nusa Penida with our friends so she wouldn't miss out. Once I recovered two days later, we conquered Waterbom together—an adrenaline-packed waterpark with heart-pounding slides that proved my baby is just as brave and fun-loving as I am!",
            "highlights": [
                "Tropical villa reunion with friends Rami and Elysia",
                "Villa pool mishap ('Am I a fish or what?!' 😂)",
                "Thrilling muddy ATV jungle expedition & jet skiing",
                "Dining on Bebek ('your father' in Algerian)",
                "Conquering wild adrenaline slides at Waterbom waterpark"
            ],
            "icon": "🌴",
            "cityKey": "bali"
        },
        {
            "id": "chap-jakarta",
            "tag": "27 Jan — 6 Feb • Family Home & Tekken",
            "country": "Indonesia",
            "countryFlag": "🇮🇩",
            "city": "Jakarta",
            "location": "Jakarta, Indonesia 🇮🇩🏡",
            "title": "Meeting Lili & Ayung & PS5 Tekken 🏡🎮",
            "desc": "Landing in Jakarta brought the monumental milestone of meeting my baby's wonderful parents, Lili and Ayung! Her father Ayung, though quiet due to the language barrier, welcomed me every day with the warmest 'good mornings' and 'goodnights.' Her mother Lili and I connected deeply—we spent hours engaged in fascinating conversations about psychology, philosophy, and cultural differences; she is such an inquisitive, kind-hearted woman with whom I formed a genuine bond.\n\nMy baby generously gave me my own private room in the house. Out of respect for family etiquette, we spent our days wandering the city together. She introduced me to bustling late-night street food joints where young crowds gather to devour delicious Indomie melted with cheese. We spent countless evenings playing PS5: while she struggled adorably at 'It Takes Two,' she revealed herself to be an absolute demon on Tekken—she pummeled me so mercilessly that I was genuinely terrified of her! ('Baby is scaryyyy!'). Whenever the family headed out to shopping malls, restaurants, or cinema screenings, they warmly brought me along—watching Ayung enjoy the film while Lili drifted asleep, Ella laughed that we are the exact mirror image of her parents.",
            "highlights": [
                "Meeting parents Lili & Ayung & deep psychology discussions with Lili",
                "Late-night street food dates eating savory Indomie with cheese",
                "Getting utterly destroyed by baby at PS5 Tekken! 🥊😂",
                "Being embraced as family during cinema and dinner outings"
            ],
            "icon": "🏡",
            "cityKey": "jakarta"
        },
        {
            "id": "chap-guangzhou-spring",
            "tag": "7 Apr — 25 May • Spring Reunion",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Guangzhou",
            "location": "Guangzhou, China ☕❤️",
            "title": "Canton Fair, Trimmer & Bike Cuddles ☕❤️",
            "desc": "Back in Algeria, the ache of missing my girl was so overwhelming that I convinced my company to sponsor a business trip back to China just in time for the Canton Fair! Reunited at the airport, she welcomed me into her new apartment, and we seamlessly slipped back into our domestic rhythm: watching late-night movies, sharing favorite dishes, playing billiards, and attending the Canton Fair together.\n\nWith her full trust in my driving, I took the handlebars of our electric scooter daily. But my favorite moments were when I pretended to be tired, just so she would drive and I could sit close behind her, wrapping my arms around her waist and burying my face in her shoulder as the evening breeze rushed past. She affectionately groomed my facial hair with her personal trimmer—a habit that became so ingrained I now do it back home in Algeria! She even treated me to my very first full-body massage and professional foot cleaning, spoiling me with pure tenderness.",
            "highlights": [
                "Spring reunion at her new Guangzhou apartment",
                "Scooter rides cuddling behind baby through city streets",
                "Baby grooming my facial hair with her trimmer (now a lifelong habit!)",
                "First professional body massage and foot cleaning",
                "Billiard matches, movie nights, and Canton Fair visits"
            ],
            "icon": "☕",
            "cityKey": "guangzhou"
        },
        {
            "id": "chap-canton-tower-proposal",
            "tag": "23 Apr • Official Proposal 💍",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Canton Tower",
            "location": "Canton Tower, Guangzhou 🗼🌻",
            "title": "Sunflower Seeds Proposal 💍🌻",
            "desc": "On the magical evening of April 23, we returned to the glowing foot of Canton Tower—the very spot where our journey first began. In my heart and soul, she had always been my girlfriend from day one; my loyalty and devotion were hers unconditionally. But I wanted a sacred, unforgettable moment to make our commitment official.\n\nUnder the dazzling tower lights, I officially asked my baby to be my girlfriend forever. As a symbol of our bond, I gifted her two sunflower seeds glued together—an unconventional, playful, yet deeply sacred promise of eternal loyalty, laughter, and unbreakable love.",
            "highlights": [
                "Romantic evening under the glittering lights of Canton Tower",
                "The official proposal at the place where our eyes first met",
                "Two sunflower seeds glued together as our sacred bond of love 🌻",
                "A promise of eternal loyalty and happiness"
            ],
            "icon": "💍",
            "cityKey": "guangzhou"
        },
        {
            "id": "chap-nansha",
            "tag": "25 Apr • Coastal Harbor Adventure",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Nansha Port",
            "location": "Nansha Port, Guangzhou 🚗⚓",
            "title": "First Rental Car & Nansha Port 🚗⚓",
            "desc": "We embarked on our very first road trip adventure by renting a car together! Because she held a Chinese driver's license, she navigated the initial city traffic, but soon handed the steering wheel over to me. Driving down the open highway while she slept peacefully in the passenger seat beside me filled my heart with the sweetest sense of pride and protection.\n\nBefore leaving Guangzhou, we had stopped in Xiaobei to pick up our favorite savory roast chicken, 'Poule d'Or,' which we devoured hungrily once we arrived at Nansha Port. Later that evening, we spotted mysterious searchlights dancing across the night sky; following the beams, we discovered a tranquil, hidden coastal park where local families gathered to enjoy the cool sea air. On our midnight drive back to Guangzhou, we blasted our favorite tunes through the speakers with the windows down, followed by a comical late-night scavenger hunt circling neighborhood blocks until we finally tracked down a parking spot with an available EV charging station!",
            "highlights": [
                "Our very first rental car road trip experience",
                "Baby sleeping peacefully beside me as I drove the highway",
                "Devouring savory Xiaobei 'Poule d'Or' roast chicken by the harbor",
                "Following sky beams to a secret family night park",
                "Late-night EV charger hunting through neighborhood streets"
            ],
            "icon": "🚗",
            "cityKey": "nansha"
        },
        {
            "id": "chap-baiyun",
            "tag": "6 May • Mountain Hike ⛰️",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Baiyun Mountain",
            "location": "Baiyun Mountain, Guangzhou 🌸💐",
            "title": "Wildflower Bouquets on Baiyun Mountain 🌸💐",
            "desc": "We spent a blissful sunny afternoon hiking the lush green trails of Baiyun Mountain in Guangzhou. The vibrant spring nature brought out the playful child in me: whenever I spotted a blooming wildflower along the mountainside, I would dash off the path to gently pluck it, carefully assembling a handmade wildflower bouquet petal by petal.\n\nPresenting the colorful bouquet to my baby and watching her face light up with the sweetest, most genuine smile was pure heaven. Simple moments like this reminded me that true romance isn't found in extravagance, but in the effortless joy of making your favorite person smile.",
            "highlights": [
                "Peaceful spring hike across lush Baiyun Mountain",
                "Running like an excited kid to pick vibrant wildflowers",
                "Handcrafted wildflower bouquet presented to baby",
                "Her unforgettable glowing smile on the mountainside"
            ],
            "icon": "🌸",
            "cityKey": "guangzhou"
        },
        {
            "id": "chap-wuhan",
            "tag": "17 — 19 May • Ancient Temple & Bikes",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Wuhan",
            "location": "Wuhan, China 🌸🚲",
            "title": "Ancient Temple Animation & Bikes 🌸🚲",
            "desc": "As part of my business trip towards Shanghai, we made a scenic stop in peaceful Wuhan to explore the city hand in hand. We rented shared bicycles and spent hours pedaling through quiet streets, arriving at a majestic ancient temple where an innovative animated light show brought centuries of heritage to life before our eyes.\n\nThe following afternoon, we strolled through historic European-style concession avenues lined with vintage architecture, taking dozens of romantic photos. We had originally planned to ride Wuhan's famous futuristic suspended monorail, but realizing it would take us far out of our way when we were already famished and tired, we happily ditched the plan in favor of a comforting, delicious dinner—proving good food and relaxation always win!",
            "highlights": [
                "Cycling through peaceful Wuhan streets on rented bikes",
                "Grand ancient Buddhist temple with animated light projection",
                "Romantic photoshoot amidst historic European-style architecture",
                "Prioritizing cozy food and cuddles over the far-away monorail"
            ],
            "icon": "🌸",
            "cityKey": "wuhan"
        },
        {
            "id": "chap-nanjing",
            "tag": "19 May • Buddha Mountain & Pupu",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Nanjing",
            "location": "Nanjing, China 🛕💩",
            "title": "Rainy Buddha Mountain & Legendary Pupu 🛕💩",
            "desc": "Arriving in Nanjing, we were captivated by the city's modern infrastructure rooted in ancient imperial history. We journeyed up the misty, rain-soaked peak of Niushoushan to visit its magnificent subterranean Buddha palace. Stepping inside felt otherworldly—thousands upon thousands of ornate golden Buddha statues glowing in cavernous halls, culminating in a colossal, serene reclining Buddha.\n\nOur visit was marked by two hilarious, unforgettable memories: first, a tour group of elderly Chinese locals were so astonished to see a foreigner in their midst that they pulled out their smartphones and began filming me openly without asking! What started as initial confusion quickly dissolved into heartwarming, shared laughter. And second, Nanjing gifted us what we affectionately christened the greatest, most legendary public toilet 'pupu' of our entire lives! As someone who adamantly refuses to ever use public restrooms, that fateful shared moment broke all records and became an inside joke immortalized in our love story forever!",
            "highlights": [
                "Misty mountain trek to the breathtaking Niushoushan Buddha palace",
                "Thousands of golden miniature Buddhas & giant sleeping Buddha",
                "Elderly locals curiously filming the foreigner on their phones 😂",
                "The most legendary public toilet 'pupu' in couple history!"
            ],
            "icon": "🛕",
            "cityKey": "nanjing"
        },
        {
            "id": "chap-shanghai",
            "tag": "19 — 23 May • Machinery & Turkish Feast",
            "country": "China",
            "countryFlag": "🇨🇳",
            "city": "Shanghai",
            "location": "Shanghai, China 🌃🍽️",
            "title": "Machinery Inspection & Turkish Feast 🌃🍽️",
            "desc": "We arrived in Shanghai, where we were warmly greeted by Ye Jing, her boss, and her wonderful driver, who picked us up to inspect factory machinery crucial for my business. After a productive workday, my baby enthusiastically insisted that Ye Jing take us to the most famous, upscale Turkish restaurant in Shanghai. The feast was lavish and expensive; while our polite Chinese hosts barely touched the foreign dishes, they beamed watching me savor every authentic bite with genuine delight!\n\nOur Shanghai stay wasn't without unexpected drama: when currency exchange hurdles caused a temporary financial snag, I reached out to several Chinese suppliers for a brief loan. Every single one hesitated, but none was funnier than Frank, who dramatically accused me of being a 'clever cheater' despite my piles of official documentation and bank proof! We sorted the issue out, but we still laugh at the absurdity of Frank's words. Our final metro ride heading toward Shanghai Hongqiao Airport was deeply bittersweet—knowing our time in China was drawing to a close and months of long-distance were looming on the horizon.",
            "highlights": [
                "Factory machinery inspection with Ye Jing and her welcoming team",
                "Lavish Turkish restaurant feast in the heart of Shanghai",
                "Supplier loan drama with Frank calling me a 'clever cheater' 😂",
                "Exploring iconic Shanghai streets and skyline",
                "Bittersweet metro ride to the airport facing impending distance"
            ],
            "icon": "🌃",
            "cityKey": "shanghai"
        },
        {
            "id": "chap-guangzhou-farewell",
            "tag": "23 — 25 May • Farewell & Return to Algeria 🇩🇿",
            "country": "China ➔ Algeria",
            "countryFlag": "🇨🇳 ➔ 🇩🇿",
            "city": "Guangzhou ➔ Algeria",
            "location": "Guangzhou, China ➔ Flight Home to Algeria 🇩🇿",
            "title": "Guangzhou Farewell & Flight Back to Algeria ✈️🇩🇿",
            "desc": "We dedicated our final 48 hours in Guangzhou to cherishing every fleeting second together before my flight back home to Algeria. On our second-to-last day, my baby led me around the corner and introduced me to an unbelievable little local eatery serving mouth-watering, gourmet-quality food for astonishingly cheap prices—located just 50 meters from our doorstep!\n\nI stared at her in pure disbelief: 'Why on earth did you wait until our very last day to bring me to this paradise?!' She burst into her signature laugh: 'Because this place closes early in the evening, and we always wake up late and only wander out at 2:00 AM!' As always, her logic was airtight and flawless which means she's always right.\n\nOur departure at Guangzhou Baiyun Airport on May 25 was deeply emotional and tearful. Unlike our Indonesian trip back in February, this time I flew directly back home to Algeria 🇩🇿, while my baby remained in China for one more month before later returning home to Jakarta 🇮🇩. In the airport concourse, we held each other tight until the very last boarding call, fixing her plumbing one final time before leaving, and exchanging tearful promises that no distance across oceans could ever weaken our love.",
            "highlights": [
                "Cherishing our final 48 hours in Guangzhou before my flight to Algeria 🇩🇿",
                "Discovering the secret delicious 50-meter neighborhood gem",
                "'Why wait till today?!' 'Because we wake up late and go out at 2 AM!' 😂",
                "May 25: Flight back home to Algeria 🇩🇿 (baby staying 1 more month in China)",
                "Tearful airport goodbye, last apartment fixes & infinite promises"
            ],
            "icon": "⭐",
            "cityKey": "guangzhou"
        },
        {
            "id": "chap-ldr",
            "tag": "Today & Forever • 10,000+ km",
            "country": "Algeria ⟷ Indonesia",
            "countryFlag": "🇩🇿 ⟷ 🇮🇩",
            "city": "Algiers ⟷ Jakarta",
            "location": "Algeria 🇩🇿 ⟷ Jakarta 🇮🇩",
            "title": "Algeria ⟷ Jakarta: Forever Bond ✈️💍",
            "desc": "Though oceans, continents, and over 10,000 kilometers separate Algeria and Indonesia, our love bridges the distance effortlessly. Ever since my flight back to Algeria and your later return to Jakarta after China, we spend our days connected through sweet good-morning texts, late-night FaceTime calls where we fall asleep together with the screen glowing, and counting down to our next flight reunion.\n\nEvery single travel memory—from the 7 hours talking at Canton Tower to the frozen summits of Sichuan, from 4 pants in Vietnam to our warm family days in Jakarta back in February—is etched into the foundation of our forever. Distance means nothing when you mean everything to me. I lof you quintillions and infinite, my princess!",
            "highlights": [
                "Endless FaceTime sleep calls and daily good morning messages",
                "Overcoming 10,000+ km between Algeria and Jakarta with unwavering loyalty",
                "Counting down the days to our next airport arrival hug",
                "I lof you this much: Quintillions, Infinite & Forever! 💖"
            ],
            "icon": "💍",
            "cityKey": "algeria"
        }
    ]
  },
  map: {
    tag: "Our Real World Travels & Cities",
    title: "Interactive Story Roadmap & World Map 🗺️",
    desc: "From our 17h Vietnam transit to Bali beaches, Jakarta home days, and all our China city expeditions!",
    totalKm: "80,750+ km",
    totalCountries: "3 Countries",
    totalCities: "15 Global Cities Visited",
    earthLaps: "2× Around Earth"
  },
  truth_dare: {
    tag: "High-Stakes Couple's Duel 🎭",
    title: "Truth or Dare: 100% Fair & Square ⚖️",
    desc: "Best of 3 games between Ela and Aghiles. Spin the bottle of destiny! (Algorithm verified by Aghiles 😏)",
    rigMode: "p1_rigged",
    bottleStyle: "wine",
    spinDuration: "2.8",
    showConfession: true,
    p1Name: "Aghiles",
    p2Name: "Ela",
    p1Title: "Mastermind 👑",
    p2Title: "Princess 👸🏻",
    p1Avatar: "🇩🇿👑",
    p2Avatar: "🇮🇩👸🏻",
    p1Flag: "🇩🇿",
    p2Flag: "🇮🇩",
    p1WinsLabel: "Aghiles Wins",
    p2WinsLabel: "Ela Wins",
    r1Header: "👑 Aghiles Chose: TRUTH!",
    r1Prompt: "Do you really lof someone called Aghiles, who lives in Algeria?",
    r1YesText: "Yes, I really lof him with all my heart! ❤️🥰",
    r1NoText: "No, who is that? 😜",
    r1Feedback: "<strong>Aghiles:</strong> \"Hehehe I knew it! Correct answer! 🥰 But I'm still up 1 - 0!\"",
    r2Header: "👑 Aghiles Chose: DARE!",
    r2Prompt: "If your previous answer was yes, send him a message on WhatsApp tell him: 'Yes i really lof someone from algeria'",
    r2WaText: "Yes i really lof someone from algeria",
    r2WaPhone: "",
    r2WaBtnText: "📱 Send WhatsApp Dare to Aghiles",
    r2DoneText: "I sent it! (Or promised to!) 😇💌",
    r2Feedback: "<strong>Aghiles's WhatsApp is buzzing! 📲🇩🇿</strong> Dare completed! Ready for Game 3?",
    r3Header: "👑 Aghiles Chose: TRUTH!",
    r3Confession: "I cheated that is why you lost for a third time, oops... you were supposed to say the truth not me! omg you cheat too?",
    r3Author: "— Confession by Aghiles 🇩🇿😏",
    r3Prompt: "How does Ela plead to this outrageous confession?",
    r3Reactions: [
      "\"I KNEW IT!! You big cheater!! 😂🥊\"",
      "\"OMG you caught me... I cheat too! 🙈🤫\"",
      "\"I demand infinite kisses and hugs as compensation! 💋🤗\""
    ],
    p2R1Prompt: "What was the exact millisecond you realized you fell head-over-heels in love with Ela?",
    p2R1Opt1: "From the very first conversation! 💘",
    p2R1Opt2: "Every single day even more and more! 🥰",
    p2R1Feedback: "<strong>Ela:</strong> \"Awww! That is 100% the right answer! Point 1 goes to the Queen! 👑💅\"",
    p2R2Prompt: "Dare for Aghiles: Send a 10-second cute voice message or selfie with your biggest smile right now!",
    p2R2DoneText: "Dare Accepted & Done! 🫡💖",
    p2R2Feedback: "<strong>Ela's heart just melted! 💖</strong> Dare fulfilled! Ready for Game 3?",
    p2R3Prompt: "Ela takes Round 3! How does Aghiles bow to the reigning champion?",
    verdictTitle: "🏆 Official Verdict: Rigged by Love! ❤️",
    verdictDesc: "Aghiles may have swept 3 - 0, but <strong>Ela wins his entire heart 10,000% forever</strong> across every kilometer between Algeria and Indonesia! 🇩🇿✈️🇮🇩",
    p2VerdictTitle: "👑 Official Verdict: Ela Reigns Supreme! 👸🏻",
    p2VerdictDesc: "Ela takes the crown! Undisputed queen of our hearts, ruling with love across every kilometer! 💖✨",
    rounds: [
      { round: 1, type: "TRUTH", header: "👑 Aghiles Chose: TRUTH!", prompt: "Do you really lof someone called Aghiles, who lives in Algeria?" },
      { round: 2, type: "DARE", header: "👑 Aghiles Chose: DARE!", prompt: "If your previous answer was yes, send him a message on WhatsApp tell him: 'Yes i really lof someone from algeria'" },
      { round: 3, type: "TRUTH", header: "👑 Aghiles Chose: TRUTH!", prompt: "I cheated that is why you lost for a third time, oops... you were supposed to say the truth not me! omg you cheat too?" }
    ]
  },
  spinner: {
    tag: "Long Distance & Virtual Dates",
    title: "Long-Distance Date Night Spinner 🎡",
    desc: "Spin the reels to pick our next virtual date night—bridging Algeria and Jakarta with lof!",
    reel1Label: "🍽️ Virtual Dinner / Food",
    reel2Label: "🎮 Long-Distance Activity",
    reel3Label: "🍨 Sweet Treat",
    foods: [
      "🍕 Cheesy Local Pizza & Fries Night",
      "🍜 Cozy Indomie / Ramen Battle with Custom Toppings",
      "🌮 Favorite Local Fast Food (Algerian Tacos / Indo Street Eats)",
      "🍝 Cook the Same Pasta Recipe Live on Video",
      "🍔 Late-Night Comfort Burger & Soda",
      "🍳 Breakfast-for-Dinner Video Call (Time-Zone Match)"
    ],
    activities: [
      "🎬 Synced Movie Night (Teleparty / Discord) & FaceTime Sleep Call",
      "✈️ Planning Our Next Flight Reunion & Hotel Wishlist",
      "🎮 Cozy Online Gaming (Roblox / Plato / Sky / 8 Ball Pool)",
      "🎨 Virtual Drawing / Skribbl.io Doodle Duel",
      "🌌 Late-Night FaceTime Call with Spotify Jam & Lofi",
      "🗺️ Virtual Google Earth Tour of Spots We Want to Visit"
    ],
    desserts: [
      "🥞 Warm Crepes or Waffles with Nutella",
      "🍦 Ice Cream Sundae or Local Gelato Treat",
      "🍫 Favorite Chocolate Bar & Hot Cocoa",
      "🍰 Local Patisserie Treat (Cake Slice or Millefeuille)",
      "☕ Fresh Mint Tea / Warm Coffee & Biscuits",
      "🍓 Fresh Fruit Bowl with Melted Chocolate"
    ],
    phone: "",
    spinBtnText: "Spin Date Idea! 🎲",
    lockBtnText: "Lock In Date & Claim Pass 🎟️",
    shareWhatsAppBtnText: "📲 Send Date to Boyfriend on WhatsApp 💬",
    lockAlertText: "It's a date! Screenshot this and send it to me! 💕"
  },
  memories: {
    tag: "Captured Memories",
    title: "Our Favorite Moments 📷",
    desc: "Snapshots of our laughter, late-night talks, warm hugs, and infinite love. ✨",
    addBtnText: "📷 Add Our Photo / Video Memory",
    items: [
      {
        id: "mem-1",
        title: "Where We Met in China 🇨🇳 (Sept 17)",
        desc: "The magical moment our eyes first met on Sept 17. 12 unforgettable days filled with sweet smiles, late-night walks, and dim sum breakfasts!",
        img: "images/mem-1.jpg"
      },
      {
        id: "mem-2",
        title: "Reunion in China ✈️ (Dec 10)",
        desc: "Counting every single hour in Algeria until Dec 10, when I finally landed back in China and held you tight in my arms at the airport.",
        img: "images/mem-2.jpg"
      },
      {
        id: "mem-3",
        title: "Dream Vacation in Bali 🌴 (Jan 19)",
        desc: "Golden tropical beach sunsets, holding hands along the warm sand, drinking fresh coconuts, and falling more in lof every second.",
        img: "images/mem-3.jpg"
      },
      {
        id: "mem-4",
        title: "At Your Home in Jakarta 🇮🇩 (Jan 26 - Feb 7)",
        desc: "Staying at your home in Jakarta, meeting your lovely family, tasting home-cooked meals, and infinite morning cuddles with you.",
        img: "images/mem-4.jpg"
      },
      {
        id: "mem-5",
        title: "Spring in China Together 🌸 (Apr 7 - May 25)",
        desc: "Nearly two whole months traveling across China hand-in-hand—spring blossoms, cozy cafe dates, and making memories to last forever.",
        img: "images/mem-5.jpg"
      }
    ]
  },
  coupons: {
    tag: "Special Birthday Keepsakes",
    title: "Sweet Lof & Birthday Coupons 🎟️🎂",
    desc: "Scratch with your finger or mouse to reveal your special treat! No expiration date.",
    restartBtnText: "🔄 Restart from 0",
    items: [
      {
        id: "c0",
        icon: "🎂",
        badge: "Birthday Special",
        title: "Birthday Queen Wish Grant",
        sub: "Whatever my princess Ella wishes for on her birthday—granted unconditionally with infinite lof! 💖"
      },
      {
        id: "c1",
        icon: "🌴",
        badge: "Travel Pass",
        title: "Next Dream Trip Together",
        sub: "You pick where we fly next—all booked and planned with lof!"
      },
      {
        id: "c2",
        icon: "🍲",
        badge: "Foodie Pass",
        title: "Virtual Dinner Date Together",
        sub: "We cook or grab our comfort food and eat together on FaceTime!"
      },
      {
        id: "c3",
        icon: "💆‍♀️",
        badge: "Spa Pass",
        title: "30-Min Relaxation Massage",
        sub: "Redeemable for head, back, or shoulder massage anytime"
      },
      {
        id: "c4",
        icon: "🎬",
        badge: "Cinema VIP",
        title: "Long-Distance Movie Night",
        sub: "Synced movie call with unlimited snacks & FaceTime cuddles"
      },
      {
        id: "c5",
        icon: "💋",
        badge: "Kiss Pass",
        title: "1,000,000 Kiss Kiss Voucher",
        sub: "Sent from Jakarta to Algeria with infinite lof"
      }
    ]
  },
  boarding_pass: {
    tag: "✈️ Where Are We Flying Next?",
    title: "Our Next Dream Adventure & Boarding Pass 🌍💍",
    desc: "Pick your dream destination below to generate your official First Class Boarding Pass!",
    selectorLabel: "Select Our Next Dream Escape:",
    customPlaceholder: "Or type any other dream city in the world (e.g. Paris, Iceland, Turkey)...",
    airline: "INFINITE LOF AIRWAYS",
    flightClass: "FIRST CLASS VIP 💕",
    departureCode: "ALG / CGK",
    departureName: "Algiers & Jakarta",
    durationTag: "NON-STOP LOF",
    seat: "1A (Beside Me Forever)",
    flightNumber: "LOF-999",
    status: "RESERVED FOR TWO 🎟️✨",
    barcode: "ETKT 999 2847 1928 4032 0 • FIRST CLASS VIP",
    claimBtnText: "✈️ Lock In & Confirm Flight Wish! 💖",
    downloadBtnText: "📥 Save Ticket (PNG) 🎟️",
    whatsAppBtnText: "📲 Send Wish on WhatsApp 💬",
    confirmedNotice: "🎉 Trip Wish Officially Stamped! Pack your bags baby, our next adventure is waiting! ✈️💖",
    destinations: [
      { name: "Japan", code: "TYO", title: "Japan 🇯🇵 (Tokyo & Kyoto Cherry Blossom Date)", quote: "Walking under pink cherry blossoms in Kyoto & eating authentic ramen in Tokyo together!", label: "🌸 Japan (TYO)" },
      { name: "Turkey", code: "IST", title: "Turkey 🇹🇷 (Istanbul Bosphorus & Cappadocia)", quote: "Hot air balloons floating over Cappadocia at sunrise & sunset cruises across the Bosphorus in Istanbul!", label: "🇹🇷 Turkey (IST)" },
      { name: "Azerbaijan", code: "GYD", title: "Azerbaijan 🇦🇿 (Baku Caspian & Flame Towers)", quote: "Walking along the sparkling Baku Caspian boulevard, glowing Flame Towers at night, and authentic tea together!", label: "🇦🇿 Azerbaijan (GYD)" },
      { name: "Algeria", code: "ALG", title: "Algeria 🇩🇿 (Algiers Mediterranean Coast & Home Welcome)", quote: "Showing you my home country, Mediterranean beaches, and the most delicious family welcome feast!", label: "🇩🇿 Algeria (ALG)" },
      { name: "Switzerland", code: "ZRH", title: "Switzerland 🇨🇭 (Alpine Peaks & Glacier Express Train)", quote: "Cozy alpine chalets, snowy mountains, and scenic panoramic trains across the Swiss Alps!", label: "🏔️ Switzerland (ZRH)" },
      { name: "Maldives", code: "MLE", title: "Maldives 🇲🇻 (Overwater Bungalow Sunset Villa)", quote: "Clear turquoise water right beneath our private bungalow, romantic sunset dinners on the beach!", label: "🏝️ Maldives (MLE)" },
      { name: "China", code: "CAN", title: "China 🇨🇳 (Guangzhou Reunion & Canton Tower Lights)", quote: "Back to where our story started: Canton Tower night walks, shared bike sprints, and endless halal buffet!", label: "🇨🇳 China (CAN)" },
      { name: "Bali", code: "DPS", title: "Bali 🌴 (Back to Our Favorite Beaches & Sunsets)", quote: "Fresh coconuts, warm ocean breeze, and watching the golden sunset hold hands along the sand!", label: "🌴 Bali (DPS)" }
    ]
  },
  quiz: {
    tag: "Couples Trivia Challenge",
    title: "How Well Do You Know Our Lof Story? 🧠💖",
    desc: "Answer sweet questions about our trips and memories to earn your Certificate of Infinite Lof!",
    certTitle: "Certificate of Infinite Lof",
    certAwardee: "This prestigious lifelong honor is officially presented to",
    certTitleQuote: "« The Greatest & Prettiest Girlfriend in the Entire Universe »",
    certBody: "For scoring a perfect 100% on the Couple Trivia Challenge and holding the eternal title of",
    certBody2: "Valid across Algeria, China, Indonesia, and throughout all infinity with unlimited hug hugs & kissies.",
    certFooter: "Signed with Kiss Kiss & Hug Hug,",
    certSender: "Your Love from Algeria",
    items: [
      {
        q: "Where did we spend 7 hours talking non-stop on our very first night in Guangzhou?",
        options: [
          "Inside a coffee shop in Tianhe",
          "In front of Canton Tower",
          "At Baiyun Airport terminal",
          "On a Pearl River cruise boat"
        ],
        correct: 1,
        comment: "We sat in front of Canton Tower and talked for 7 hours non-stop through the night until the sun had already risen!"
      },
      {
        q: "What birthday gift did you surprise me with at your apartment on December 10?",
        options: [
          "A warm winter coat",
          "A customized photo album",
          "A perfume",
          "A wristwatch"
        ],
        correct: 2,
        comment: "Right when we arrived at your apartment after endless hugs and kisses, you offered me the exact perfume I wanted!"
      },
      {
        q: "When you got your period in Shenzhen, what pad size was I looking for at the pharmacy?",
        options: [
          "350mm",
          "280mm",
          "500mm",
          "420mm"
        ],
        correct: 3,
        comment: "I went outside searching for 420mm pads, and the pharmacist woman smiled so warmly when I asked for my girlfriend!"
      },
      {
        q: "What skyscraper thrill did we do together high above Chongqing?",
        options: [
          "Walking on a narrow metal bar held by a cable",
          "Bungee jumping off the Yangtze bridge",
          "Riding a rooftop zipline across towers",
          "Sliding down an open-air glass slide"
        ],
        correct: 0,
        comment: "We walked on an open metal bar in the sky with only a cable holding us—crazy adrenaline together!"
      },
      {
        q: "At 5,000 meters on freezing Dagu Glacier, how did I get rid of my dizziness and cold in the chalet?",
        options: [
          "Drinking hot herbal tea by the heater",
          "Leaning completely on you for your warmth",
          "Using a portable oxygen canister",
          "Doing quick stretches by the window"
        ],
        correct: 1,
        comment: "Taking photos without gloves left me dizzy and frozen, but leaning completely on you warmed me right back up. Then you played the piano for me!"
      },
      {
        q: "How did we avoid the 10kg+ excess baggage fee during our Vietnam transit?",
        options: [
          "We shipped excess items by post",
          "We left behind our heavy winter boots",
          "We layered on 4 pants, 5 shirts, and 2 jackets each",
          "We paid the excess baggage fee at the counter"
        ],
        correct: 2,
        comment: "In 30°C heat inside the family toilet, we put on 4 pants, 5 shirts, and 2 jackets each, then sprinted through the airport to catch the flight!"
      },
      {
        q: "Why did we burst out laughing when ordering 'Bebek' (duck) in Bali?",
        options: [
          "It means 'your father' in Algerian Arabic",
          "A monkey tried to grab it from the table",
          "The dish was served flaming on fire",
          "The waiter thought we were ordering baby food"
        ],
        correct: 0,
        comment: "In Algerian Arabic 'bebek' means 'your father'—we couldn't stop laughing when we realized it!"
      },
      {
        q: "When playing PS5 together in Jakarta, which game were you unbeatable at?",
        options: [
          "It Takes Two",
          "EA Sports FC",
          "Tekken",
          "Mortal Kombat"
        ],
        correct: 2,
        comment: "You struggled with It Takes Two, but on Tekken you kicked my butt so hard I was genuinely scared of you!"
      },
      {
        q: "On April 23 in front of Canton Tower, what did I give you to officially ask you to be my girlfriend?",
        options: [
          "A silver promise ring",
          "A bouquet of Baiyun mountain flowers",
          "A love lock with our initials",
          "Two sunflower seeds"
        ],
        correct: 3,
        comment: "I gave you two sunflower seeds as our special bond to make it official forever in front of Canton Tower."
      },
      {
        q: "At the mountaintop Buddha temple in Nanjing, what unforgettable moment did we share?",
        options: [
          "The greatest public poop of our lives",
          "Accidentally joining a monk meditation",
          "Getting locked inside after hours",
          "Losing our train tickets at the peak"
        ],
        correct: 0,
        comment: "After climbing the mountain in the rain, we shared the cleanest and most legendary public poop of our lives!"
      }
    ]
  },
  letter: {
    tag: "Straight From My Heart • Birthday Edition",
    title: "A Birthday Love Letter For You 📜🎂",
    seal: "💌",
    envelopeBadge: "👑 For My Princess Ella",
    envelopeTitle: "A Birthday Love Letter 🎂",
    envelopeSub: "Sealed with infinite love, kissies & romantic voice reading",
    openBtnText: "💌 Break Seal & Open Letter",
    envelopeHint: "✨ Tap the sealed envelope to break the seal, open your letter, and listen to my voice ❤️",
    dateDisplay: "Today & Always",
    salutation: "Dearest",
    recipient: "Ella",
    closingPhrase: "Forever and always, with infinite kiss kiss & hug hug,",
    sender: "Your Love from Algeria ❤️",
    audioUrl: "audio/letter_voice-volume-adjusted.m4r",
    body: "Dearest Ella,\n\nFirst of all, I want to say happy birthday to you, my sweetheart, my lof, my lovf, my lofv, my log, my every sweet word. I wish you the best, great fortune, so much love, and more memories with me for the years to come.\n\nI want to say that I am so happy you crossed my life. Meeting you was truly something I never thought of, and it completely changed my life. I am so thankful and grateful for this.\n\nWe shared so many great memories together. Even if we have some bad moments, they're just moments, not memories, so we forget them easily and move on because our love is stronger, powerful, and our hearts are pure and white.\n\nDuring our time together, we had the chance to travel to many places and try various things. God has created so many beauties in this world, and with you, I want to see them all.\n\nI am running out of ink, so my last words to you are that my bebe i lofe you, I miss you, I adore you, and I crave you.\n\nHuuuum Huummmm Monchichi Monchichi Huuuum"
  },
  playful: {
    icon: "🙈",
    title: "Quick Question for You...",
    question: "Do you lof lof me as much as I lof lof you?",
    yesText: "YES! 1000% Lof Lof ❤️",
    noText: "No 😜",
    teasingQuotes: [
      "Nice try, but you're legally stuck with me forever! 💍😜",
      "Error 404: 'No' button disconnected! 💖",
      "Your fingers slipped! Tap the giant shiny YES! 🥰",
      "There is NO escaping my kissies and hugs! 🤗💋",
      "PUPU alert! The NO button ran away to Nanjing! 💩🛕",
      "Resistance is futile, sweetheart! I lof you too much! 💕",
      "Look how big the YES button is becoming! Just tap it! ✨"
    ],
    vanishQuote: "PUPU ALERT! 💩 The 'No' button gave up and vanished! Tap YES! 💖",
    celebrationEmoji: "🥰🎉💖",
    celebrationTitle: "I Knew It!",
    celebrationBody: "You're stuck with your Algerian boy forever and ever! Sending you a million kiss kiss and hug hug right now! 💋🤗",
    celebrationBtnText: "Yaaay! Lof Lof! 🥰"
  },
  candle_blowout: {
    tag: "Make a Birthday Wish 🎂",
    title: "Blow Out the Birthday Candles, Ella! ✨",
    desc: "Make a secret wish in your heart, then tap to blow or blow directly into your microphone!",
    candleCount: 5,
    wishBadge: "🌟 Secret Wish Unlocked",
    wishTitle: "Your Birthday Wish is Coming True!",
    wishText: "May this year bring you boundless happiness, thrilling adventures, and all the love in the universe! 💖",
    clickBtnText: "💨 Blow Candles (Click)",
    micBtnText: "🎙️ Blow via Mic",
    relightBtnText: "🔥 Relight Candles"
  },
  milestone_stats: {
    tag: "Milestone Life Counter ⏳",
    title: "Every Single Second Alive, Ella ❤️",
    desc: "A live ticking celebration of the seconds, heartbeats, and memories you bring into this universe.",
    birthDate: "2000-01-01T00:00",
    metrics: [
      { id: "heartbeats", icon: "💓", title: "Heartbeats", desc: "Beating with love & vitality (~103k/day)", factor: 103680 },
      { id: "coffee", icon: "☕", title: "Cups of Coffee & Tea", desc: "Fueling sweet mornings & late smiles", factor: 1.6 },
      { id: "solar", icon: "🌍", title: "Trips Around the Sun", desc: "Completed solar orbits celebrating your life", factor: 0.00273785 },
      { id: "dreams", icon: "💤", title: "Hours of Sweet Dreams", desc: "Restful sleep & imagining bright futures", factor: 8 },
      { id: "laughs", icon: "😂", title: "Laughs & Giggles", desc: "Shared moments of pure unadulterated joy", factor: 14 },
      { id: "distance", icon: "✈️", title: "Kilometers Traveled", desc: "Journeying across this planet with wonder", factor: 11 }
    ]
  },
  gift_unboxer: {
    tag: "Birthday Unwrapping 🎁",
    title: "A Surprise Gift For You, Ella!",
    desc: "Untie the golden ribbon and lift the lid to reveal what is waiting inside for you.",
    surpriseType: "coupon",
    surpriseBadge: "🎉 Special Birthday Surprise",
    surpriseTitle: "VIP Birthday Pass: All-Expenses Date & Dinner 🥂",
    surpriseDesc: "Valid anytime, anywhere! Pack your favorite outfit for a five-star dining celebration & shopping spree.",
    mediaUrl: "",
    claimBtnText: "Claim My Birthday Gift 🎟️",
    claimUrl: ""
  },
  roast_toast: {
    tag: "Roast or Toast 🎲",
    title: "The Roast & Toast Birthday Spinner 🥂🔥",
    desc: "Spin the wheel! Will you get a playful roast or a heartfelt sentimental toast?",
    spinBtnText: "Spin the Wheel! 🎯",
    roasts: [
      "🔥 Takes 45 minutes to get ready, then claims you are the one running late!",
      "🔥 Always 'just resting their eyes' 5 minutes into a movie you picked.",
      "🔥 Said 'I am not hungry' but finished half of your french fries!",
      "🔥 Has 87 open browser tabs and refuses to close a single one."
    ],
    toasts: [
      "🥂 The kindest, most radiant soul in every single room you enter.",
      "🥂 Cheers to the person who makes the ordinary moments feel like magic.",
      "🥂 Aging like the finest champagne—more breathtaking with every year.",
      "🥂 To your boundless generosity, infectious laugh, and golden heart."
    ]
  },
  guestbook: {
    tag: "Birthday Guestbook 💌",
    title: "Warm Wishes Wall for Ella 📌",
    desc: "Leave a heartfelt sticky note, post your photo, or share your sweetest memory!",
    addBtnText: "✍️ Pin a Birthday Wish",
    notes: [
      { id: "note-1", author: "Aghiles", relation: "Partner ❤️", note: "Happy Birthday my sweetest princess! You illuminate my whole life with your laugh and love.", color: "pink", sticker: "💖" },
      { id: "note-2", author: "Maya", relation: "Best Friend 🌸", note: "Happy 24th birthday bff! May all your wildest dreams come true this year!", color: "yellow", sticker: "🎉" },
      { id: "note-3", author: "Leo", relation: "Family 🌟", note: "Wishing you radiant health, peace, and endless joy. So proud of everything you do!", color: "blue", sticker: "🎂" }
    ]
  },
  party_jukebox: {
    tag: "Birthday Soundtrack 🎵",
    title: "Party Jukebox & Playlist 📻",
    desc: "Spin the retro vinyl disc, pump up the volume, and groove to our birthday playlist!",
    tracks: [
      { title: "Celebration Jam", artist: "Kool & The Gang", url: "audio/taylor-swift-fate-of-ophelia.m4r", duration: "3:42" },
      { title: "Birthday Anthem", artist: "Sweet Melody", url: "audio/lady-gaga-always-remember-us-this-way.m4r", duration: "3:30" },
      { title: "Dancing Queen Vibes", artist: "Party Beats", url: "audio/imagine-dragons-i-follow-you.m4r", duration: "3:51" }
    ]
  }
};

async function initDb() {
  try {
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("PG Connection Timeout")), 1500))
    ]);
    isPgConnected = true;
    client.release();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY,
        slug VARCHAR(64) UNIQUE NOT NULL,
        partner1_name VARCHAR(128),
        partner2_name VARCHAR(128),
        admin_pin VARCHAR(64) NOT NULL,
        customer_email VARCHAR(255),
        is_purchased BOOLEAN DEFAULT true,
        plan VARCHAR(32) DEFAULT 'vip',
        auth_token VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_configs (
        tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
        template_preset VARCHAR(32) NOT NULL DEFAULT 'complete',
        theme_id VARCHAR(32) NOT NULL DEFAULT 'romantic-rose',
        layout_order JSONB NOT NULL,
        sections_data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(128),
        password_hash VARCHAR(256) NOT NULL,
        salt VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        token VARCHAR(64) PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        tenant_slug VARCHAR(64) NOT NULL,
        plan VARCHAR(32) DEFAULT 'vip',
        amount NUMERIC(10,2) NOT NULL,
        currency VARCHAR(8) DEFAULT 'USD',
        status VARCHAR(32) DEFAULT 'completed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);

      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_purchased BOOLEAN DEFAULT true;
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan VARCHAR(32) DEFAULT 'vip';
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS auth_token VARCHAR(64);
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    `);
  } catch (err) {
    isPgConnected = false;
    console.log("ℹ️ PostgreSQL not active (" + err.message + "). Using persistent local file storage: data/couple_saas.json");
  }

  // Seed default tenant: demo
  const existing = await getTenantBySlug("demo");
  if (!existing) {
    await createTenant({
      slug: "demo",
      partner1: "Alex",
      partner2: "Sam",
      adminPin: "1234",
      preset: "complete",
      plan: "vip",
      isPurchased: true
    });
    console.log("✓ Seeded default tenant: 'demo' (PIN: 1234)");
  }

  // Seed default admin user: admin@admin.com
  const existingAdmin = await findUserByEmail("admin@admin.com");
  if (!existingAdmin) {
    await createUser({
      email: "admin@admin.com",
      password: process.env.ADMIN_PIN || "admin1234",
      name: "Master Admin"
    });
    console.log("✓ Seeded default admin user: 'admin@admin.com' (Password: admin1234)");
  }
}

async function createTenant({ slug, partner1, partner2, adminPin, preset = "complete", customerEmail = null, plan = "vip", isPurchased = true, userId = null }) {
  const id = crypto.randomUUID();
  const cleanSlug = slug.toLowerCase().trim();
  const layout = DEFAULT_PRESETS[preset] || DEFAULT_PRESETS.complete;
  const authToken = crypto.randomBytes(24).toString("hex");

  const initialSections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS_DATA));
  initialSections.hero.partner1 = partner1;
  initialSections.hero.partner2 = partner2;
  initialSections.letter.sender = `${partner1} ❤️`;
  initialSections.letter.recipient = partner2;

  if (isPgConnected) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO tenants (id, slug, partner1_name, partner2_name, admin_pin, customer_email, is_purchased, plan, auth_token, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, cleanSlug, partner1, partner2, adminPin, customerEmail, isPurchased, plan, authToken, userId]
      );

      await client.query(
        `INSERT INTO site_configs (tenant_id, template_preset, theme_id, layout_order, sections_data)
         VALUES ($1, $2, 'romantic-rose', $3, $4)`,
        [id, preset, JSON.stringify(layout), JSON.stringify(initialSections)]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } else {
    const store = loadLocalStore();
    store.tenants[cleanSlug] = {
      id,
      slug: cleanSlug,
      partner1_name: partner1,
      partner2_name: partner2,
      admin_pin: adminPin,
      customer_email: customerEmail,
      is_purchased: isPurchased,
      plan,
      auth_token: authToken,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    store.site_configs[cleanSlug] = {
      tenant_id: id,
      template_preset: preset,
      theme_id: "romantic-rose",
      layout_order: layout,
      sections_data: initialSections,
      updated_at: new Date().toISOString()
    };
    saveLocalStore(store);
  }

  return getTenantBySlug(cleanSlug);
}

function enrichSectionsData(rawSections, partner1, partner2) {
  const merged = JSON.parse(JSON.stringify(DEFAULT_SECTIONS_DATA));
  if (partner1) {
    if (merged.hero) merged.hero.partner1 = partner1;
    if (merged.letter) merged.letter.sender = `${partner1} ❤️`;
  }
  if (partner2) {
    if (merged.hero) merged.hero.partner2 = partner2;
    if (merged.letter) merged.letter.recipient = partner2;
  }
  if (!rawSections || typeof rawSections !== "object") return merged;

  for (const [key, val] of Object.entries(rawSections)) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      merged[key] = { ...(merged[key] || {}), ...val };
      if (key === "timeline" && Array.isArray(val.chapters) && val.chapters.length === 0) {
        merged.timeline.chapters = DEFAULT_SECTIONS_DATA.timeline.chapters;
      }
      if (key === "memories" && Array.isArray(val.items) && val.items.length === 0) {
        merged.memories.items = DEFAULT_SECTIONS_DATA.memories.items;
      }
    } else if (Array.isArray(val) && val.length > 0) {
      merged[key] = val;
    } else if (val !== undefined && val !== null) {
      merged[key] = val;
    }
  }
  return merged;
}

async function getTenantBySlug(slug) {
  const cleanSlug = slug.toLowerCase().trim();

  if (isPgConnected) {
    const query = `
      SELECT t.id, t.slug, t.partner1_name, t.partner2_name, t.admin_pin, t.created_at,
             t.customer_email, t.is_purchased, t.plan, t.auth_token, t.user_id,
             c.template_preset, c.theme_id, c.layout_order, c.sections_data, c.updated_at
      FROM tenants t
      JOIN site_configs c ON t.id = c.tenant_id
      WHERE t.slug = $1
    `;
    const res = await pool.query(query, [cleanSlug]);
    if (!res.rows.length) return null;
    const row = res.rows[0];

    const rawSections = typeof row.sections_data === "string" ? JSON.parse(row.sections_data) : row.sections_data;
    return {
      id: row.id,
      slug: row.slug,
      partner1: row.partner1_name,
      partner2: row.partner2_name,
      adminPin: row.admin_pin,
      customerEmail: row.customer_email,
      isPurchased: row.is_purchased !== false,
      plan: row.plan || "vip",
      authToken: row.auth_token,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      templatePreset: row.template_preset,
      themeId: row.theme_id,
      layoutOrder: typeof row.layout_order === "string" ? JSON.parse(row.layout_order) : row.layout_order,
      sectionsData: enrichSectionsData(rawSections, row.partner1_name, row.partner2_name)
    };
  }

  const store = loadLocalStore();
  const t = store.tenants[cleanSlug];
  const c = store.site_configs[cleanSlug];
  if (!t || !c) return null;

  return {
    id: t.id,
    slug: t.slug,
    partner1: t.partner1_name,
    partner2: t.partner2_name,
    adminPin: t.admin_pin,
    customerEmail: t.customer_email,
    isPurchased: t.is_purchased !== false,
    plan: t.plan || "vip",
    authToken: t.auth_token,
    userId: t.user_id,
    createdAt: t.created_at,
    updatedAt: c.updated_at,
    templatePreset: c.template_preset,
    themeId: c.theme_id,
    layoutOrder: c.layout_order,
    sectionsData: enrichSectionsData(c.sections_data, t.partner1_name, t.partner2_name)
  };
}

const MASTER_ADMIN_PIN = process.env.ADMIN_PIN || "admin1234";
const MASTER_ADMIN_TOKEN = process.env.ADMIN_TOKEN || "master-admin-token-lovesaas";

async function verifyTenantAccess({ slug, pin, token }) {
  const cleanPin = pin ? String(pin).trim() : "";
  const cleanToken = token ? String(token).trim() : "";

  if (cleanPin === MASTER_ADMIN_PIN || cleanToken === MASTER_ADMIN_TOKEN || (slug === "admin" && cleanPin === MASTER_ADMIN_PIN)) {
    const targetSlug = (slug && slug !== "admin") ? slug : "demo";
    const targetTenant = await getTenantBySlug(targetSlug);
    return {
      authorized: true,
      role: "admin",
      isAdmin: true,
      isPurchased: true,
      isDemo: false,
      tenant: targetTenant || { slug: targetSlug, partner1: "Admin", partner2: "Master", isPurchased: true, plan: "vip", authToken: MASTER_ADMIN_TOKEN },
      authToken: MASTER_ADMIN_TOKEN
    };
  }

  if (!slug) return { authorized: false, error: "Missing slug" };
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return { authorized: false, error: "Site not found" };

  const pinMatches = cleanPin && String(tenant.adminPin).trim() === cleanPin;
  const tokenMatches = cleanToken && tenant.authToken && String(tenant.authToken).trim() === cleanToken;

  if (slug === "demo") {
    if (pinMatches || tokenMatches) {
      return { authorized: true, role: "user", isPurchased: true, tenant, isDemo: true };
    }
    return { authorized: true, role: "visitor", isPurchased: false, tenant, isDemo: true };
  }

  if (pinMatches || tokenMatches) {
    const isPurchased = tenant.isPurchased !== false;
    return {
      authorized: true,
      role: isPurchased ? "user" : "visitor",
      isPurchased,
      isDemo: false,
      tenant
    };
  }
  return { authorized: false, error: "Invalid PIN or token" };
}

async function updateSiteConfig(slug, { templatePreset, themeId, layoutOrder, sectionsData, adminPin, newAdminPin, authToken }) {
  const cleanSlug = slug.toLowerCase().trim();
  const tenant = await getTenantBySlug(cleanSlug);
  if (!tenant) throw new Error("Tenant not found");

  const cleanPin = adminPin ? String(adminPin).trim() : "";
  const cleanToken = authToken ? String(authToken).trim() : "";
  const isMasterAdmin = cleanPin === MASTER_ADMIN_PIN || cleanToken === MASTER_ADMIN_TOKEN;

  if (!isMasterAdmin) {
    if (cleanSlug === "demo") {
      throw new Error("Purchase now to customize and publish changes");
    }
    const pinValid = cleanPin && String(tenant.adminPin).trim() === cleanPin;
    const tokenValid = cleanToken && tenant.authToken && String(tenant.authToken).trim() === cleanToken;
    if (!pinValid && !tokenValid) {
      throw new Error("Unauthorized PIN");
    }
    if (tenant.isPurchased === false) {
      throw new Error("Purchase now to customize and publish changes");
    }
  }

  const nextPreset = templatePreset || tenant.templatePreset;
  const nextTheme = themeId || tenant.themeId;
  const nextLayout = layoutOrder || tenant.layoutOrder;
  const nextSections = sectionsData || tenant.sectionsData;

  if (isPgConnected) {
    await pool.query(
      `UPDATE site_configs
       SET template_preset = $1, theme_id = $2, layout_order = $3, sections_data = $4, updated_at = NOW()
       WHERE tenant_id = $5`,
      [nextPreset, nextTheme, JSON.stringify(nextLayout), JSON.stringify(nextSections), tenant.id]
    );

    if (newAdminPin && typeof newAdminPin === "string" && newAdminPin.trim()) {
      await pool.query(
        `UPDATE tenants SET admin_pin = $1 WHERE id = $2`,
        [newAdminPin.trim(), tenant.id]
      );
    }

    if (sectionsData && sectionsData.hero) {
      const p1 = sectionsData.hero.partner1;
      const p2 = sectionsData.hero.partner2;
      if (p1 || p2) {
        await pool.query(
          `UPDATE tenants SET partner1_name = COALESCE($1, partner1_name), partner2_name = COALESCE($2, partner2_name) WHERE id = $3`,
          [p1 || null, p2 || null, tenant.id]
        );
      }
    }
  } else {
    const store = loadLocalStore();
    store.site_configs[cleanSlug] = {
      tenant_id: tenant.id,
      template_preset: nextPreset,
      theme_id: nextTheme,
      layout_order: nextLayout,
      sections_data: nextSections,
      updated_at: new Date().toISOString()
    };
    if (newAdminPin && typeof newAdminPin === "string" && newAdminPin.trim()) {
      store.tenants[cleanSlug].admin_pin = newAdminPin.trim();
    }
    if (sectionsData && sectionsData.hero) {
      if (sectionsData.hero.partner1) store.tenants[cleanSlug].partner1_name = sectionsData.hero.partner1;
      if (sectionsData.hero.partner2) store.tenants[cleanSlug].partner2_name = sectionsData.hero.partner2;
    }
    saveLocalStore(store);
  }

  return getTenantBySlug(cleanSlug);
}

async function listTenants() {
  if (isPgConnected) {
    const res = await pool.query(
      `SELECT slug, partner1_name, partner2_name, created_at FROM tenants ORDER BY created_at DESC`
    );
    return res.rows;
  }
  const store = loadLocalStore();
  return Object.values(store.tenants).map(t => ({
    slug: t.slug,
    partner1_name: t.partner1_name,
    partner2_name: t.partner2_name,
    created_at: t.created_at
  }));
}

// ----------------------------------------------------
// USER AUTHENTICATION & MANAGEMENT
// ----------------------------------------------------

async function createUser({ email, password, name = "" }) {
  const cleanEmail = String(email).toLowerCase().trim();
  const id = crypto.randomUUID();
  const { hash, salt } = auth.hashPassword(password);
  const now = new Date().toISOString();

  if (isPgConnected) {
    const res = await pool.query(
      `INSERT INTO users (id, email, name, password_hash, salt, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, created_at`,
      [id, cleanEmail, name || cleanEmail.split("@")[0], hash, salt, now]
    );
    // Link existing couple sites with this customer_email
    await pool.query(
      `UPDATE tenants SET user_id = $1 WHERE LOWER(customer_email) = $2 AND user_id IS NULL`,
      [id, cleanEmail]
    );
    // Link existing unlinked orders for these sites
    await pool.query(
      `UPDATE orders SET user_id = $1 WHERE tenant_slug IN (SELECT slug FROM tenants WHERE user_id = $1) AND user_id IS NULL`,
      [id]
    );
    return res.rows[0];
  }

  const store = loadLocalStore();
  const user = {
    id,
    email: cleanEmail,
    name: name || cleanEmail.split("@")[0],
    password_hash: hash,
    salt,
    created_at: now
  };
  store.users[id] = user;

  // Link existing local tenants & orders
  for (const t of Object.values(store.tenants)) {
    if (t.customer_email && t.customer_email.toLowerCase() === cleanEmail && !t.user_id) {
      t.user_id = id;
    }
  }
  for (const ord of Object.values(store.orders)) {
    if (!ord.user_id && store.tenants[ord.tenant_slug] && store.tenants[ord.tenant_slug].user_id === id) {
      ord.user_id = id;
    }
  }
  saveLocalStore(store);

  return { id: user.id, email: user.email, name: user.name, created_at: user.created_at };
}

async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = String(email).toLowerCase().trim();

  if (isPgConnected) {
    const res = await pool.query(`SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1`, [cleanEmail]);
    return res.rows[0] || null;
  }

  const store = loadLocalStore();
  return Object.values(store.users).find(u => u.email.toLowerCase() === cleanEmail) || null;
}

async function findUserById(userId) {
  if (!userId) return null;

  if (isPgConnected) {
    const res = await pool.query(
      `SELECT id, email, name, created_at FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  const store = loadLocalStore();
  const u = store.users[userId];
  if (!u) return null;
  return { id: u.id, email: u.email, name: u.name, created_at: u.created_at };
}

async function updateUserProfile(userId, { name, password }) {
  if (!userId) throw new Error("User ID required");

  if (isPgConnected) {
    if (password) {
      const { hash, salt } = auth.hashPassword(password);
      const res = await pool.query(
        `UPDATE users SET name = COALESCE($1, name), password_hash = $2, salt = $3 WHERE id = $4 RETURNING id, email, name, created_at`,
        [name || null, hash, salt, userId]
      );
      return res.rows[0];
    } else {
      const res = await pool.query(
        `UPDATE users SET name = COALESCE($1, name) WHERE id = $2 RETURNING id, email, name, created_at`,
        [name || null, userId]
      );
      return res.rows[0];
    }
  }

  const store = loadLocalStore();
  const u = store.users[userId];
  if (!u) throw new Error("User not found");
  if (name) u.name = name;
  if (password) {
    const { hash, salt } = auth.hashPassword(password);
    u.password_hash = hash;
    u.salt = salt;
  }
  saveLocalStore(store);
  return { id: u.id, email: u.email, name: u.name, created_at: u.created_at };
}

// ----------------------------------------------------
// SESSION MANAGEMENT
// ----------------------------------------------------

async function createSession(userId) {
  const token = auth.generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (isPgConnected) {
    await pool.query(
      `INSERT INTO user_sessions (token, user_id, created_at, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [token, userId, now.toISOString(), expiresAt.toISOString()]
    );
    return token;
  }

  const store = loadLocalStore();
  store.user_sessions[token] = {
    token,
    user_id: userId,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString()
  };
  saveLocalStore(store);
  return token;
}

async function validateSession(token) {
  if (!token) return null;

  if (isPgConnected) {
    const res = await pool.query(
      `SELECT s.token, u.id, u.email, u.name, u.created_at
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND (s.expires_at IS NULL OR s.expires_at > NOW())
       LIMIT 1`,
      [token]
    );
    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      token: row.token,
      user: { id: row.id, email: row.email, name: row.name, createdAt: row.created_at }
    };
  }

  const store = loadLocalStore();
  const session = store.user_sessions[token];
  if (!session) return null;
  if (session.expires_at && new Date(session.expires_at) < new Date()) {
    delete store.user_sessions[token];
    saveLocalStore(store);
    return null;
  }
  const user = store.users[session.user_id];
  if (!user) return null;
  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at }
  };
}

async function deleteSession(token) {
  if (!token) return;
  if (isPgConnected) {
    await pool.query(`DELETE FROM user_sessions WHERE token = $1`, [token]);
    return;
  }
  const store = loadLocalStore();
  delete store.user_sessions[token];
  saveLocalStore(store);
}

// ----------------------------------------------------
// ORDERS & PURCHASES
// ----------------------------------------------------

async function createOrder({ userId, tenantSlug, plan = "vip", amount, currency = "USD", status = "completed" }) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const numericAmount = parseFloat(amount) || (plan === "starter" ? 19.00 : 39.00);

  if (isPgConnected) {
    const res = await pool.query(
      `INSERT INTO orders (id, user_id, tenant_slug, plan, amount, currency, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, userId || null, tenantSlug, plan, numericAmount, currency, status, now]
    );
    return res.rows[0];
  }

  const store = loadLocalStore();
  const order = {
    id,
    user_id: userId || null,
    tenant_slug: tenantSlug,
    plan,
    amount: numericAmount,
    currency,
    status,
    created_at: now
  };
  store.orders[id] = order;
  saveLocalStore(store);
  return order;
}

async function getUserOrders(userId) {
  if (!userId) return [];

  if (isPgConnected) {
    const res = await pool.query(
      `SELECT o.*, t.partner1_name, t.partner2_name
       FROM orders o
       LEFT JOIN tenants t ON o.tenant_slug = t.slug
       WHERE o.user_id = $1 OR o.tenant_slug IN (SELECT slug FROM tenants WHERE user_id = $1)
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return res.rows.map(r => ({
      id: r.id,
      plan: r.plan,
      amount: parseFloat(r.amount),
      currency: r.currency,
      status: r.status,
      tenantSlug: r.tenant_slug,
      partner1: r.partner1_name || "Partner 1",
      partner2: r.partner2_name || "Partner 2",
      createdAt: r.created_at
    }));
  }

  const store = loadLocalStore();
  const userSiteSlugs = Object.values(store.tenants)
    .filter(t => t.user_id === userId)
    .map(t => t.slug);

  return Object.values(store.orders)
    .filter(o => o.user_id === userId || userSiteSlugs.includes(o.tenant_slug))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(o => {
      const t = store.tenants[o.tenant_slug] || {};
      return {
        id: o.id,
        plan: o.plan,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        tenantSlug: o.tenant_slug,
        partner1: t.partner1_name || "Partner 1",
        partner2: t.partner2_name || "Partner 2",
        createdAt: o.created_at
      };
    });
}

// ----------------------------------------------------
// USER DESIGNS (COUPLE SITES)
// ----------------------------------------------------

async function getUserDesigns(userId, customerEmail = null) {
  if (!userId && !customerEmail) return [];
  const cleanEmail = customerEmail ? String(customerEmail).toLowerCase().trim() : "";

  if (isPgConnected) {
    const query = `
      SELECT t.id, t.slug, t.partner1_name, t.partner2_name, t.admin_pin, t.plan,
             t.auth_token, t.is_purchased, t.created_at,
             c.theme_id, c.template_preset, c.updated_at
      FROM tenants t
      LEFT JOIN site_configs c ON t.id = c.tenant_id
      WHERE t.user_id = $1 ${cleanEmail ? "OR (t.customer_email IS NOT NULL AND LOWER(t.customer_email) = $2)" : ""}
      ORDER BY t.created_at DESC
    `;
    const params = cleanEmail ? [userId, cleanEmail] : [userId];
    const res = await pool.query(query, params);
    return res.rows.map(r => ({
      id: r.id,
      slug: r.slug,
      partner1: r.partner1_name,
      partner2: r.partner2_name,
      plan: r.plan,
      themeId: r.theme_id || "romantic-rose",
      preset: r.template_preset || "complete",
      adminPin: r.admin_pin,
      authToken: r.auth_token,
      isPurchased: r.is_purchased !== false,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      siteUrl: `/sites/${encodeURIComponent(r.slug)}`,
      studioUrl: `/builder?slug=${encodeURIComponent(r.slug)}&token=${encodeURIComponent(r.auth_token || "")}`
    }));
  }

  const store = loadLocalStore();
  return Object.values(store.tenants)
    .filter(t => (userId && t.user_id === userId) || (cleanEmail && t.customer_email && t.customer_email.toLowerCase() === cleanEmail))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(t => {
      const cfg = store.site_configs[t.slug] || {};
      return {
        id: t.id,
        slug: t.slug,
        partner1: t.partner1_name,
        partner2: t.partner2_name,
        plan: t.plan,
        themeId: cfg.theme_id || "romantic-rose",
        preset: cfg.template_preset || "complete",
        adminPin: t.admin_pin,
        authToken: t.auth_token,
        isPurchased: t.is_purchased !== false,
        createdAt: t.created_at,
        updatedAt: cfg.updated_at,
        siteUrl: `/sites/${encodeURIComponent(t.slug)}`,
        studioUrl: `/builder?slug=${encodeURIComponent(t.slug)}&token=${encodeURIComponent(t.auth_token || "")}`
      };
    });
}

async function linkTenantToUser(slug, userId) {
  if (!slug || !userId) return;
  const cleanSlug = String(slug).toLowerCase().trim();

  if (isPgConnected) {
    await pool.query(`UPDATE tenants SET user_id = $1 WHERE slug = $2`, [userId, cleanSlug]);
    return;
  }

  const store = loadLocalStore();
  if (store.tenants[cleanSlug]) {
    store.tenants[cleanSlug].user_id = userId;
    saveLocalStore(store);
  }
}

module.exports = {
  pool,
  initDb,
  DEFAULT_PRESETS,
  DEFAULT_SECTIONS_DATA,
  createTenant,
  getTenantBySlug,
  updateSiteConfig,
  listTenants,
  verifyTenantAccess,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  createSession,
  validateSession,
  deleteSession,
  createOrder,
  getUserOrders,
  getUserDesigns,
  linkTenantToUser,
  MASTER_ADMIN_PIN,
  MASTER_ADMIN_TOKEN
};
