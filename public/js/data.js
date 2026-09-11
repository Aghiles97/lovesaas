// State & Real Story Defaults
const DEFAULTS = {
  partnerName: "Ella",
  senderName: "Your Love from Algeria 🇩🇿❤️",
  startDate: "2025-09-17T00:00",
  letter: "Dearest Ella,\n\nFirst of all, I want to say happy birthday to you, my sweetheart, my lof, my lovf, my lofv, my log, my every sweet word. I wish you the best, great fortune, so much love, and more memories with me for the years to come.\n\nI want to say that I am so happy you crossed my life. Meeting you was truly something I never thought of, and it completely changed my life. I am so thankful and grateful for this.\n\nWe shared so many great memories together. Even if we have some bad moments, they're just moments, not memories, so we forget them easily and move on because our love is stronger, powerful, and our hearts are pure and white.\n\nDuring our time together, we had the chance to travel to many places and try various things. God has created so many beauties in this world, and with you, I want to see them all.\n\nI am running out of ink, so my last words to you are that my bebe i lofe you, I miss you, I adore you, and I crave you.\n\nHuuuum Huummmm Monchichi Monchichi Huuuum",
  giftTitle: "Our Next Flight & World Adventure! ✈️🌴",
  giftDesc: "Wherever you want to travel next—Bali, China, Algeria, or anywhere in the world—our next grand adventure awaits!",
  memories: [
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
  ],
  voiceAudio: "audio/myrecording-volume-adjusted.mp3",
  letterAudio: "audio/letter_voice-volume-adjusted.mp3",
  herVoiceAudio: null,
  voiceVolume: 300,
  voiceBgVolume: 7,
  letterVoiceVolume: 300,
  letterBgVolume: 7,
  adminEdit: "yes"
};

const SOUNDTRACK_PLAYLIST = [
  {
    src: "taylor-swift-fate-of-ophelia.m4r",
    start: 46,
    title: "The Fate of Ophelia",
    artist: "Taylor Swift ✨"
  },
  {
    src: "lady-gaga-always-remember-us-this-way.m4r",
    start: 45,
    title: "Always Remember Us This Way",
    artist: "Lady Gaga 🌹"
  },
  {
    src: "imagine-dragons-i-follow-you.m4r",
    start: 0,
    title: "Follow You",
    artist: "Imagine Dragons 💫"
  }
];

let TIMELINE_CHAPTERS = (typeof window !== "undefined" && Array.isArray(window.TIMELINE_CHAPTERS) && window.TIMELINE_CHAPTERS.length > 0)
  ? window.TIMELINE_CHAPTERS
  : [
  {
    id: "chap-guangzhou-start",
    tag: "17 — 27 Sept • Canton Tower",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Guangzhou",
    location: "Guangzhou, China 🇨🇳",
    title: "Where Our Story Began 🗼✨",
    desc: "Under the illuminated grandeur of Canton Tower at 11 PM on September 17, our paths crossed and my world changed forever. What was meant to be a simple meeting turned into seven magical hours of non-stop conversation until 6 AM dawn—the kind of effortless connection where time dissolves and two souls recognize each other instantly.\n\nWith only ten precious days together before my flight back home to Algeria, we made every single second count. We spent all our days inseparable, curled up by the window of my apartment overlooking the sprawling city skyline and flowing traffic below, talking endlessly about our lives, dreams, and feelings. When departure morning arrived at the airport, she bought me a sweet bottle of orange juice, and we shared one last bittersweet photo together—a snapshot of two hearts that already knew they could never be parted.",
    highlights: ["7 hours talking non-stop until sunrise by Canton Tower", "Sitting by the window watching city traffic", "Ten unforgettable days falling hopelessly in love", "Airport orange juice & our bittersweet goodbye photo"],
    icon: "🗼",
    cityKey: "guangzhou"
  },
  {
    id: "chap-guangzhou-dec",
    tag: "10 Dec — 19 Jan • Airport Reunion",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Guangzhou",
    location: "Guangzhou, China 🇨🇳",
    title: "Airport Reunion & Birthday Perfume 🎁❤️",
    desc: "Every single hour I spent in Algeria felt like an eternity of counting down the minutes until I could hold my baby again. Finally, on December 10, my flight touched down in Guangzhou. Stepping through the arrival gate and seeing her beautiful face waiting for me was pure bliss.\n\nShe brought me straight home to her apartment, and the moment the door closed behind us, we wrapped each other in endless tight hugs and kisses, melting away months of distance in seconds. Right then, she surprised me with the most thoughtful birthday gift: the exact bottle of perfume I had been longing for! To be welcomed back to China with such tender affection and the scent of true love was the greatest birthday gift life could ever give me.",
    highlights: ["December 10 airport pickup reunion", "Endless warm hugs and kisses welcoming me home", "Surprise birthday gift: the dream perfume I always wanted! 🎁", "The bliss of being reunited in her loving arms"],
    icon: "🎁",
    cityKey: "guangzhou"
  },
  {
    id: "chap-shenzhen",
    tag: "19 — 23 Dec • Coastline & Ferris Wheel",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Shenzhen",
    location: "Shenzhen, China 🌆🌊",
    title: "Beach Sand Heart & Ferris Wheel 🌆🎡",
    desc: "Our journey to Shenzhen was our very first couple vlog experience—we took the camera everywhere, laughing and capturing every heartbeat of our adventure. We visited the coastline together; although we didn't swim in the waves, we sat side by side on the warm beach, and I sculpted a beautiful 3D heart into the sand to immortalize our love.\n\nWhen my baby was feeling unwell with her period, I embarked on my very first pharmacy mission to buy feminine pads for my girlfriend. Searching the aisles specifically for size 420mm, the local pharmacist woman looked at me with the warmest, most knowing smile as she handed them to me. Shenzhen treated us to modern wonders too: baby ordered drone delivery right near the Hong Kong skyline (where we sadly lost our DJI secondary camera lens!), we rode in a futuristic autonomous driverless car, and pedaled bikes through the evening breeze to our hotel.\n\nThe next day, she took me to a scenic viewpoint facing Hong Kong where we bought colorful cotton candy just to pose for cute pictures ('it honestly didn't taste that great, but the photos were adorable!'). We finished the night inside a private cabin on the giant illuminated Ferris wheel, rising high above the glowing city lights and collecting memories that will remain forever etched in our hearts.",
    highlights: ["First couple vlog adventure together", "Sculpting a romantic 3D heart in the beach sand", "Pharmacy mission for 420mm pads with a smiling pharmacist", "Futuristic drone delivery by HK skyline & autonomous car", "Cotton candy photoshoot & private giant Ferris wheel cabin"],
    icon: "🌆",
    cityKey: "shenzhen"
  },
  {
    id: "chap-chongqing",
    tag: "2 — 8 Jan • Mountain BBQ & Skyline",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Chongqing",
    location: "Chongqing, China 🌶️🏙️",
    title: "Cobblestones & Skyline Mountain BBQ 🌶️🌃",
    desc: "Chongqing completely stole my heart! Our hotel was tucked in the historic city center along winding cobblestone alleys with an electric, atmospheric charm. Even when my baby had to briefly fly back to Guangzhou for university classes while I explored CQ solo, the city remained enchanting. We indulged in mouth-watering Sichuan hotpot and discovered roadside fruit stalls selling the sweetest, most delicious mangoes for just 10–15 RMB that I became obsessed with!\n\nOne evening, we discovered one of the most romantic dining spots on earth: an open-air barbecue perched on the mountainside facing the jaw-dropping Chongqing skyline. It was hosted by a wonderful, generous Pakistani brother who always agreed to keep his doors open late just for us. We dined under the stars, surrounded by his friendly, cuddly cats that my baby fell head-over-heels in love with (and it made her appreciate Pakistani hospitality and cuisine so much more!).\n\nChongqing was filled with thrilling spectacles: baby took me to an awe-inspiring 360-degree immersive theater show about the 1949 Chinese civil war where I sat spellbound like an excited little kid, and we gazed up at the famous weekend drone light show. She even persuaded me to test our courage on a skyscraper rooftop, walking across a narrow steel bar suspended in the clouds with only a safety cable keeping us from falling ('one tiny slip and boom!'). Not satisfied with just that thrill, the next day she did another daring high-altitude cable photoshoot over the metropolis!",
    highlights: ["Atmospheric cobblestone alleys & spicy Sichuan hotpot", "Addicted to 10-15 RMB sweet street mangoes", "Mountain BBQ facing the skyline with our Pakistani host & cats", "Mind-blowing 360° 1949 civil war theater & drone light show", "Thrilling skyscraper ledge cable walk over the abyss"],
    icon: "🌶️",
    cityKey: "chongqing"
  },
  {
    id: "chap-chengdu",
    tag: "8 — 11 Jan • Panda Base Date",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Chengdu",
    location: "Chengdu, Sichuan 🐼🎋",
    title: "Panda Base & Twin Towers 🐼🎋",
    desc: "We reunited in Chengdu to explore the world-famous Panda sanctuary, laughing endlessly as we treated ourselves to funny panda-butt-shaped ice creams ('eating his ass was the funniest treat ever!'). We strolled beneath towering green bamboo waterfalls glistening with soft colors, soaking in the laid-back Chengdu atmosphere.\n\nWhile admiring the futuristic Chengdu Twin Towers, I jokingly christened them 'Slimane and Abdenor,' turning the architectural marvel into our own private couple joke. Knowing extreme sub-zero temperatures awaited us in the high alpine valleys, we spent our afternoons shopping for thick thermal parkas and cozy winter gear. On our final night, our alarms went off long before dawn, waking up in the pitch dark to board our tour into the snowy wilderness before sunrise.",
    highlights: ["Panda base date & eating hilarious panda-butt ice cream", "Bamboo waterfalls & Chengdu city vibes", "Nicknaming Chengdu Twin Towers 'Slimane and Abdenor'", "Hunting for heavy thermal snow gear", "Pre-dawn winter expedition departure in the dark"],
    icon: "🐼",
    cityKey: "chengdu"
  },
  {
    id: "chap-bipenggou",
    tag: "12 Jan • Frozen Lake Wonderland",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Bipenggou",
    location: "Bipenggou, Sichuan ❄️🏔️",
    title: "Frozen Lake & Our WhatsApp Avatars ❄️⛄",
    desc: "Our journey rolled deeper into the towering snow-covered mountains, the outside temperature plunging with every kilometer until we arrived at the winter wonderland of Bipenggou. Stepping out into the crisp alpine air, we were greeted by a breathtaking panorama: a vast, crystal-clear frozen lake blankets in pure white snow, surrounded by frosted pine forests and majestic jagged peaks.\n\nWe spent hours playing, laughing, and tossing fresh powder at each other like carefree kids. We took countless photos standing hand in hand across the frozen ice—and what makes Bipenggou uniquely sacred to us is that the photos we took right here by this frozen lake became our official WhatsApp profile pictures to this very day! Every time I glance at my phone, I am instantly transported back to that freezing, joyful winter paradise with my girl.",
    highlights: ["Scenic winter expedition into deep alpine mountains", "Massive frozen alpine lake surrounded by snow-draped pines", "Our official WhatsApp profile pictures captured right here! 📷", "Playful snowball fights and laughing in the fresh powder"],
    icon: "❄️",
    cityKey: "bipenggou"
  },
  {
    id: "chap-dagu",
    tag: "13 Jan • 5,000m Glacier Summit",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Dagu Glacier",
    location: "Dagu Glacier, Sichuan 🗻❄️",
    title: "5,000m Summit & Chalet Warmth 🗻☕",
    desc: "Boarding the high-altitude cable car, we ascended into the clouds up to 5,000 meters above sea level where the oxygen is thin and every breath feels like an accomplishment. Inside the cabin, we struck up a warm conversation with a sweet traveling couple who shared in our awe.\n\nAt the summit, the glacial cold was intense and piercing. Wanting to give my baby the most beautiful memories, I took off my gloves to operate the phone camera since the touchscreen wouldn't register through thick mittens. By the time I finished taking her photos, my bare fingers were numb and freezing, and the brutal cold combined with the 5,000m altitude brought on severe dizziness. I urged her to hurry inside the mountaintop chalet, where I collapsed beside her, leaning my entire weight against her body to absorb her warmth. Wrapped in her gentle embrace, my dizziness slowly melted away—her presence was the only medicine I needed. Once recovered, my talented baby sat down at the chalet's grand piano, filling the alpine summit with enchanting melodies to show off her incredible musical skills!",
    highlights: ["Cable car ascent to the thin air of the 5,000m glacier summit", "Freezing glove-less photoshoot to capture baby's best angles", "Leaning completely on baby inside the chalet to thaw and cure dizziness", "Baby serenading the mountains on the chalet piano"],
    icon: "🗻",
    cityKey: "dagu"
  },
  {
    id: "chap-jiuzhaigou",
    tag: "14 Jan • Turquoise Waters & Hotel",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Jiuzhaigou Valley",
    location: "Jiuzhaigou Valley, Sichuan 🏔️❄️",
    title: "Sci-Fi Waters & Lucky Boutique Hotel 🏔️✨",
    desc: "Jiuzhaigou felt like stepping straight into a science-fiction fairy tale. The crystalline water was such an impossible, luminous shade of turquoise that it seemed surreal against the snow-frosted pines and frozen tiered waterfalls.\n\nWe struck pure luck on this leg of our trip: while the rest of the tour group was assigned to a plain, boring hotel, we were blessed to receive a last-minute booking at a gorgeous, cozy boutique hotel reserved exclusively for us! We wandered through the snowy paradise capturing one stunning photo after another, holding hands tightly in the crisp winter air and marveling at nature's artistry with the person who matters most.",
    highlights: ["Unearthly turquoise waters that look like science fiction", "Lucky last-minute luxury boutique hotel booking", "Snowy fairytale cascades and frozen lake reflections", "Inseparable romantic walks in the alpine valley"],
    icon: "🏔️",
    cityKey: "jiuzhaigou"
  },
  {
    id: "chap-huanglong",
    tag: "15 Jan • Travertine Pools Hike",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Huanglong",
    location: "Huanglong, Sichuan 🏞️✨",
    title: "The Never-Ending Boardwalk Hike 🏞️😂",
    desc: "Trekking up Huanglong's high-altitude terraced travertine pools tested every ounce of our stamina! The endless wooden boardwalk stretched forever into the thin mountain atmosphere. Halfway up, my exhausted baby was ready to surrender and turn back, and truth be told, I was fighting severe altitude dizziness and muscle fatigue myself. But determined to be her rock, I put on my best encouraging smile: 'Come on baby, look, it's right around the corner, we're almost there!'—even though I knew full well the summit was still miles away!\n\nOur strategy turned into comedy: for every five minutes of walking, we had to sit down and rest for ten minutes. Other tourists would hike past us, reach the scenic viewpoint at the top, snap their photos, walk all the way back down, and pass us resting in the exact same spot for the second time! We laughed until our stomachs hurt, proving that even the most grueling mountain climbs are unforgettable when shared with your best friend.",
    highlights: ["High-altitude hike fighting thin air and exhaustion", "Cheering baby on with 'We're almost there!' when we totally weren't 😂", "Walking 5 minutes and resting 10 minutes", "Tourists passing us on the way up and again on the way down!"],
    icon: "🏞️",
    cityKey: "huanglong"
  },
  {
    id: "chap-chengdu-return",
    tag: "16 Jan • Return to Cozy Chengdu",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Chengdu",
    location: "Chengdu, Sichuan 🐼💨",
    title: "Farewell to Tour & Private Didi 🚗💨",
    desc: "On the final morning of our winter tour, the itinerary called for another scheduled group excursion. But after days of freezing summits and rigid schedules, me and my baby looked at each other and mutually agreed: we had had our fill of crowded group tours and just wanted the comfort of our own peaceful pace.\n\nWe politely asked the tour driver to drop us off along the highway where cars could reach us. We waved a cheerful goodbye to the tour group, hailed a comfortable private ride, and enjoyed a smooth, scenic drive straight back to the warmth of Chengdu, resting our tired feet and relishing our return to freedom.",
    highlights: ["Deciding together to leave the structured group tour early", "Bidding farewell to the bus group on the highway", "Comfortable private ride back to cozy Chengdu", "Relaxing our exhausted feet after days in the snow"],
    icon: "🚗",
    cityKey: "chengdu"
  },
  {
    id: "chap-guangzhou-cozy",
    tag: "16 — 19 Jan • Cozy Days & Warmth",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Guangzhou",
    location: "Guangzhou, China ⭐🇨🇳",
    title: "Cozy Days in Our Favorite City ⭐❤️",
    desc: "Arriving back in Guangzhou felt like returning home. Of all the metropolises in China, Guangzhou will always be our absolute favorite—it offers the perfect balance of warmth, affordability, endless culinary delights, and the cozy rhythm of life we both adore.\n\nWe spent these peaceful days decompressing from the sub-zero mountains, visiting our go-to food haunts, holding each other close, and savoring everyday domestic bliss before packing our luggage for the tropical paradise of Southeast Asia.",
    highlights: ["Returning to our beloved home base in South China", "Guangzhou culinary comfort and familiar city streets", "Peaceful, cozy days unwinding from the snowy peaks", "Packing our suitcases for Vietnam and Bali"],
    icon: "⭐",
    cityKey: "guangzhou"
  },
  {
    id: "chap-vietnam",
    tag: "19 Jan • 16h Layover Adventure",
    country: "Vietnam",
    countryFlag: "🇻🇳",
    city: "Hanoi / Saigon Transit",
    location: "Vietnam (16h Layover) 🇻🇳",
    title: "4-Pants Restroom Sprint & 16h Layover 🇻🇳🏃‍♂️",
    desc: "Our journey to Bali included an infamous transit through Vietnam that turned into one of the funniest adventures of our lives. Because I was continuing on to Algeria after Indonesia, our luggage was massively overweight by over 10 kilograms! In a desperate attempt to dodge luggage fees, we stashed our heavy carry-ons near the airport seating and approached the counter with just our light bags. We successfully received our boarding passes, but to our horror, the vigilant check-in agent followed us, confiscated our tickets, and sternly marched us back to the scale!\n\nFacing hefty penalties, we bolted into the family restroom in sweltering 30°C humidity. Sweating profusely, we began piling on clothes like stuffed mannequins—layering four pairs of trousers, five shirts, and two thick winter jackets each, while ditching worn-out garments in the trash! We lost track of time, and when we scrambled back to the counter, the agents gasped: 'You are way too late, run, quick!' Without even checking our weight, they opened the VIP priority lane. We sprinted through security and down the concourse like Olympic athletes, boarding as the very last passengers. The flight attendants and seated passengers watched in utter bewilderment as two puffing, heavily-clothed travelers collapsed into their seats and spent the next twenty minutes peeling off layer after layer of clothing!\n\nLanding in Vietnam, we settled in for a 16-hour layover. We fell in love with the gentle politeness of the Vietnamese people, who respectfully bowed their heads whenever our eyes met (to the point where I looked away just to spare them the trouble!). We slept for six hours across airport benches, enjoyed a morning breakfast together, and booked my ticket from Jakarta to Algeria with peaceful hearts.",
    highlights: ["10kg baggage overweight drama and airport hide-and-seek", "Wearing 4 pants, 5 shirts & 2 jackets in 30°C heat!", "High-speed sprint through the VIP priority lane to board last", "Hilariously stripping off dozens of layers in airplane seats 😂", "16-hour layover date with polite, bowing locals", "Sleeping 6 hours across terminal chairs & booking flights"],
    icon: "🇻🇳",
    cityKey: "vietnam"
  },
  {
    id: "chap-bali",
    tag: "20 — 27 Jan • Tropical Villa & ATV",
    country: "Indonesia",
    countryFlag: "🇮🇩",
    city: "Bali",
    location: "Bali, Indonesia 🌴🏖️",
    title: "Villa, ATV Trails & Waterbom 🌴🌊",
    desc: "Arriving in tropical Bali was pure bliss! After picking up local SIM cards, we drove straight to our gorgeous private villa where our friends Rami and Elysia were eagerly awaiting us. Stepping out into the warm island sunshine wearing summer clothes felt heavenly after the freezing China winter.\n\nOur villa pool immediately claimed its first casualty: while diving deep, I scraped my chest and foot against a metal fixture at the bottom ('Why on earth did I swim that low? Am I a fish or what?!'). But nothing could dampen our spirits. We tackled beach watersports on inflatable rafts, went jet skiing across the waves, visited the famous monkey forest temple, and embarked on wild, muddy ATV quad bike trails through the jungle—hands down one of the absolute greatest thrills of my life!\n\nWe shared endless laughter dining on Bebek ('duck', which sounds hilariously close to 'your father' in my Algerian dialect!). A sudden stomach bug left me sick and vomiting for a day; although my sweet baby offered to stay behind, I insisted she visit Nusa Penida with our friends so she wouldn't miss out. Once I recovered two days later, we conquered Waterbom together—an adrenaline-packed waterpark with heart-pounding slides that proved my baby is just as brave and fun-loving as I am!",
    highlights: ["Tropical villa reunion with friends Rami and Elysia", "Villa pool mishap ('Am I a fish or what?!' 😂)", "Thrilling muddy ATV jungle expedition & jet skiing", "Dining on Bebek ('your father' in Algerian)", "Conquering wild adrenaline slides at Waterbom waterpark"],
    icon: "🌴",
    cityKey: "bali"
  },
  {
    id: "chap-jakarta",
    tag: "27 Jan — 6 Feb • Family Home & Tekken",
    country: "Indonesia",
    countryFlag: "🇮🇩",
    city: "Jakarta",
    location: "Jakarta, Indonesia 🇮🇩🏡",
    title: "Meeting Lili & Ayung & PS5 Tekken 🏡🎮",
    desc: "Landing in Jakarta brought the monumental milestone of meeting my baby's wonderful parents, Lili and Ayung! Her father Ayung, though quiet due to the language barrier, welcomed me every day with the warmest 'good mornings' and 'goodnights.' Her mother Lili and I connected deeply—we spent hours engaged in fascinating conversations about psychology, philosophy, and cultural differences; she is such an inquisitive, kind-hearted woman with whom I formed a genuine bond.\n\nMy baby generously gave me my own private room in the house. Out of respect for family etiquette, we spent our days wandering the city together. She introduced me to bustling late-night street food joints where young crowds gather to devour delicious Indomie melted with cheese. We spent countless evenings playing PS5: while she struggled adorably at 'It Takes Two,' she revealed herself to be an absolute demon on Tekken—she pummeled me so mercilessly that I was genuinely terrified of her! ('Baby is scaryyyy!'). Whenever the family headed out to shopping malls, restaurants, or cinema screenings, they warmly brought me along—watching Ayung enjoy the film while Lili drifted asleep, Ella laughed that we are the exact mirror image of her parents.",
    highlights: ["Meeting parents Lili & Ayung & deep psychology discussions with Lili", "Late-night street food dates eating savory Indomie with cheese", "Getting utterly destroyed by baby at PS5 Tekken! 🥊😂", "Being embraced as family during cinema and dinner outings"],
    icon: "🏡",
    cityKey: "jakarta"
  },
  {
    id: "chap-guangzhou-spring",
    tag: "7 Apr — 25 May • Spring Reunion",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Guangzhou",
    location: "Guangzhou, China ☕❤️",
    title: "Canton Fair, Trimmer & Bike Cuddles ☕❤️",
    desc: "Back in Algeria, the ache of missing my girl was so overwhelming that I convinced my company to sponsor a business trip back to China just in time for the Canton Fair! Reunited at the airport, she welcomed me into her new apartment, and we seamlessly slipped back into our domestic rhythm: watching late-night movies, sharing favorite dishes, playing billiards, and attending the Canton Fair together.\n\nWith her full trust in my driving, I took the handlebars of our electric scooter daily. But my favorite moments were when I pretended to be tired, just so she would drive and I could sit close behind her, wrapping my arms around her waist and burying my face in her shoulder as the evening breeze rushed past. She affectionately groomed my facial hair with her personal trimmer—a habit that became so ingrained I now do it back home in Algeria! She even treated me to my very first full-body massage and professional foot cleaning, spoiling me with pure tenderness.",
    highlights: ["Spring reunion at her new Guangzhou apartment", "Scooter rides cuddling behind baby through city streets", "Baby grooming my facial hair with her trimmer (now a lifelong habit!)", "First professional body massage and foot cleaning", "Billiard matches, movie nights, and Canton Fair visits"],
    icon: "☕",
    cityKey: "guangzhou"
  },
  {
    id: "chap-canton-tower-proposal",
    tag: "23 Apr • Official Proposal 💍",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Canton Tower",
    location: "Canton Tower, Guangzhou 🗼🌻",
    title: "Sunflower Seeds Proposal 💍🌻",
    desc: "On the magical evening of April 23, we returned to the glowing foot of Canton Tower—the very spot where our journey first began. In my heart and soul, she had always been my girlfriend from day one; my loyalty and devotion were hers unconditionally. But I wanted a sacred, unforgettable moment to make our commitment official.\n\nUnder the dazzling tower lights, I officially asked my baby to be my girlfriend forever. As a symbol of our bond, I gifted her two sunflower seeds glued together—an unconventional, playful, yet deeply sacred promise of eternal loyalty, laughter, and unbreakable love.",
    highlights: ["Romantic evening under the glittering lights of Canton Tower", "The official proposal at the place where our eyes first met", "Two sunflower seeds glued together as our sacred bond of love 🌻", "A promise of eternal loyalty and happiness"],
    icon: "💍",
    cityKey: "guangzhou"
  },
  {
    id: "chap-nansha",
    tag: "25 Apr • Coastal Harbor Adventure",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Nansha Port",
    location: "Nansha Port, Guangzhou 🚗⚓",
    title: "First Rental Car & Nansha Port 🚗⚓",
    desc: "We embarked on our very first road trip adventure by renting a car together! Because she held a Chinese driver's license, she navigated the initial city traffic, but soon handed the steering wheel over to me. Driving down the open highway while she slept peacefully in the passenger seat beside me filled my heart with the sweetest sense of pride and protection.\n\nBefore leaving Guangzhou, we had stopped in Xiaobei to pick up our favorite savory roast chicken, 'Poule d'Or,' which we devoured hungrily once we arrived at Nansha Port. Later that evening, we spotted mysterious searchlights dancing across the night sky; following the beams, we discovered a tranquil, hidden coastal park where local families gathered to enjoy the cool sea air. On our midnight drive back to Guangzhou, we blasted our favorite tunes through the speakers with the windows down, followed by a comical late-night scavenger hunt circling neighborhood blocks until we finally tracked down a parking spot with an available EV charging station!",
    highlights: ["Our very first rental car road trip experience", "Baby sleeping peacefully beside me as I drove the highway", "Devouring savory Xiaobei 'Poule d'Or' roast chicken by the harbor", "Following sky beams to a secret family night park", "Late-night EV charger hunting through neighborhood streets"],
    icon: "🚗",
    cityKey: "nansha"
  },
  {
    id: "chap-baiyun",
    tag: "6 May • Mountain Hike ⛰️",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Baiyun Mountain",
    location: "Baiyun Mountain, Guangzhou 🌸💐",
    title: "Wildflower Bouquets on Baiyun Mountain 🌸💐",
    desc: "We spent a blissful sunny afternoon hiking the lush green trails of Baiyun Mountain in Guangzhou. The vibrant spring nature brought out the playful child in me: whenever I spotted a blooming wildflower along the mountainside, I would dash off the path to gently pluck it, carefully assembling a handmade wildflower bouquet petal by petal.\n\nPresenting the colorful bouquet to my baby and watching her face light up with the sweetest, most genuine smile was pure heaven. Simple moments like this reminded me that true romance isn't found in extravagance, but in the effortless joy of making your favorite person smile.",
    highlights: ["Peaceful spring hike across lush Baiyun Mountain", "Running like an excited kid to pick vibrant wildflowers", "Handcrafted wildflower bouquet presented to baby", "Her unforgettable glowing smile on the mountainside"],
    icon: "🌸",
    cityKey: "guangzhou"
  },
  {
    id: "chap-wuhan",
    tag: "17 — 19 May • Ancient Temple & Bikes",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Wuhan",
    location: "Wuhan, China 🌸🚲",
    title: "Ancient Temple Animation & Bikes 🌸🚲",
    desc: "As part of my business trip towards Shanghai, we made a scenic stop in peaceful Wuhan to explore the city hand in hand. We rented shared bicycles and spent hours pedaling through quiet streets, arriving at a majestic ancient temple where an innovative animated light show brought centuries of heritage to life before our eyes.\n\nThe following afternoon, we strolled through historic European-style concession avenues lined with vintage architecture, taking dozens of romantic photos. We had originally planned to ride Wuhan's famous futuristic suspended monorail, but realizing it would take us far out of our way when we were already famished and tired, we happily ditched the plan in favor of a comforting, delicious dinner—proving good food and relaxation always win!",
    highlights: ["Cycling through peaceful Wuhan streets on rented bikes", "Grand ancient Buddhist temple with animated light projection", "Romantic photoshoot amidst historic European-style architecture", "Prioritizing cozy food and cuddles over the far-away monorail"],
    icon: "🌸",
    cityKey: "wuhan"
  },
  {
    id: "chap-nanjing",
    tag: "19 May • Buddha Mountain & Pupu",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Nanjing",
    location: "Nanjing, China 🛕💩",
    title: "Rainy Buddha Mountain & Legendary Pupu 🛕💩",
    desc: "Arriving in Nanjing, we were captivated by the city's modern infrastructure rooted in ancient imperial history. We journeyed up the misty, rain-soaked peak of Niushoushan to visit its magnificent subterranean Buddha palace. Stepping inside felt otherworldly—thousands upon thousands of ornate golden Buddha statues glowing in cavernous halls, culminating in a colossal, serene reclining Buddha.\n\nOur visit was marked by two hilarious, unforgettable memories: first, a tour group of elderly Chinese locals were so astonished to see a foreigner in their midst that they pulled out their smartphones and began filming me openly without asking! What started as initial confusion quickly dissolved into heartwarming, shared laughter. And second, Nanjing gifted us what we affectionately christened the greatest, most legendary public toilet 'pupu' of our entire lives! As someone who adamantly refuses to ever use public restrooms, that fateful shared moment broke all records and became an inside joke immortalized in our love story forever!",
    highlights: ["Misty mountain trek to the breathtaking Niushoushan Buddha palace", "Thousands of golden miniature Buddhas & giant sleeping Buddha", "Elderly locals curiously filming the foreigner on their phones 😂", "The most legendary public toilet 'pupu' in couple history!"],
    icon: "🛕",
    cityKey: "nanjing"
  },
  {
    id: "chap-shanghai",
    tag: "19 — 23 May • Machinery & Turkish Feast",
    country: "China",
    countryFlag: "🇨🇳",
    city: "Shanghai",
    location: "Shanghai, China 🌃🍽️",
    title: "Machinery Inspection & Turkish Feast 🌃🍽️",
    desc: "We arrived in Shanghai, where we were warmly greeted by Ye Jing, her boss, and her wonderful driver, who picked us up to inspect factory machinery crucial for my business. After a productive workday, my baby enthusiastically insisted that Ye Jing take us to the most famous, upscale Turkish restaurant in Shanghai. The feast was lavish and expensive; while our polite Chinese hosts barely touched the foreign dishes, they beamed watching me savor every authentic bite with genuine delight!\n\nOur Shanghai stay wasn't without unexpected drama: when currency exchange hurdles caused a temporary financial snag, I reached out to several Chinese suppliers for a brief loan. Every single one hesitated, but none was funnier than Frank, who dramatically accused me of being a 'clever cheater' despite my piles of official documentation and bank proof! We sorted the issue out, but we still laugh at the absurdity of Frank's words. Our final metro ride heading toward Shanghai Hongqiao Airport was deeply bittersweet—knowing our time in China was drawing to a close and months of long-distance were looming on the horizon.",
    highlights: ["Factory machinery inspection with Ye Jing and her welcoming team", "Lavish Turkish restaurant feast in the heart of Shanghai", "Supplier loan drama with Frank calling me a 'clever cheater' 😂", "Exploring iconic Shanghai streets and skyline", "Bittersweet metro ride to the airport facing impending distance"],
    icon: "🌃",
    cityKey: "shanghai"
  },
  {
    id: "chap-guangzhou-farewell",
    tag: "23 — 25 May • Farewell & Return to Algeria 🇩🇿",
    country: "China ➔ Algeria",
    countryFlag: "🇨🇳 ➔ 🇩🇿",
    city: "Guangzhou ➔ Algeria",
    location: "Guangzhou, China ➔ Flight Home to Algeria 🇩🇿",
    title: "Guangzhou Farewell & Flight Back to Algeria ✈️🇩🇿",
    desc: "We dedicated our final 48 hours in Guangzhou to cherishing every fleeting second together before my flight back home to Algeria. On our second-to-last day, my baby led me around the corner and introduced me to an unbelievable little local eatery serving mouth-watering, gourmet-quality food for astonishingly cheap prices—located just 50 meters from our doorstep!\n\nI stared at her in pure disbelief: 'Why on earth did you wait until our very last day to bring me to this paradise?!' She burst into her signature laugh: 'Because this place closes early in the evening, and we always wake up late and only wander out at 2:00 AM!' As always, her logic was airtight and flawless which means she's always right.\n\nOur departure at Guangzhou Baiyun Airport on May 25 was deeply emotional and tearful. Unlike our Indonesian trip back in February, this time I flew directly back home to Algeria 🇩🇿, while my baby remained in China for one more month before later returning home to Jakarta 🇮🇩. In the airport concourse, we held each other tight until the very last boarding call, fixing her plumbing one final time before leaving, and exchanging tearful promises that no distance across oceans could ever weaken our love.",
    highlights: ["Cherishing our final 48 hours in Guangzhou before my flight to Algeria 🇩🇿", "Discovering the secret delicious 50-meter neighborhood gem", "'Why wait till today?!' 'Because we wake up late and go out at 2 AM!' 😂", "May 25: Flight back home to Algeria 🇩🇿 (baby staying 1 more month in China)", "Tearful airport goodbye, last apartment fixes & infinite promises"],
    icon: "⭐",
    cityKey: "guangzhou"
  },
  {
    id: "chap-ldr",
    tag: "Today & Forever • 10,000+ km",
    country: "Algeria ⟷ Indonesia",
    countryFlag: "🇩🇿 ⟷ 🇮🇩",
    city: "Algiers ⟷ Jakarta",
    location: "Algeria 🇩🇿 ⟷ Jakarta 🇮🇩",
    title: "Algeria ⟷ Jakarta: Forever Bond ✈️💍",
    desc: "Though oceans, continents, and over 10,000 kilometers separate Algeria and Indonesia, our love bridges the distance effortlessly. Ever since my flight back to Algeria and your later return to Jakarta after China, we spend our days connected through sweet good-morning texts, late-night FaceTime calls where we fall asleep together with the screen glowing, and counting down to our next flight reunion.\n\nEvery single travel memory—from the 7 hours talking at Canton Tower to the frozen summits of Sichuan, from 4 pants in Vietnam to our warm family days in Jakarta back in February—is etched into the foundation of our forever. Distance means nothing when you mean everything to me. I lof you quintillions and infinite, my princess!",
    highlights: ["Endless FaceTime sleep calls and daily good morning messages", "Overcoming 10,000+ km between Algeria and Jakarta with unwavering loyalty", "Counting down the days to our next airport arrival hug", "I lof you this much: Quintillions, Infinite & Forever! 💖"],
    icon: "💍",
    cityKey: "algeria"
  }
];

let CITY_STORIES = (typeof window !== "undefined" && window.CITY_STORIES)
  ? window.CITY_STORIES
  : {
  "algeria": {
    icon: "🇩🇿",
    tag: "Boyfriend's Origin (Ella Hasn't Visited Yet)",
    title: "Algeria (Boyfriend's Home)",
    desc: "Where I come from and count down every single hour until our next flight to see you! Ella hasn't traveled here yet—our next dream trip together awaits!",
    defaultCaption: "Algiers Mediterranean coast — where I come from & long to bring you 🇩🇿❤️",
    colorA: "#005c97",
    colorB: "#363795",
    symbol: "🇩🇿✈️"
  },
  "china-base": {
    icon: "🇨🇳",
    tag: "Where We Met",
    title: "China (Where We Met) 🇨🇳",
    desc: "The fateful country where our eyes first met on September 17. From our Guangzhou base to scenic alpine mountains, traveling together across China was an unforgettable dream.",
    defaultCaption: "Where our fateful love story first began in China 🇨🇳✨",
    colorA: "#ff416c",
    colorB: "#8a2387",
    symbol: "🇨🇳💖"
  },
  "guangzhou": {
    icon: "⭐",
    tag: "Our Favorite City in China",
    title: "Guangzhou (Canton Tower & Secret 50m Food ⭐)",
    desc: "Our favorite place facing Canton Tower at night where we spent 7 hours talking non-stop! Sitting by the window watching city traffic, airport orange juice goodbyes, birthday perfume reunion, bike cuddles, sunflower seed proposal, and our secret 50m late-night restaurant!",
    defaultCaption: "7 hours talking by Canton Tower & sitting by the window watching traffic ❤️🗼",
    colorA: "#1a1c2e",
    colorB: "#7b1fa2",
    symbol: "🗼🍲"
  },
  "shenzhen": {
    icon: "🌆",
    tag: "First Vlog & Ferris Wheel",
    title: "Shenzhen (3D Sand Heart & Ferris Wheel 🌆)",
    desc: "Our very first vlogging trip! Sculpting a 3D heart in the beach sand, searching for 420mm pads with the smiling pharmacist, experiencing drone delivery near HK, autonomous driverless cars, and our private Ferris wheel cabin.",
    defaultCaption: "3D sand heart, drone delivery & private Ferris wheel cabin in Shenzhen 🌆🎡",
    colorA: "#3a1c71",
    colorB: "#d76d77",
    symbol: "🌆✨"
  },
  "chongqing": {
    icon: "🌶️",
    tag: "Mountain BBQ, Cats & 360° Show",
    title: "Chongqing (Mountain BBQ, Cats & Skyscraper Ledge 🌶️)",
    desc: "Cobblestone streets, 10–15 RMB sweet street mangoes, spicy hotpot, open-air mountain BBQ with our friendly Pakistani host and his cats, mind-blowing 360° civil war theater, drone shows, and crazy skyscraper cable walks!",
    defaultCaption: "Mountain BBQ with cats & mind-blowing 360° civil war show in Chongqing 🌶️🌃",
    colorA: "#870000",
    colorB: "#190a05",
    symbol: "🌶️🍲"
  },
  "chengdu": {
    icon: "🐼",
    tag: "Pandas & Twin Towers",
    title: "Chengdu (Panda Butt Ice Cream & 'Slimane & Abdenor' 🐼)",
    desc: "Visiting the Panda asylum, eating hilarious panda-butt ice cream, bamboo waterfalls, naming the Chengdu Twin Towers 'Slimane and Abdenor', and buying warm winter clothes before our pre-dawn snow expedition.",
    defaultCaption: "Panda asylum date & 'Slimane & Abdenor' Twin Towers in Chengdu 🐼🎋",
    colorA: "#11998e",
    colorB: "#38ef7d",
    symbol: "🐼🎋"
  },
  "bipenggou": {
    icon: "❄️",
    tag: "Frozen Lake & WhatsApp Avatars",
    title: "Bipenggou (Frozen Lake & Snow Fun ❄️)",
    desc: "Vast frozen alpine lake and playing in the deep fresh snow! The magical winter destination where our current official WhatsApp profile pictures were taken.",
    defaultCaption: "Our WhatsApp profile picture spot at Bipenggou frozen lake ❄️🏔️",
    colorA: "#1e3c72",
    colorB: "#00b4d8",
    symbol: "❄️⛄"
  },
  "dagu": {
    icon: "🗻",
    tag: "5,000m Summit & Chalet Piano",
    title: "Dagu Glacier (5,000m Summit & Piano 🗻)",
    desc: "Cable car up to 5,000m thin air with a cute couple, freezing glove-less photoshoot, rushing back to the chalet leaning on baby to warm up from dizziness, and baby showing off her piano skills!",
    defaultCaption: "5,000m freezing summit, warming up leaning on baby & chalet piano 🗻☕",
    colorA: "#2b5876",
    colorB: "#4e4376",
    symbol: "🗻❄️"
  },
  "jiuzhaigou": {
    icon: "🏔️",
    tag: "Sci-Fi Waters & Lucky Hotel",
    title: "Jiuzhaigou (Sci-Fi Turquoise Waters 🏔️)",
    desc: "Surreal science-fiction crystal turquoise lakes and snow-covered pines! Lucky last-minute boutique hotel while the tour stayed in a boring one, taking countless gorgeous photos together.",
    defaultCaption: "Sci-fi turquoise waters & lucky boutique hotel in Jiuzhaigou 🏔️❄️",
    colorA: "#2c3e50",
    colorB: "#3498db",
    symbol: "❄️🏔️"
  },
  "huanglong": {
    icon: "🏞️",
    tag: "The Never-Ending Hike",
    title: "Huanglong ('Almost There!' Hike 🏞️)",
    desc: "High-altitude hike fighting thin air dizziness! Motivating baby with 'we're almost there!' when it was still miles away, resting 10 mins every 5 mins while tourists passed us twice.",
    defaultCaption: "Telling baby 'we're almost there!' every 5 mins at Huanglong 🏞️😂",
    colorA: "#134e5e",
    colorB: "#71b280",
    symbol: "🏞️✨"
  },
  "nansha": {
    icon: "🚗",
    tag: "First Rental Car & Poule d'Or",
    title: "Nansha Port (Rental Car, Poule d'Or & Night Park 🚗)",
    desc: "Our first rental car road trip! Baby sleeping beside me while I drove, eating Xiaobei's Poule d'Or, following sky lights to a peaceful family park by the port, loud music, and hunting for EV charging spots.",
    defaultCaption: "First rental car, Poule d'Or & hunting for EV chargers at Nansha 🚗⚡",
    colorA: "#1e3c72",
    colorB: "#2a5298",
    symbol: "🚗⚡"
  },
  "wuhan": {
    icon: "🌸",
    tag: "Ancient Temple & Bikes",
    title: "Wuhan (Ancient Temple Animation & Bikes 🌸)",
    desc: "Renting bikes through peaceful Wuhan streets, visiting a grand ancient temple with animated projection show, European concession architecture, and canceling the reverse monorail for food.",
    defaultCaption: "Renting bikes & ancient temple animated show in Wuhan 🌸🚲",
    colorA: "#f12711",
    colorB: "#f5af19",
    symbol: "🌸🍜"
  },
  "nanjing": {
    icon: "🛕",
    tag: "Rainy Buddha Mountain & Pupu",
    title: "Nanjing (Rainy Buddha Mountain & Legendary Pupu 🛕)",
    desc: "Niushoushan rainy mountain hike, thousands of Buddha statues, giant sleeping Buddha, curious elderly locals filming the foreigner, and our legendary public toilet 'pupu'!",
    defaultCaption: "Rainy Buddha temple, filming elders & our legendary pupu in Nanjing 🛕💩",
    colorA: "#c31432",
    colorB: "#240b36",
    symbol: "🛕✨"
  },
  "shanghai": {
    icon: "🌃",
    tag: "Turkish Feast & Machinery",
    title: "Shanghai (Turkish Feast & Frank the 'Clever Cheater' 🌃)",
    desc: "Machinery inspection with Ye Jing, delicious Turkish restaurant feast, supplier loan drama with Frank calling me 'clever cheater', and a bittersweet airport metro ride.",
    defaultCaption: "Turkish restaurant feast & supplier drama with Frank in Shanghai 🌃🍽️",
    colorA: "#0f2027",
    colorB: "#2c5364",
    symbol: "🌃💖"
  },
  "vietnam": {
    icon: "🇻🇳",
    tag: "4-Pants Restroom Sprint",
    title: "Vietnam (10kg Overweight & 16h Layover 🇻🇳)",
    desc: "10kg overweight luggage drama! Wearing 4 pants, 5 shirts and 2 jackets in 30°C heat, sprinting through VIP priority lanes to board last, peeling off layers in seats, and a cozy 16h airport layover.",
    defaultCaption: "Wearing 4 pants & 5 shirts in 30° heat & sprinting to the plane 🇻🇳✈️",
    colorA: "#d35400",
    colorB: "#c0392b",
    symbol: "🇻🇳🍜"
  },
  "bali": {
    icon: "🌴",
    tag: "Villa, Pool Scrape & ATV Trails",
    title: "Bali (Villa with Friends, ATV Trails & Waterbom 🌴)",
    desc: "Meeting Rami and Elysia at the villa, pool bottom scrape ('am I a fish?!'), thrilling ATV jungle trails, eating Bebek ('your father'), and wild Waterbom adrenaline slides.",
    defaultCaption: "ATV jungle adventures & pool mishaps ('am I a fish?!') in Bali 🌴🌊",
    colorA: "#ff7e5f",
    colorB: "#feb47b",
    symbol: "🌴🥥"
  },
  "jakarta": {
    icon: "🏡",
    tag: "Lili & Ayung & PS5 Tekken",
    title: "Jakarta (Meeting Parents, Indomie & Tekken Defeats 🏡)",
    desc: "Meeting Lili and Ayung, deep psychology chats with Lili, late-night Indomie with cheese, getting brutally defeated at PS5 Tekken, and family cinema dates.",
    defaultCaption: "Meeting Lili & Ayung, Indomie with cheese & PS5 Tekken in Jakarta 🏡🎮",
    colorA: "#ff758c",
    colorB: "#ff7eb3",
    symbol: "🏡❤️"
  },
  "indonesia": {
    icon: "🇮🇩",
    tag: "Girl's Origin",
    title: "Indonesia (Girl's Origin) 🇮🇩",
    desc: "From ATV jungle rides and Waterbom in Bali to meeting Lili & Ayung and getting demolished at Tekken in Jakarta—our unforgettable Indonesian chapter!",
    defaultCaption: "Girl's origin — our magical moments across Indonesia 🇮🇩🌴🏡",
    colorA: "#ff4b1f",
    colorB: "#ff9068",
    symbol: "🇮🇩💖"
  }
};

const RICH_REASONS = [
  {
    id: "r1",
    category: "romance",
    tag: "🌻 Sunflower Seed Proposal",
    badgeIcon: "💍",
    note: "Under the glowing night lights of Canton Tower, officially proposing to you to be my girlfriend with two sunflower seeds as our sacred bond of love!",
    footnote: "The easiest 'yes' and most precious sunflower seeds in the world."
  },
  {
    id: "r2",
    category: "food",
    tag: "🍜 Our 50m Secret Food Spot",
    badgeIcon: "😋",
    note: "Finding that incredible cheap food restaurant just 50 meters from our house! 'Why wait till our last day?!' 'Because it closes early and we wake up late at 2 AM!'",
    footnote: "She was right, like always!"
  },
  {
    id: "r3",
    category: "travel",
    tag: "🚗 First Car Rental & Poule d'Or",
    badgeIcon: "🚗",
    note: "Renting our first car to Nansha Port! You sleeping beside me while I drove, eating Xiaobei's Poule d'Or, and hunting late-night for EV chargers with loud music!",
    footnote: "The best road trips are the ones full of chaotic laughter."
  },
  {
    id: "r4",
    category: "travel",
    tag: "❄️ 5,000m Mountain Summit",
    badgeIcon: "🗻",
    note: "Standing together at the freezing 5,000m summit of Dagu Glacier with thin air and warm hearts, drinking coffee at the rooftop of the world.",
    footnote: "Freezing cold outside, but holding you made it the warmest place."
  },
  {
    id: "r5",
    category: "travel",
    tag: "🏞️ Fairy Pools",
    badgeIcon: "✨",
    note: "Marveling at the magical multi-tiered turquoise fairy pools of Huanglong together in the fresh alpine mountain air.",
    footnote: "Pure magic with my real-life fairy."
  },
  {
    id: "r6",
    category: "humor",
    tag: "🛕 Historic & Unforgettable",
    badgeIcon: "🚽",
    note: "Visiting the peaceful Buddha temple in Nanjing and sharing the most legendary public toilet 'pupu' of our entire lives!",
    footnote: "Our special couple word 'PUPU' immortalized forever."
  },
  {
    id: "r7",
    category: "humor",
    tag: "🇻🇳 4 Pants in 30° Heat!",
    badgeIcon: "🏃‍♂️",
    note: "Being 10kg overweight in Vietnam, sprinting into the family toilet to wear 4 pants and 5 shirts in 30°C heat, and dashing like crazy through VIP priority lanes!",
    footnote: "Peeling off 4 pants on the plane was the funniest moment ever."
  },
  {
    id: "r8",
    category: "romance",
    tag: "🏡 Lili & Ayung & PS5 Tekken",
    badgeIcon: "🎮",
    note: "Staying with your family in Jakarta, chatting psychology with Lili, eating late-night Indomie with cheese, and getting completely destroyed by you at PS5 Tekken!",
    footnote: "Baby is scary powerful at Tekken... I love you so much!"
  },
  {
    id: "r9",
    category: "travel",
    tag: "🌴 Tropical Sunsets",
    badgeIcon: "🏖️",
    note: "The golden tropical sunsets, warm ocean breeze, and coconut drinks we shared holding hands along the beaches of Bali.",
    footnote: "Sunsets fade, but my lof for you only burns brighter."
  },
  {
    id: "r10",
    category: "food",
    tag: "🌶️ Mountain BBQ & Pakistani Cats",
    badgeIcon: "🍲",
    note: "Eating open-air BBQ on the mountain facing Chongqing's skyline, with our wonderful Pakistani host opening late for us and cuddling his beautiful cats!",
    footnote: "10-15 RMB sweet street mangoes and romantic skyline views."
  },
  {
    id: "r11",
    category: "humor",
    tag: "🐼 Panda Butt Ice Cream",
    badgeIcon: "🎋",
    note: "Visiting the Panda asylum in Chengdu, eating hilarious panda-butt ice cream, and naming the Chengdu Twin Towers 'Slimane and Abdenor'!",
    footnote: "Eating panda's butt was the funniest treat ever."
  },
  {
    id: "r12",
    category: "romance",
    tag: "🌃 The Bund Strolls",
    badgeIcon: "🌉",
    note: "Walking hand-in-hand along The Bund in Shanghai with the romantic river breeze and illuminated city towers.",
    footnote: "The whole city was glowing, but you outshined every tower."
  },
  {
    id: "r13",
    category: "romance",
    tag: "💋 Cute Couple Habit",
    badgeIcon: "🥰",
    note: "The sweet way you call me your 'Algerian boy' and whisper 'I lof lof you'.",
    footnote: "My heart melts every single time you say it."
  },
  {
    id: "r14",
    category: "romance",
    tag: "🤗 Instant Happiness",
    badgeIcon: "💖",
    note: "How your sweet 'kiss kiss' and 'hug hug' instantly make any bad day completely disappear.",
    footnote: "My instant medicine and eternal happiness."
  },
  {
    id: "r15",
    category: "ldr",
    tag: "🌙 Nighttime Calls",
    badgeIcon: "📱",
    note: "The cute little sleepy faces you make on our late-night FaceTime calls before we fall asleep together.",
    footnote: "The sweetest sight to end every single day."
  },
  {
    id: "r16",
    category: "travel",
    tag: "🤝 Hand in Hand",
    badgeIcon: "🌍",
    note: "How you hold my hand tightly everywhere we travel across the world, from airports to snowy mountain summits.",
    footnote: "I will never let go of your hand."
  },
  {
    id: "r17",
    category: "humor",
    tag: "✨ Pure Laughter",
    badgeIcon: "😂",
    note: "How effortlessly we laugh together over the silliest little inside jokes, teasing, and goofy faces.",
    footnote: "Laughter is easiest when it's with your best friend."
  },
  {
    id: "r18",
    category: "romance",
    tag: "💍 Soulmate & Forever",
    badgeIcon: "👑",
    note: "Because you are my soulmate, my best friend, my travel buddy, and my forever Indonesian princess.",
    footnote: "Forever and always, no matter what."
  },
  {
    id: "r19",
    category: "food",
    tag: "😋 Foodie Joy",
    badgeIcon: "🍜",
    note: "The way your eyes light up with pure happiness whenever delicious food arrives at our table.",
    footnote: "The cutest reaction in the world."
  },
  {
    id: "r20",
    category: "romance",
    tag: "🕊️ Safe Harbor",
    badgeIcon: "🏡",
    note: "How safe, calm, and completely at peace I feel every time you are in my arms.",
    footnote: "You are my home wherever we are in the world."
  },
  {
    id: "r21",
    category: "ldr",
    tag: "✈️ Distance Means Nothing",
    badgeIcon: "🌐",
    note: "Because even with 10,000 km between Algeria and Indonesia, distance means nothing when you mean everything to me.",
    footnote: "Every flight ticket brings me back home to you."
  },
  {
    id: "r22",
    category: "romance",
    tag: "💛 Golden Heart",
    badgeIcon: "✨",
    note: "Your boundless kindness, your golden heart, and your irreplaceable sweet, gentle soul.",
    footnote: "The purest and kindest soul I know."
  },
  {
    id: "r23",
    category: "romance",
    tag: "👸 Prettiest Girl",
    badgeIcon: "🌸",
    note: "Because you are the prettiest, sweetest, and most wonderful girlfriend in the entire universe!",
    footnote: "I fall in lof with you more and more every single day."
  },
  {
    id: "r24",
    category: "travel",
    tag: "❄️ Our WhatsApp Profile Pictures!",
    badgeIcon: "📷",
    note: "Reaching Bipenggou's massive frozen alpine lake, playing in the deep snow, and capturing the exact photos we use as our WhatsApp profile pictures to this day!",
    footnote: "Every time I look at WhatsApp, I remember freezing happily with you."
  },
  {
    id: "r25",
    category: "romance",
    tag: "✨ That First 7-Hour Night",
    badgeIcon: "🌙",
    note: "That first night we met at 11 PM and talked for 7 hours non-stop until 6 AM! Walking together back to my place at dawn before calling a DiDi to send you safely home.",
    footnote: "From our very first conversation, I knew my heart had found its home."
  },
  {
    id: "r26",
    category: "romance",
    tag: "🕊️ Your Endless Care",
    badgeIcon: "💖",
    note: "The deeply caring, selfless way you look after my happiness and every single one of my desires, making me feel so truly loved and cherished every single day.",
    footnote: "Your heart is the gentlest, sweetest home I have ever known."
  },
  {
    id: "r27",
    category: "romance",
    tag: "🥰 Loving Me Like A Baby",
    badgeIcon: "🍼",
    note: "How much you adore treating me and spoiling me like your little baby, wrapping me in pure warmth, tender affection, and sweet cuddles.",
    footnote: "Safe, adored, and forever pampered in your loving arms."
  },
  {
    id: "r28",
    category: "romance",
    tag: "💎 Always Here For Me",
    badgeIcon: "🤝",
    note: "How you are always standing right by my side with an open, generous heart—never hesitating to support me whenever I need you.",
    footnote: "Your unconditional loyalty and love mean the entire world to me."
  },
  {
    id: "r29",
    category: "romance",
    tag: "👨‍👩‍👧 Warmest Home in Jakarta",
    badgeIcon: "🏡",
    note: "Inviting me to meet your family and stay at your house in Jakarta, welcoming me with wide-open arms and taking such tender care of me.",
    footnote: "You and your wonderful family gave me the most unforgettable feeling of home."
  },
  {
    id: "r30",
    category: "humor",
    tag: "🛡️ Partner in Crime",
    badgeIcon: "🚗",
    note: "When I had that accident with your mom's car and you completely covered for me, taking all the blame just to protect me without a second thought!",
    footnote: "A true ride-or-die love—I will never forget how you protected me."
  },
  {
    id: "r31",
    category: "travel",
    tag: "🌟 Showing Me Your World",
    badgeIcon: "✨",
    note: "The pure, glowing excitement in your eyes whenever you introduce me to something new—new places, amazing flavors, and little joys of life.",
    footnote: "Every adventure is ten times more magical when discovered through you."
  },
  {
    id: "r32",
    category: "romance",
    tag: "💫 Hand in Hand Everywhere",
    badgeIcon: "🗺️",
    note: "The sweet, effortless trust between us—how you happily follow my lead and let us wander wherever and whenever my heart desires.",
    footnote: "Every path is paradise as long as your hand is in mine."
  },
  {
    id: "r33",
    category: "romance",
    tag: "🎀 Sweet Surprises & Gifts",
    badgeIcon: "🎁",
    note: "How much joy you find in surprising me with thoughtful gifts, always thinking of sweet little ways to make my smile light up.",
    footnote: "The greatest gift I will ever receive in this life is your love."
  },
  {
    id: "r34",
    category: "romance",
    tag: "💞 What's Yours Is Ours",
    badgeIcon: "🚲",
    note: "The unforgettable sweetness when you started calling your belongings 'ours'—especially that first time you pointed to your bike and proudly called it 'our bike'.",
    footnote: "With that one little word, two lives became one beautiful journey."
  },
  {
    id: "r35",
    category: "travel",
    tag: "🏍️ Magic on Two Wheels",
    badgeIcon: "🛵",
    note: "Riding the bike together through the streets, sitting close behind you and holding you tight—pure, cinematic magic that I'll cherish forever.",
    footnote: "The evening breeze on our faces and your warmth in my arms."
  },
  {
    id: "r36",
    category: "humor",
    tag: "🎓 My Best Riding Master",
    badgeIcon: "🛵",
    note: "How patiently and adorably you taught me how to ride the bike—the most wonderful, loving master I could have ever asked for!",
    footnote: "Certified master instructor, graduated with five stars in love."
  },
  {
    id: "r37",
    category: "travel",
    tag: "❄️ Dagu Chalet Warmth",
    badgeIcon: "🗻",
    note: "At that cozy chalet high up in Dagu Glacier, when the altitude made me dizzy and I melted into your arms to borrow your warmth until I felt safe and grounded again.",
    footnote: "Your arms were the only warmth and medicine I needed in the freezing thin air."
  }
];

let savedReasonsList = null;
try { savedReasonsList = JSON.parse(localStorage.getItem("gf_reasons")); } catch (e) {}
let REASONS = Array.isArray(savedReasonsList) && savedReasonsList.length > 0 ? savedReasonsList : [
  ...RICH_REASONS,
  ...(JSON.parse(localStorage.getItem("gf_custom_reasons")) || [])
];

const COUPONS = [
  { id: "c0", icon: "🎂", badge: "Birthday Special", title: "Birthday Queen Wish Grant", sub: "Whatever my princess Ella wishes for on her birthday—granted unconditionally with infinite lof! 💖" },
  { id: "c1", icon: "🌴", badge: "Travel Pass", title: "Next Dream Trip Together", sub: "You pick where we fly next—all booked and planned with lof!" },
  { id: "c2", icon: "🍲", badge: "Foodie Pass", title: "Virtual Dinner Date Together", sub: "We cook or grab our comfort food and eat together on FaceTime!" },
  { id: "c3", icon: "💆‍♀️", badge: "Spa Pass", title: "30-Min Relaxation Massage", sub: "Redeemable for head, back, or shoulder massage anytime" },
  { id: "c4", icon: "🎬", badge: "Cinema VIP", title: "Long-Distance Movie Night", sub: "Synced movie call with unlimited snacks & FaceTime cuddles" },
  { id: "c5", icon: "💋", badge: "Kiss Pass", title: "1,000,000 Kiss Kiss Voucher", sub: "Sent from Jakarta to Algeria with infinite lof" }
];

const SPINNER_OPTIONS = {
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
  ]
};

const TRIVIA_QUESTIONS = [
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
];

const BUBBLE_COMPLIMENTS = [
  "Prettiest girl in Indonesia & the universe! 🌸",
  "September 17 was the best day of my life 💖",
  "Sending you 1,000 kiss kiss right now 💋",
  "Sending you the biggest warm hug hug 🤗",
  "I lof lof you so much Ella! 🥰",
  "Best travel partner in the world 🌴",
  "Distance means nothing when you mean everything ✈️",
  "My beautiful Indonesian princess 👑"
];

const PUMP_TEASE_MAP = {
  5: { status: "I want more 💕", toast: "I want more 💕", btn: "PUMP EVEN MORE LOF! 🚀 (+1 Quintillion)" },
  6: { status: "Still not enough! More lof! 🥰", toast: "More lof please! 🥰", btn: "PUMP EVEN MORE LOF! 🚀 (+1 Quintillion)" },
  7: { status: "Almost at infinite lof! Don't stop! 🔥", toast: "Almost there! Keep pumping! 🔥", btn: "PUMP EVEN MORE LOF! 🚀 (+1 Quintillion)" },
  8: { status: "SO CLOSE TO SUPERNOVA! ONE MORE PUMP! 💥", toast: "One more pump! 💥", btn: "PUMP EVEN MORE LOF! 🚀 (+1 Quintillion)" }
};

const KISS_COMBO_LEVELS = [
  { min: 10, toast: "💥 KISS STORM x10! Never enough kisses for sweetheart! 💖💋", status: "⚡ MEGA KISS STORM: Kisses overload across continents! 💋🌪️", flurry: 10, fanfare: true },
  { min: 6, toast: "💋 Rapid-fire kisses! Still NOT ENOUGH kisses for Ella! 😜💋", status: "🔥 Kiss Combo x6! Not enough kisses, keep going! 💋", flurry: 6, fanfare: false },
  { min: 3, toast: "3 kisses? Definitely not enough kisses! Need more! 😘", status: "😏 3 kisses sent... Not enough kisses! More please! 💋", flurry: 3, fanfare: false },
  { min: 1, toast: "Kiss Kiss 💋 Sent to Algeria! (Still not enough kisses! 😉)", status: "💋 Kiss delivered! But is it enough? Never! ❤️", flurry: 1, fanfare: false }
];

const HUG_COMBO_LEVELS = [
  { min: 10, toast: "💥 HUG STORM x10! Infinite warm cuddles wrapped around you! 🤗💖", status: "⚡ MEGA HUG OVERLOAD: Two hearts wrapped together tightly! 🤗✨", flurry: 10, fanfare: true },
  { min: 6, toast: "🤗 Giant bear hug! Squeezing you tight across the miles! 🥰🫂", status: "🔥 Hug Combo x6! Warmest embrace ever! 🤗", flurry: 6, fanfare: false },
  { min: 3, toast: "Triple hugs! Warm cuddle session in full effect! 🤗💕", status: "🥰 3 hugs sent! Cuddle mode fully locked in! 🤗", flurry: 3, fanfare: false },
  { min: 1, toast: "Hug Hug 🤗 Sent from Jakarta to Algeria!", status: "🤗 Warm hug delivered right to your heart! ❤️", flurry: 1, fanfare: false }
];

function getTeasingQuotes() {
  const specialWord = localStorage.getItem("gf_special_word") || "Pupu";
  const name = (typeof state !== "undefined" && state.partnerName) ? state.partnerName : "Ella";
  return [
    `Nice try ${name}! You can't click No 😜`,
    `Error 404: 'No' button unreachable from Jakarta! 💕`,
    `Nope! You're stuck with your Algerian boy forever! 🥰`,
    `Too slow! Try the big pink YES button! 😘`,
    `Our lof bridges Algeria to Indonesia! ✨`,
    `Clicking No is impossible when we lof each other! 💖`,
    `Only 100% YES allowed, my sweet ${specialWord} queen! 👑😂`
  ];
}
