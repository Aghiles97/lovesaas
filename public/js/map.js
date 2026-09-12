// Interactive Map Atlas Switcher & City Pin Engine
function getActiveMapChapters() {
  if (typeof window !== "undefined" && Array.isArray(window.TIMELINE_CHAPTERS)) {
    return window.TIMELINE_CHAPTERS;
  }
  return typeof TIMELINE_CHAPTERS !== "undefined" && Array.isArray(TIMELINE_CHAPTERS) ? TIMELINE_CHAPTERS : [];
}

function setupInteractiveMap() {
  const tabGlobal = document.getElementById("mapTabGlobal");
  const tabChina = document.getElementById("mapTabChina");
  const tabIndonesia = document.getElementById("mapTabIndonesia");
  const autoTourBtn = document.getElementById("autoTourBtn");
  const viewGlobal = document.getElementById("viewGlobalMap");
  const viewChina = document.getElementById("viewChinaMap");
  const viewIndonesia = document.getElementById("viewIndonesiaMap");
  const modal = document.getElementById("mapStoryModal");
  const backdrop = document.getElementById("mapModalBackdrop");
  const popupIcon = document.getElementById("mapPopupIcon");
  const popupTag = document.getElementById("mapPopupTag");
  const popupTitle = document.getElementById("mapPopupTitle");
  const popupDesc = document.getElementById("mapPopupDesc");
  const closeBtn = document.getElementById("closeMapPopup");
  const closeAltBtn = document.getElementById("closePopupAltBtn");
  const likeBtn = document.getElementById("likeMemoryBtn");
  const editCityBtn = document.getElementById("editCityDirectBtn");
  const chipBtns = document.querySelectorAll(".map-chip-btn");

  let currentActiveMemoryKey = "guangzhou";
  let currentActiveSlideIdx = 0;
  let currentActiveSlides = null;
  const chinaCityKeys = ["china-base", "guangzhou", "shenzhen", "chongqing", "chengdu", "bipenggou", "dagu", "jiuzhaigou", "huanglong", "nansha", "wuhan", "nanjing", "shanghai"];
  const chinaTourList = [
    "guangzhou",
    "guangzhou",
    "shenzhen",
    "chongqing",
    "chengdu",
    "bipenggou",
    "dagu",
    "jiuzhaigou",
    "huanglong",
    "chengdu",
    "guangzhou",
    "guangzhou",
    "guangzhou",
    "nansha",
    "guangzhou",
    "wuhan",
    "nanjing",
    "shanghai",
    "guangzhou"
  ];
  const chinaTourChapters = [
    "chap-guangzhou-start",
    "chap-guangzhou-dec",
    "chap-shenzhen",
    "chap-chongqing",
    "chap-chengdu",
    "chap-bipenggou",
    "chap-dagu",
    "chap-jiuzhaigou",
    "chap-huanglong",
    "chap-chengdu-return",
    "chap-guangzhou-cozy",
    "chap-guangzhou-spring",
    "chap-canton-tower-proposal",
    "chap-nansha",
    "chap-baiyun",
    "chap-wuhan",
    "chap-nanjing",
    "chap-shanghai",
    "chap-guangzhou-farewell"
  ];
  const globalTourList = ["algeria", "china-base", "vietnam", "indonesia"];
  const globalTourChapters = [
    "chap-ldr",
    "chap-guangzhou-start",
    "chap-vietnam",
    "chap-bali"
  ];
  const indonesiaTourList = ["bali", "jakarta"];
  const indonesiaTourChapters = ["chap-bali", "chap-jakarta"];

  const getActiveTourList = () => {
    const isChina = tabChina && tabChina.classList.contains("active");
    const isIndo = tabIndonesia && tabIndonesia.classList.contains("active");
    if (typeof window !== "undefined" && Array.isArray(window.MAP_DESTINATIONS) && window.MAP_DESTINATIONS.length > 0) {
      const activeRegion = isChina ? "china" : (isIndo ? "indonesia" : "global");
      const list = window.MAP_DESTINATIONS.filter(d => d.region === activeRegion).map(d => d.key);
      if (list.length > 0) return list;
    }
    return isChina ? chinaTourList : (isIndo ? indonesiaTourList : globalTourList);
  };

  let tourInterval = null;
  let currentTourIndex = 0;

  // Detailed realistic China route segments with Chongqing separation & Chengdu reunion
  const CHINA_SEGMENTS = [
    // 0: Guangzhou -> Shenzhen (Together, ✈️ arrival / tour start)
    { type: "line", from: [560, 360], to: [625, 385], vehicle: "✈️", dur: 1200 },
    // 1: Shenzhen -> Chongqing (Together, 🚄 high-speed train)
    { type: "line", from: [625, 385], to: [420, 290], vehicle: "🚄", dur: 2000 },
    // 2: SEPARATION: Baby flies Chongqing -> Guangzhou by plane (✈️), Boy stays in Chongqing (⛰️)
    {
      type: "separation_1",
      boyPos: [420, 290],
      boyVehicle: "⛰️",
      girlCurve: { start: [420, 290], ctrl: [515, 310], end: [560, 360] },
      girlVehicle: "✈️",
      dur: 2500
    },
    // 3: REUNION: Baby flies Guangzhou -> Chengdu (✈️), Boy rides train Chongqing -> Chengdu (🚄)
    {
      type: "separation_2",
      boyLine: { start: [420, 290], end: [350, 270] },
      boyVehicle: "🚄",
      girlCurve: { start: [560, 360], ctrl: [440, 380], end: [350, 270] },
      girlVehicle: "✈️",
      dur: 2500
    },
    // 4: Reunited at Chengdu -> Bipenggou (Together, 🚌)
    { type: "line", from: [350, 270], to: [305, 235], vehicle: "🚌", dur: 1200 },
    // 5: Bipenggou -> Dagu Glacier (Together, 🚌)
    { type: "line", from: [305, 235], to: [260, 200], vehicle: "🚌", dur: 1200 },
    // 6: Dagu Glacier -> Jiuzhaigou (Together, 🚌)
    { type: "line", from: [260, 200], to: [340, 130], vehicle: "🚌", dur: 1400 },
    // 7: Jiuzhaigou -> Huanglong (Together, 🚌)
    { type: "line", from: [340, 130], to: [310, 165], vehicle: "🚌", dur: 1200 },
    // 8: Huanglong -> Chengdu (Together, 🚌)
    { type: "line", from: [310, 165], to: [350, 270], vehicle: "🚌", dur: 1300 },
    // 9: Chengdu -> Guangzhou (Together, ✈️)
    { type: "quad", start: [350, 270], ctrl: [440, 395], end: [560, 360], vehicle: "✈️", dur: 2100 },
    // 10: Guangzhou -> Nansha (Together, 🚗)
    { type: "line", from: [560, 360], to: [575, 415], vehicle: "🚗", dur: 1100 },
    // 11: Nansha -> Guangzhou (Together, 🚗)
    { type: "line", from: [575, 415], to: [560, 360], vehicle: "🚗", dur: 1100 },
    // 12: Guangzhou -> Wuhan (Together, 🚄)
    { type: "line", from: [560, 360], to: [580, 280], vehicle: "🚄", dur: 1600 },
    // 13: Wuhan -> Nanjing (Together, 🚄)
    { type: "line", from: [580, 280], to: [640, 235], vehicle: "🚄", dur: 1500 },
    // 14: Nanjing -> Shanghai (Together, 🚄)
    { type: "line", from: [640, 235], to: [720, 240], vehicle: "🚄", dur: 1400 },
    // 15: Shanghai -> Guangzhou (Together, ✈️)
    { type: "line", from: [720, 240], to: [560, 360], vehicle: "✈️", dur: 2200 }
  ];

  const CHINA_TOTAL_DURATION = CHINA_SEGMENTS.reduce((acc, s) => acc + s.dur, 0);
  let chinaAnimStartTime = null;
  let indoAnimStartTime = null;
  const INDO_DURATION = 5500;
  let mapAnimRunning = false;
  let lastMapFrameTs = 0;
  let isMapInViewport = false;

  function scheduleMapFrame() {
    if (!mapAnimRunning && isMapInViewport && !document.hidden) {
      mapAnimRunning = true;
      requestAnimationFrame(masterMapAnimationLoop);
    }
  }

  const mapFrameEl = document.getElementById("mapFrame");
  if (mapFrameEl && "IntersectionObserver" in window) {
    const mapObserver = new IntersectionObserver(([entry]) => {
      isMapInViewport = entry.isIntersecting;
      if (isMapInViewport) scheduleMapFrame();
    }, { threshold: 0.05 });
    mapObserver.observe(mapFrameEl);
  } else {
    isMapInViewport = true;
  }

  function masterMapAnimationLoop(timestamp) {
    mapAnimRunning = false;
    if (!isMapInViewport || document.hidden) return;

    const isChinaVisible = viewChina && !viewChina.classList.contains("hidden");
    const isIndoVisible = viewIndonesia && !viewIndonesia.classList.contains("hidden");
    if (!isChinaVisible && !isIndoVisible) return;

    if (timestamp - lastMapFrameTs < 33) {
      scheduleMapFrame();
      return;
    }
    lastMapFrameTs = timestamp;

    if (!chinaAnimStartTime) chinaAnimStartTime = timestamp;
    if (!indoAnimStartTime) indoAnimStartTime = timestamp;

    if (isChinaVisible) {
      const gliderJoint = document.getElementById("chinaTravelersGlider");
      const gliderBoy = document.getElementById("chinaBoyGlider");
      const gliderGirl = document.getElementById("chinaGirlGlider");
      const iconJoint = document.getElementById("chinaTravelerVehicleIcon");
      const iconBoy = document.getElementById("chinaBoyVehicleIcon");
      const iconGirl = document.getElementById("chinaGirlVehicleIcon");

      const elapsed = (timestamp - chinaAnimStartTime) % CHINA_TOTAL_DURATION;
      let rem = elapsed;
      let activeSeg = CHINA_SEGMENTS[0];
      let segProgress = 0;

      for (let i = 0; i < CHINA_SEGMENTS.length; i++) {
        const seg = CHINA_SEGMENTS[i];
        if (rem < seg.dur || i === CHINA_SEGMENTS.length - 1) {
          activeSeg = seg;
          segProgress = Math.min(1, Math.max(0, rem / seg.dur));
          break;
        }
        rem -= seg.dur;
      }

      if (activeSeg.type === "separation_1") {
        if (gliderJoint) gliderJoint.style.display = "none";
        if (gliderBoy) {
          gliderBoy.style.display = "block";
          gliderBoy.setAttribute("transform", `translate(${activeSeg.boyPos[0]}, ${activeSeg.boyPos[1]})`);
          if (iconBoy && iconBoy.textContent !== activeSeg.boyVehicle) iconBoy.textContent = activeSeg.boyVehicle;
        }
        if (gliderGirl) {
          gliderGirl.style.display = "block";
          const { start, ctrl, end } = activeSeg.girlCurve;
          const inv = 1 - segProgress;
          const gx = inv * inv * start[0] + 2 * inv * segProgress * ctrl[0] + segProgress * segProgress * end[0];
          const gy = inv * inv * start[1] + 2 * inv * segProgress * ctrl[1] + segProgress * segProgress * end[1];
          gliderGirl.setAttribute("transform", `translate(${gx}, ${gy})`);
          if (iconGirl && iconGirl.textContent !== activeSeg.girlVehicle) iconGirl.textContent = activeSeg.girlVehicle;
        }
      } else if (activeSeg.type === "separation_2") {
        if (gliderJoint) gliderJoint.style.display = "none";
        if (gliderBoy) {
          gliderBoy.style.display = "block";
          const { start, end } = activeSeg.boyLine;
          const bx = start[0] + (end[0] - start[0]) * segProgress;
          const by = start[1] + (end[1] - start[1]) * segProgress;
          gliderBoy.setAttribute("transform", `translate(${bx}, ${by})`);
          if (iconBoy && iconBoy.textContent !== activeSeg.boyVehicle) iconBoy.textContent = activeSeg.boyVehicle;
        }
        if (gliderGirl) {
          gliderGirl.style.display = "block";
          const { start, ctrl, end } = activeSeg.girlCurve;
          const inv = 1 - segProgress;
          const gx = inv * inv * start[0] + 2 * inv * segProgress * ctrl[0] + segProgress * segProgress * end[0];
          const gy = inv * inv * start[1] + 2 * inv * segProgress * ctrl[1] + segProgress * segProgress * end[1];
          gliderGirl.setAttribute("transform", `translate(${gx}, ${gy})`);
          if (iconGirl && iconGirl.textContent !== activeSeg.girlVehicle) iconGirl.textContent = activeSeg.girlVehicle;
        }
      } else {
        if (gliderBoy) gliderBoy.style.display = "none";
        if (gliderGirl) gliderGirl.style.display = "none";
        if (gliderJoint) {
          gliderJoint.style.display = "block";
          let jx = 560, jy = 360;
          if (activeSeg.type === "line") {
            jx = activeSeg.from[0] + (activeSeg.to[0] - activeSeg.from[0]) * segProgress;
            jy = activeSeg.from[1] + (activeSeg.to[1] - activeSeg.from[1]) * segProgress;
          } else if (activeSeg.type === "quad") {
            const { start, ctrl, end } = activeSeg;
            const inv = 1 - segProgress;
            jx = inv * inv * start[0] + 2 * inv * segProgress * ctrl[0] + segProgress * segProgress * end[0];
            jy = inv * inv * start[1] + 2 * inv * segProgress * ctrl[1] + segProgress * segProgress * end[1];
          }
          gliderJoint.setAttribute("transform", `translate(${jx}, ${jy})`);
          if (iconJoint && iconJoint.textContent !== activeSeg.vehicle) {
            iconJoint.textContent = activeSeg.vehicle;
          }
        }
      }
    }

    if (isIndoVisible) {
      const path = document.getElementById("indoFlightRouteTrack");
      const glider = document.getElementById("indoTravelersGlider");
      const icon = document.getElementById("indoTravelerVehicleIcon");
      if (path && glider) {
        const totalLen = path.getTotalLength();
        const ONE_WAY = 5500;
        const DWELL = 700;
        const FLIGHT_TIME = ONE_WAY - 2 * DWELL;
        const cycle = (timestamp - indoAnimStartTime) % (ONE_WAY * 2);
        const isForward = cycle < ONE_WAY;
        const phaseTime = isForward ? cycle : (cycle - ONE_WAY);

        let progress = 0;
        let neededIcon = "✈️";

        if (phaseTime < DWELL) {
          progress = isForward ? 0 : 1;
          neededIcon = isForward ? "🌴" : "🏡";
        } else if (phaseTime < DWELL + FLIGHT_TIME) {
          const flightRatio = (phaseTime - DWELL) / FLIGHT_TIME;
          progress = isForward ? flightRatio : (1 - flightRatio);
          neededIcon = "✈️";
        } else {
          progress = isForward ? 1 : 0;
          neededIcon = isForward ? "🏡" : "🌴";
        }

        if (icon && icon.textContent !== neededIcon) {
          icon.textContent = neededIcon;
        }

        const pt = path.getPointAtLength(progress * totalLen);
        glider.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
      }
    }

    scheduleMapFrame();
  }

  const closePopup = () => {
    if (tourInterval) {
      clearInterval(tourInterval);
      tourInterval = null;
      if (autoTourBtn) autoTourBtn.innerHTML = "<span>▶️ Auto Tour</span>";
    }
    if (modal) modal.classList.add("hidden");
  };

  const restartMapAnimation = (tab) => {
    chinaAnimStartTime = performance.now();
    indoAnimStartTime = performance.now();
    scheduleMapFrame();
    setTimeout(() => {
      try {
        const svgGlobal = document.getElementById("svgGlobalMap");
        const animGlobal = document.getElementById("globalFlightAnim");
        if (tab === "global" && svgGlobal && typeof svgGlobal.setCurrentTime === "function") {
          svgGlobal.setCurrentTime(0);
        }
        if (tab === "global" && animGlobal && typeof animGlobal.beginElement === "function") {
          animGlobal.beginElement();
        }
      } catch (e) {}
    }, 60);
  };

  const switchTab = (tab) => {
    const isChina = (tab === "china");
    const isIndo = (tab === "indonesia");
    const isGlobal = (tab === "global");

    if (tabChina) tabChina.classList.toggle("active", isChina);
    if (tabIndonesia) tabIndonesia.classList.toggle("active", isIndo);
    if (tabGlobal) tabGlobal.classList.toggle("active", isGlobal);

    if (viewChina) {
      viewChina.classList.toggle("active", isChina);
      viewChina.classList.toggle("hidden", !isChina);
    }
    if (viewIndonesia) {
      viewIndonesia.classList.toggle("active", isIndo);
      viewIndonesia.classList.toggle("hidden", !isIndo);
    }
    if (viewGlobal) {
      viewGlobal.classList.toggle("active", isGlobal);
      viewGlobal.classList.toggle("hidden", !isGlobal);
    }

    if (isIndo) {
      restartMapAnimation("indonesia");
    } else if (isChina) {
      restartMapAnimation("china");
    } else if (isGlobal) {
      restartMapAnimation("global");
    }

    // Filter quick chips to match active journey
    chipBtns.forEach(btn => {
      const journey = btn.getAttribute("data-journey");
      const match = (journey === tab);
      btn.classList.toggle("hidden-chip", !match);
    });

    restartMapAnimation(tab);

    const activeCanvas = document.querySelector(".map-view.active .cartoony-map-canvas");
    if (activeCanvas && window.innerWidth <= 640) {
      setTimeout(() => {
        const ratio = tab === "global" ? 0.3 : 0.45;
        activeCanvas.scrollTo({
          left: Math.max(0, (activeCanvas.scrollWidth - activeCanvas.clientWidth) * ratio),
          behavior: "smooth"
        });
      }, 50);
    }
  };

  const displayCityMemory = (key, originRect, tourIdx) => {
    if (key === "china-base") {
      switchTab("china");
      closePopup();
      audio.playSparkle();
      const mapFrame = document.getElementById("mapFrame");
      if (mapFrame) {
        mapFrame.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      const x = originRect ? originRect.left + originRect.width / 2 : window.innerWidth / 2;
      const y = originRect ? originRect.top + originRect.height / 2 : window.innerHeight / 2;
      particles.burst(x, y, 30);
      showComplimentToast(x, y, "🚄 Switched to China Journey! 🇨🇳");
      return;
    }

    if (key === "indonesia") {
      switchTab("indonesia");
      closePopup();
      audio.playSparkle();
      const mapFrame = document.getElementById("mapFrame");
      if (mapFrame) {
        mapFrame.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      const x = originRect ? originRect.left + originRect.width / 2 : window.innerWidth / 2;
      const y = originRect ? originRect.top + originRect.height / 2 : window.innerHeight / 2;
      particles.burst(x, y, 30);
      showComplimentToast(x, y, "🌴 Switched to Indonesia Journey! 🇮🇩");
      return;
    }

    currentActiveMemoryKey = key;
    const story = CITY_STORIES[key] || CITY_STORIES["guangzhou"];
    if (!story || !modal) return;

    if (key === "bali" || key === "jakarta") {
      switchTab("indonesia");
    } else if (key === "guangzhou" || chinaCityKeys.includes(key)) {
      switchTab("china");
    } else {
      switchTab("global");
    }

    const isChina = tabChina && tabChina.classList.contains("active");
    const isIndo = tabIndonesia && tabIndonesia.classList.contains("active");
    const activeTour = getActiveTourList();

    if (tourIdx !== undefined && tourIdx >= 0 && tourIdx < activeTour.length) {
      currentTourIndex = tourIdx;
    } else if (activeTour[currentTourIndex] !== key) {
      const found = activeTour.indexOf(key);
      currentTourIndex = found >= 0 ? found : 0;
    }

    // Scroll smoothly to map view
    const mapFrame = document.getElementById("mapFrame");
    if (mapFrame) {
      mapFrame.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Highlight chip & scroll into view horizontally
    document.querySelectorAll(".map-chip-btn").forEach(btn => {
      const matchCity = btn.getAttribute("data-city") === key;
      const stopAttr = btn.getAttribute("data-stop");
      const matchStop = stopAttr ? (parseInt(stopAttr, 10) === currentTourIndex + 1) : matchCity;
      const isActive = (isChina || isIndo) ? (matchCity && matchStop) : matchCity;
      btn.classList.toggle("active", isActive);
      if (isActive) {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });

    const activePin = document.querySelector(`.map-view.active [data-city="${key}"]`);
    const activeCanvas = document.querySelector(".map-view.active .cartoony-map-canvas");
    if (activePin && activeCanvas && window.innerWidth <= 640) {
      const pinRect = activePin.getBoundingClientRect();
      const canvasRect = activeCanvas.getBoundingClientRect();
      const targetLeft = activeCanvas.scrollLeft + (pinRect.left - canvasRect.left) - (activeCanvas.clientWidth / 2);
      activeCanvas.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }

    const tourChapters = isChina ? chinaTourChapters : (isIndo ? indonesiaTourChapters : globalTourChapters);
    const currentChapterId = tourChapters[currentTourIndex] || CITY_TO_CHAPTER_MAP[key] || "chap-guangzhou-start";
    const photoData = getCityPhotoData(currentChapterId, key);

    const formatTeaserDesc = (text, limit = 110) => {
      if (!text) return "";
      const trimmed = text.trim();
      if (trimmed.length <= limit) return trimmed;
      const cut = trimmed.substring(0, limit);
      const lastSpace = cut.lastIndexOf(" ");
      return (lastSpace > 50 ? cut.substring(0, lastSpace) : cut) + "...";
    };

    const currentChapter = tourChapters[currentTourIndex] ? getActiveMapChapters().find(c => c.id === tourChapters[currentTourIndex]) : null;
    popupIcon.textContent = story.icon;
    popupTag.textContent = story.tag;
    popupTitle.textContent = story.title;

    const popupVehicle = document.getElementById("mapPopupVehicle");
    if (popupVehicle) {
      const VEHICLE_LABELS = {
        airplane: "✈️ Flight Route",
        flight: "✈️ Flight Route",
        car: "🚗 Road Trip",
        train: "🚆 High-Speed Rail",
        bike: "🚲 Bike Ride",
        boat: "🚢 Cruise / Boat",
        walk: "🥾 Walking / Hike",
        hike: "🥾 Mountain Hike"
      };
      let vMode = story.vehicle;
      if (!vMode && typeof window !== "undefined" && Array.isArray(window.MAP_DESTINATIONS)) {
        const dObj = window.MAP_DESTINATIONS.find(d => d.key === key);
        if (dObj && dObj.vehicle) vMode = dObj.vehicle;
      }
      if (!vMode) {
        const activeChip = document.querySelector(`.map-chip-btn[data-city="${key}"]`);
        if (activeChip) vMode = activeChip.getAttribute("data-vehicle");
      }
      if (!vMode) {
        const k = key.toLowerCase();
        if (["nansha", "bipenggou", "dagu", "jiuzhaigou"].includes(k)) vMode = "car";
        else if (k === "huanglong") vMode = "walk";
        else if (k === "wuhan") vMode = "bike";
        else if (["shenzhen", "chongqing", "chengdu", "nanjing", "shanghai"].includes(k)) vMode = "train";
        else vMode = "airplane";
      }
      popupVehicle.textContent = VEHICLE_LABELS[vMode] || (vMode.includes(" ") ? vMode : `✈️ ${vMode}`);
    }

    const rawChapterDesc = (photoData.desc && photoData.desc.trim()) ? photoData.desc : ((currentChapter && currentChapter.desc) ? currentChapter.desc : story.desc);
    popupDesc.textContent = formatTeaserDesc(rawChapterDesc);
    if (likeBtn) likeBtn.innerHTML = "<span>💖 I Lof This Memory!</span>";

    const ctaBtn = document.getElementById("mapOpenChapterDetailCtaBtn");
    if (ctaBtn) {
      ctaBtn.onclick = (e) => {
        e.stopPropagation();
        closePopup();
        openStoryChapterDetailModal(currentChapterId, key);
        audio.playChimeCascade();
      };
    }

    // Polaroid Photo, Multi-Image Slider & Caption
    const storyImg = document.getElementById("mapStoryImg");
    const storyCaption = document.getElementById("mapStoryCaption");
    const polaroidCard = document.getElementById("mapPolaroidCard");
    const prevSlideBtn = document.getElementById("mapImgSliderPrev");
    const nextSlideBtn = document.getElementById("mapImgSliderNext");
    const dotsContainer = document.getElementById("mapImgSliderDots");

    let slides = null;
    if (photoData.images && photoData.images.length > 1) {
      slides = photoData.images.map((im, idx) => ({
        chapterId: currentChapterId,
        cityKey: key,
        img: im,
        caption: (idx === 0) ? (photoData.caption || story.title) : `${photoData.caption || story.title} (${idx + 1}/${photoData.images.length})`,
        desc: photoData.desc || story.desc
      }));
    } else if (key === "indonesia") {
      const baliData = getCityPhotoData("chap-bali", "bali");
      const jakartaData = getCityPhotoData("chap-jakarta", "jakarta");
      const indoData = getCityPhotoData("chap-indonesia", "indonesia");
      slides = [];
      if (LOCAL_IMG_CACHE["city_indonesia"]) {
        slides.push({
          chapterId: "chap-bali",
          cityKey: "indonesia",
          img: LOCAL_IMG_CACHE["city_indonesia"],
          caption: indoData.caption || "Indonesia (Bali & Jakarta) 🇮🇩💖",
          desc: indoData.desc
        });
      }
      slides.push({
        chapterId: "chap-bali",
        cityKey: "bali",
        img: baliData.img,
        caption: baliData.caption || "Holding hands on Bali sunset beaches 🌴🌅",
        desc: baliData.desc
      });
      slides.push({
        chapterId: "chap-jakarta",
        cityKey: "jakarta",
        img: jakartaData.img,
        caption: jakartaData.caption || "At home with you in Jakarta 🏡💕",
        desc: jakartaData.desc
      });
    }

    currentActiveSlides = slides;
    currentActiveSlideIdx = 0;

    const renderCurrentSlide = () => {
      if (storyImg) {
        storyImg.onerror = function() {
          if (this.dataset.tried !== "1") {
            this.dataset.tried = "1";
            this.src = photoData.svgFallback || generateDefaultCitySvg(key);
          }
        };
      }
      if (slides && slides.length > 1) {
        const cur = slides[currentActiveSlideIdx];
        if (storyImg) storyImg.src = cur.img;
        if (storyCaption) storyCaption.textContent = cur.caption;
        if (popupDesc && cur.desc) popupDesc.textContent = formatTeaserDesc(cur.desc);
        if (prevSlideBtn) prevSlideBtn.classList.remove("hidden");
        if (nextSlideBtn) nextSlideBtn.classList.remove("hidden");
        if (dotsContainer) {
          dotsContainer.classList.remove("hidden");
          dotsContainer.innerHTML = slides.map((_, i) => 
            `<span class="map-slider-dot ${i === currentActiveSlideIdx ? 'active' : ''}" data-idx="${i}"></span>`
          ).join("");
          dotsContainer.querySelectorAll(".map-slider-dot").forEach(d => {
            d.onclick = (e) => {
              e.stopPropagation();
              currentActiveSlideIdx = parseInt(d.getAttribute("data-idx"), 10);
              renderCurrentSlide();
              audio.playPop();
            };
          });
        }
      } else {
        if (storyImg) storyImg.src = photoData.img;
        if (storyCaption) storyCaption.textContent = photoData.caption;
        if (popupDesc) popupDesc.textContent = formatTeaserDesc(photoData.desc || story.desc);
        if (prevSlideBtn) prevSlideBtn.classList.add("hidden");
        if (nextSlideBtn) nextSlideBtn.classList.add("hidden");
        if (dotsContainer) dotsContainer.classList.add("hidden");
      }
    };

    renderCurrentSlide();

    if (prevSlideBtn) {
      prevSlideBtn.onclick = (e) => {
        e.stopPropagation();
        if (!slides || slides.length <= 1) return;
        currentActiveSlideIdx = (currentActiveSlideIdx - 1 + slides.length) % slides.length;
        renderCurrentSlide();
        audio.playPop();
      };
    }

    if (nextSlideBtn) {
      nextSlideBtn.onclick = (e) => {
        e.stopPropagation();
        if (!slides || slides.length <= 1) return;
        currentActiveSlideIdx = (currentActiveSlideIdx + 1) % slides.length;
        renderCurrentSlide();
        audio.playPop();
      };
    }

    if (polaroidCard) {
      polaroidCard.onclick = (e) => {
        if (e.target.closest(".map-slider-nav-btn") || e.target.closest(".map-slider-dot")) return;
        e.stopPropagation();
        const activeImg = (slides && slides[currentActiveSlideIdx]) ? slides[currentActiveSlideIdx].img : photoData.img;
        const activeCap = (slides && slides[currentActiveSlideIdx]) ? slides[currentActiveSlideIdx].caption : photoData.caption;
        const activeDesc = (slides && slides[currentActiveSlideIdx]) ? (slides[currentActiveSlideIdx].desc || story.desc) : (photoData.desc || story.desc);
        openLightbox({
          img: activeImg,
          title: `${story.title} — ${activeCap}`,
          desc: activeDesc
        });
      };
    }
    
    // Update Destination Counter
    const counterEl = document.getElementById("cityStepCounter");
    if (counterEl) {
      if (!isChina && !isIndo) {
        if (currentTourIndex === 0) {
          counterEl.textContent = "Boy's Origin • Algeria 🇩🇿 (Ella's Next Trip!)";
        } else {
          counterEl.textContent = `Country ${currentTourIndex} of 3 • Hand-in-Hand`;
        }
      } else {
        counterEl.textContent = `Destination ${currentTourIndex + 1} of ${activeTour.length}`;
      }
    }
    
    modal.classList.remove("hidden");

    audio.playSparkle();
    const x = originRect ? originRect.left + originRect.width / 2 : window.innerWidth / 2;
    const y = originRect ? originRect.top + originRect.height / 2 : window.innerHeight / 2;
    particles.burst(x, y, 30);
  };

  window.showMapCityStory = displayCityMemory;

  const spotlightMapCity = (key) => {
    if (!key) return;

    if (key === "bali" || key === "jakarta" || key === "indonesia") {
      switchTab("indonesia");
    } else if (chinaCityKeys.includes(key) || key === "guangzhou") {
      switchTab("china");
    } else {
      switchTab("global");
    }

    const mapFrame = document.getElementById("mapFrame") || document.querySelector(".map-section");
    if (mapFrame) {
      mapFrame.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    chipBtns.forEach(btn => {
      const isMatch = btn.getAttribute("data-city") === key;
      btn.classList.toggle("active", isMatch);
      if (isMatch) {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });

    setTimeout(() => {
      const activeView = document.querySelector(".map-view.active");
      if (!activeView) return;
      const pin = activeView.querySelector(`[data-city="${key}"]`);
      const canvas = activeView.querySelector(".cartoony-map-canvas");

      if (pin && canvas) {
        const pinRect = pin.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const targetLeft = canvas.scrollLeft + (pinRect.left - canvasRect.left) - (canvas.clientWidth / 2) + (pinRect.width / 2);
        canvas.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
      }

      if (pin) {
        pin.classList.remove("pin-spotlight-pulse");
        void pin.offsetWidth;
        pin.classList.add("pin-spotlight-pulse");

        setTimeout(() => {
          if (pin) pin.classList.remove("pin-spotlight-pulse");
        }, 3000);

        const rect = pin.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        document.querySelectorAll(".map-spotlight-beacon-marker").forEach(m => m.remove());

        const story = CITY_STORIES[key];
        const label = story ? `${story.icon} ${story.title}` : `📍 ${key.toUpperCase()}`;

        const beacon = document.createElement("div");
        beacon.className = "map-spotlight-beacon-marker";
        beacon.style.left = `${cx}px`;
        beacon.style.top = `${cy}px`;
        beacon.innerHTML = `
          <div class="beacon-pin-head">📍</div>
          <div class="beacon-pin-label">${label}</div>
          <div class="beacon-pin-ripple"></div>
        `;
        document.body.appendChild(beacon);

        setTimeout(() => {
          if (beacon.parentNode) beacon.parentNode.removeChild(beacon);
        }, 3000);

        if (typeof particles !== "undefined" && particles.burst) {
          particles.burst(cx, cy, 35);
        }
        if (typeof audio !== "undefined" && audio.playChimeCascade) {
          audio.playChimeCascade();
        }
      }
    }, 400);
  };

  window.spotlightMapCity = spotlightMapCity;

  // Prev / Next Destination Navigation in Modal
  const prevCityBtn = document.getElementById("prevCityBtn");
  const nextCityBtn = document.getElementById("nextCityBtn");
  if (prevCityBtn) {
    prevCityBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const activeTour = getActiveTourList();
      currentTourIndex = (currentTourIndex <= 0) ? activeTour.length - 1 : currentTourIndex - 1;
      displayCityMemory(activeTour[currentTourIndex], null, currentTourIndex);
      audio.playPop();
    });
  }
  if (nextCityBtn) {
    nextCityBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const activeTour = getActiveTourList();
      currentTourIndex = (currentTourIndex >= activeTour.length - 1) ? 0 : currentTourIndex + 1;
      displayCityMemory(activeTour[currentTourIndex], null, currentTourIndex);
      audio.playPop();
    });
  }

  if (tabGlobal) {
    tabGlobal.addEventListener("click", () => {
      switchTab("global");
      currentTourIndex = 0;
      closePopup();
      audio.playPop();
    });
  }

  if (tabChina) {
    tabChina.addEventListener("click", () => {
      switchTab("china");
      currentTourIndex = 0;
      closePopup();
      audio.playPop();
    });
  }

  if (tabIndonesia) {
    tabIndonesia.addEventListener("click", () => {
      switchTab("indonesia");
      currentTourIndex = 0;
      closePopup();
      audio.playPop();
    });
  }

  // Quick Chips Buttons (Delegated)
  const quickChipsScroll = document.getElementById("quickChipsScroll");
  if (quickChipsScroll) {
    quickChipsScroll.addEventListener("click", (e) => {
      const btn = e.target.closest(".map-chip-btn");
      if (!btn) return;
      e.stopPropagation();
      const key = btn.getAttribute("data-city");
      const stopAttr = btn.getAttribute("data-stop");
      const stopIdx = stopAttr ? parseInt(stopAttr, 10) - 1 : undefined;
      displayCityMemory(key, btn.getBoundingClientRect(), stopIdx);
    });
  }

  // SVG Pins (Delegated)
  const mapFrameElDelegated = document.getElementById("mapFrame");
  if (mapFrameElDelegated) {
    mapFrameElDelegated.addEventListener("click", (e) => {
      const pin = e.target.closest(".map-pin-group, .china-city-pin, .indo-city-pin");
      if (!pin) return;
      e.stopPropagation();
      const key = pin.getAttribute("data-city");
      if (key) displayCityMemory(key, pin.getBoundingClientRect());
    });
  }

  // Animated Flight & Rail Route Lines
  const routeLines = document.querySelectorAll(".flight-path-curve, .map-route-line");
  routeLines.forEach(line => {
    line.style.cursor = "pointer";
    line.addEventListener("click", (e) => {
      e.stopPropagation();
      audio.playChimeCascade();
      const rect = line.getBoundingClientRect();
      particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
      const id = line.id;
      if (id === "indoFlightRouteTrack") {
        showComplimentToast(rect.left + rect.width / 2, rect.top + rect.height / 2, "✈️ 980+ km: Flying hand-in-hand from Bali to Jakarta! 🌴🇮🇩");
      } else if (id === "routeAlgToChina") {
        showComplimentToast(rect.left + rect.width / 2, rect.top + rect.height / 2, "✈️ 10,250 km: Algiers ⇄ China flight path across continents! 🇩🇿🇨🇳");
      } else if (id === "routeChinaToViet") {
        showComplimentToast(rect.left + rect.width / 2, rect.top + rect.height / 2, "✈️ 1,600 km: China to Vietnam 16h layover adventure! 🇻🇳🏃‍♂️");
      } else if (id === "routeVietToIndo") {
        showComplimentToast(rect.left + rect.width / 2, rect.top + rect.height / 2, "✈️ 3,120 km: Flying from Vietnam to tropical Bali! 🌴🇮🇩");
      } else {
        showComplimentToast(rect.left + rect.width / 2, rect.top + rect.height / 2, "🚄 Romantic Journey Path Connected! 💕");
      }
    });
  });

  // Flight Mileage Breakdown Modal Engine
  const distModal = document.getElementById("mapDistanceBreakdownModal");
  const distBackdrop = document.getElementById("mapDistanceModalBackdrop");
  const distCloseBtn = document.getElementById("closeDistanceModalBtn");
  const openDistanceModal = (e) => {
    if (e) e.stopPropagation();
    if (distModal) distModal.classList.remove("hidden");
    if (audio && audio.playChimeCascade) audio.playChimeCascade();
    particles.burst(window.innerWidth / 2, window.innerHeight / 2, 35);
  };
  const closeDistanceModal = () => {
    if (distModal) distModal.classList.add("hidden");
    if (audio && audio.playPop) audio.playPop();
  };
  const globalDistPill = document.getElementById("globalFlightKmPill");
  const globalDistBadge = document.getElementById("globalKmOverlayBadge");
  if (globalDistPill) globalDistPill.addEventListener("click", openDistanceModal);
  if (globalDistBadge) globalDistBadge.addEventListener("click", openDistanceModal);
  if (distBackdrop) distBackdrop.addEventListener("click", closeDistanceModal);
  if (distCloseBtn) distCloseBtn.addEventListener("click", closeDistanceModal);

  // Indonesia Kilometer Stat Interactions
  const indoKmPill = document.getElementById("indoFlightKmPill");
  const indoKmBadge = document.getElementById("indoKmOverlayBadge");
  const triggerIndoKmToast = (e) => {
    if (e) e.stopPropagation();
    if (audio && audio.playSparkle) audio.playSparkle();
    const rect = (e && e.currentTarget) ? e.currentTarget.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    particles.burst(x, y, 25);
    showComplimentToast(x, y, "✈️ 980+ km: Flying hand-in-hand from Bali to Jakarta! 🌴🇮🇩");
  };
  if (indoKmPill) indoKmPill.addEventListener("click", triggerIndoKmToast);
  if (indoKmBadge) indoKmBadge.addEventListener("click", triggerIndoKmToast);

  // Bali Jet Ski Icon Interaction
  const jetskiIcon = document.querySelector(".map-jetski-icon");
  if (jetskiIcon) {
    jetskiIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      audio.playSparkle();
      const rect = jetskiIcon.getBoundingClientRect();
      particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);
      showComplimentToast(rect.left + rect.width / 2, rect.top + rect.height / 2, "🌊 Jet Skiing Across Bali Waves with Baby! 🚤💨");
    });
  }

  // Auto-Tour Button
  if (autoTourBtn) {
    autoTourBtn.addEventListener("click", () => {
      if (tourInterval) {
        closePopup();
      } else {
        autoTourBtn.innerHTML = "<span>⏹️ Stop Tour</span>";
        audio.playFanfare();

        const stepTour = () => {
          const isChina = tabChina && tabChina.classList.contains("active");
          const isIndo = tabIndonesia && tabIndonesia.classList.contains("active");
          const currTour = getActiveTourList();
          const activeJourney = isChina ? 'china' : (isIndo ? 'indonesia' : 'global');
          if (currentTourIndex >= currTour.length) currentTourIndex = 0;
          const key = currTour[currentTourIndex];
          const chip = document.querySelector(`.map-chip-btn[data-journey="${activeJourney}"][data-stop="${currentTourIndex + 1}"]`) || document.querySelector(`.map-chip-btn[data-city="${key}"]`);
          const pin = document.querySelector(`[data-city="${key}"]`);
          const target = chip || pin;
          displayCityMemory(key, target ? target.getBoundingClientRect() : null, currentTourIndex);
          currentTourIndex = (currentTourIndex + 1) % currTour.length;
        };

        stepTour();
        tourInterval = setInterval(stepTour, 3800);
      }
    });
  }

  // Initial tab setup
  switchTab("global");

  // Like Memory Button
  if (likeBtn) {
    likeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.bonusLof += 50000000000000;
      likeBtn.innerHTML = "<span>💖 Lof Sent to This Memory! 🥰</span>";
      audio.playChimeCascade();
      const rect = likeBtn.getBoundingClientRect();
      particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
    });
  }

  if (editCityBtn) {
    editCityBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const activeSlide = currentActiveSlides && currentActiveSlides[currentActiveSlideIdx];
      const isChina = tabChina && tabChina.classList.contains("active");
      const isIndo = tabIndonesia && tabIndonesia.classList.contains("active");
      const tourChapters = isChina ? chinaTourChapters : (isIndo ? indonesiaTourChapters : globalTourChapters);
      const targetChapterId = activeSlide ? activeSlide.chapterId : (tourChapters[currentTourIndex] || CITY_TO_CHAPTER_MAP[currentActiveMemoryKey] || "chap-guangzhou-start");
      const targetCityKey = activeSlide ? activeSlide.cityKey : currentActiveMemoryKey;
      openDirectChapterEditor(targetChapterId, targetCityKey);
    });
  }

  const CITY_TO_CHAPTER_MAP = {
    "guangzhou": "chap-guangzhou-start",
    "china-base": "chap-guangzhou-start",
    "algeria": "chap-ldr",
    "vietnam": "chap-vietnam",
    "indonesia": "chap-bali",
    "bali": "chap-bali",
    "jakarta": "chap-jakarta",
    "nansha": "chap-nansha",
    "wuhan": "chap-wuhan",
    "nanjing": "chap-nanjing",
    "dagu": "chap-dagu",
    "bipenggou": "chap-bipenggou",
    "huanglong": "chap-huanglong",
    "jiuzhaigou": "chap-jiuzhaigou",
    "chengdu": "chap-chengdu",
    "chongqing": "chap-chongqing",
    "shanghai": "chap-shanghai",
    "shenzhen": "chap-shenzhen"
  };

  // Story Chapter Detail Modal Engine (Full Detailed Story Window)
  const detailModal = document.getElementById("storyChapterDetailModal");
  const detailBackdrop = document.getElementById("storyChapterBackdrop");
  const detailCloseBtn = document.getElementById("closeChapterDetailBtn");
  const detailCloseAltBtn = document.getElementById("closeChapterDetailAltBtn");
  const detailFlag = document.getElementById("chapterDetailFlag");
  const detailCountry = document.getElementById("chapterDetailCountry");
  const detailCity = document.getElementById("chapterDetailCity");
  const detailTag = document.getElementById("chapterDetailTag");
  const detailLoc = document.getElementById("chapterDetailLoc");
  const detailTabs = document.getElementById("chapterDetailTabs");
  const detailIcon = document.getElementById("chapterDetailIcon");
  const detailTitle = document.getElementById("chapterDetailTitle");
  const detailPhotoWrap = document.getElementById("chapterDetailPhotoWrap");
  const detailImg = document.getElementById("chapterDetailImg");
  const detailCaption = document.getElementById("chapterDetailCaption");
  const detailText = document.getElementById("chapterDetailText");
  const detailHighlights = document.getElementById("chapterDetailHighlights");
  const prevChapterBtn = document.getElementById("prevChapterBtn");
  const nextChapterBtn = document.getElementById("nextChapterBtn");
  const chapterStepCounter = document.getElementById("chapterStepCounter");
  const backToMapPostcardBtn = document.getElementById("backToMapPostcardBtn");
  const editChapterFromDetailBtn = document.getElementById("editChapterFromDetailBtn");

  const closeStoryChapterDetailModal = () => {
    if (detailModal) detailModal.classList.add("hidden");
  };

  const openStoryChapterDetailModal = (chapterId, fallbackCityKey, initialPhotoIdx = 0) => {
    const allChapters = getActiveMapChapters();
    let ch = allChapters.find(c => c.id === chapterId);
    if (!ch && fallbackCityKey) {
      ch = allChapters.find(c => c.cityKey === fallbackCityKey);
    }
    if (!ch) ch = allChapters[0];
    if (!ch) return;

    const chIdx = allChapters.findIndex(c => c.id === ch.id);
    const totalChapters = allChapters.length;

    const cleanChapterTag = (str) => {
      if (!str) return "";
      return str
        .replace(/(\s*•\s*)?(✈️|🚄|🚌|🚗|Train|Airplane|Flight|Bus|Didi)\b[^\w•]*/gi, "")
        .replace(/\b\d{1,2}\s*(?:—|-|to)\s*\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\b/gi, "")
        .replace(/\b\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\b/gi, "")
        .replace(/^[•\s—-]+|[•\s—-]+$/g, "")
        .trim();
    };

    if (detailFlag) detailFlag.textContent = ch.countryFlag || "🇨🇳";
    if (detailCountry) detailCountry.textContent = (ch.country || "CHINA").toUpperCase();
    if (detailCity) detailCity.textContent = ch.city || ch.location;
    const tagText = cleanChapterTag(ch.tag);
    if (detailTag) {
      if (tagText) {
        detailTag.textContent = tagText;
        detailTag.classList.remove("hidden");
      } else {
        detailTag.textContent = "";
        detailTag.classList.add("hidden");
      }
    }
    if (detailLoc) detailLoc.textContent = `📍 ${ch.location}`;
    if (detailIcon) detailIcon.textContent = ch.icon;
    if (detailTitle) detailTitle.textContent = ch.title;

    if (detailTabs) {
      detailTabs.classList.add("hidden");
      detailTabs.innerHTML = "";
    }

    const photoData = getCityPhotoData(ch.id, ch.cityKey);
    const detailPhotoPrevBtn = document.getElementById("chapterDetailPrevPhotoBtn");
    const detailPhotoNextBtn = document.getElementById("chapterDetailNextPhotoBtn");
    const detailPhotoCounter = document.getElementById("chapterDetailPhotoCounter");
    const detailPhotoDots = document.getElementById("chapterDetailPhotoDots");

    const imgList = (photoData.images && photoData.images.length > 0)
      ? photoData.images
      : (photoData.img ? [photoData.img] : []);

    let activeDetailPhotoIdx = (typeof initialPhotoIdx === "number" && initialPhotoIdx >= 0 && initialPhotoIdx < imgList.length) ? initialPhotoIdx : 0;

    const renderDetailPhoto = () => {
      const currentImg = imgList[activeDetailPhotoIdx] || photoData.svgFallback || generateDefaultCitySvg(ch.cityKey);
      if (detailImg) {
        detailImg.onerror = function() {
          if (this.dataset.tried !== "1") {
            this.dataset.tried = "1";
            this.src = photoData.svgFallback || generateDefaultCitySvg(ch.cityKey);
          }
        };
        detailImg.src = currentImg;
        detailImg.alt = ch.title;
      }
      if (detailCaption) {
        detailCaption.textContent = "";
      }
      if (detailPhotoCounter) {
        if (imgList.length > 1) {
          detailPhotoCounter.classList.remove("hidden");
          detailPhotoCounter.textContent = `📷 ${activeDetailPhotoIdx + 1} / ${imgList.length}`;
        } else {
          detailPhotoCounter.classList.add("hidden");
        }
      }
      if (detailPhotoPrevBtn) detailPhotoPrevBtn.classList.toggle("hidden", imgList.length <= 1);
      if (detailPhotoNextBtn) detailPhotoNextBtn.classList.toggle("hidden", imgList.length <= 1);

      if (detailPhotoDots) {
        if (imgList.length > 1) {
          detailPhotoDots.classList.remove("hidden");
          detailPhotoDots.innerHTML = imgList.map((_, i) =>
            `<span class="map-slider-dot ${i === activeDetailPhotoIdx ? 'active' : ''}" data-idx="${i}"></span>`
          ).join("");
          detailPhotoDots.querySelectorAll(".map-slider-dot").forEach(dot => {
            dot.onclick = (e) => {
              e.stopPropagation();
              activeDetailPhotoIdx = parseInt(dot.getAttribute("data-idx"), 10);
              renderDetailPhoto();
              audio.playPop();
            };
          });
        } else {
          detailPhotoDots.classList.add("hidden");
          detailPhotoDots.innerHTML = "";
        }
      }
    };

    renderDetailPhoto();

    if (detailPhotoPrevBtn) {
      detailPhotoPrevBtn.onclick = (e) => {
        e.stopPropagation();
        if (imgList.length <= 1) return;
        activeDetailPhotoIdx = (activeDetailPhotoIdx - 1 + imgList.length) % imgList.length;
        renderDetailPhoto();
        audio.playPop();
      };
    }

    if (detailPhotoNextBtn) {
      detailPhotoNextBtn.onclick = (e) => {
        e.stopPropagation();
        if (imgList.length <= 1) return;
        activeDetailPhotoIdx = (activeDetailPhotoIdx + 1) % imgList.length;
        renderDetailPhoto();
        audio.playPop();
      };
    }

    const desc = (photoData.desc && photoData.desc.trim()) ? photoData.desc : (ch ? ch.desc : "");
    if (detailText) {
      detailText.textContent = desc;
    }

    const activeHighlights = (photoData.highlights && photoData.highlights.length > 0)
      ? photoData.highlights
      : (ch.highlights || []);

    if (detailHighlights) {
      detailHighlights.style.cursor = "pointer";
      detailHighlights.title = "Click to edit highlights ✨";
      detailHighlights.innerHTML = activeHighlights.map(h => 
        `<span class="chapter-highlight-pill">✨ ${h}</span>`
      ).join("");
      detailHighlights.onclick = (e) => {
        e.stopPropagation();
        closeStoryChapterDetailModal();
        if (typeof openDirectChapterEditor === "function") {
          openDirectChapterEditor(ch.id, ch.cityKey);
        }
        audio.playPop();
      };
    }

    if (detailPhotoWrap) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let deltaX = 0;
      let hasCaptured = false;

      detailPhotoWrap.style.touchAction = "pan-y";
      detailPhotoWrap.style.cursor = imgList.length > 1 ? "grab" : "pointer";

      detailPhotoWrap.onpointerdown = (e) => {
        if (e.target.closest(".chapter-detail-slider-nav, .chapter-photo-counter-badge")) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        deltaX = 0;
        try {
          detailPhotoWrap.setPointerCapture(e.pointerId);
          hasCaptured = true;
        } catch (_) {
          hasCaptured = false;
        }
        if (detailImg) detailImg.style.transition = "none";
        if (imgList.length > 1) detailPhotoWrap.style.cursor = "grabbing";
      };

      detailPhotoWrap.onpointermove = (e) => {
        if (!isDragging) return;
        deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        if (imgList.length > 1 && Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (detailImg) {
            detailImg.style.transform = `translateX(${deltaX * 0.4}px)`;
          }
        }
      };

      const finishDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        if (hasCaptured) {
          try { detailPhotoWrap.releasePointerCapture(e.pointerId); } catch (_) {}
          hasCaptured = false;
        }
        detailPhotoWrap.style.cursor = imgList.length > 1 ? "grab" : "pointer";
        if (detailImg) {
          detailImg.style.transition = "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)";
          detailImg.style.transform = "";
        }

        const deltaY = (e && typeof e.clientY === "number") ? Math.abs(e.clientY - startY) : 0;
        if (Math.abs(deltaX) < 10 && deltaY < 10) {
          const currentImg = imgList[activeDetailPhotoIdx] || photoData.img;
          if (typeof openLightbox === "function") {
            openLightbox({
              img: currentImg,
              title: `${ch.title} (${activeDetailPhotoIdx + 1}/${imgList.length})`,
              desc: desc
            });
          }
        } else if (imgList.length > 1 && deltaX < -35) {
          activeDetailPhotoIdx = (activeDetailPhotoIdx + 1) % imgList.length;
          renderDetailPhoto();
          audio.playPop();
        } else if (imgList.length > 1 && deltaX > 35) {
          activeDetailPhotoIdx = (activeDetailPhotoIdx - 1 + imgList.length) % imgList.length;
          renderDetailPhoto();
          audio.playPop();
        }
      };

      detailPhotoWrap.onpointerup = finishDrag;
      detailPhotoWrap.onpointercancel = finishDrag;
    }

    if (backToMapPostcardBtn) {
      backToMapPostcardBtn.onclick = (e) => {
        e.stopPropagation();
        closeStoryChapterDetailModal();
        displayCityMemory(ch.cityKey);
        audio.playPop();
      };
    }

    if (editChapterFromDetailBtn) {
      editChapterFromDetailBtn.onclick = (e) => {
        e.stopPropagation();
        closeStoryChapterDetailModal();
        if (typeof openDirectChapterEditor === "function") {
          openDirectChapterEditor(ch.id, ch.cityKey);
        }
        audio.playPop();
      };
    }

    if (detailModal) {
      detailModal.classList.remove("hidden");
      audio.playChimeCascade();
      particles.burst(window.innerWidth / 2, window.innerHeight / 2, 25);
    }
  };

  window.openStoryChapterDetailModal = openStoryChapterDetailModal;

  if (detailCloseBtn) {
    detailCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeStoryChapterDetailModal();
      audio.playPop();
    });
  }
  if (detailCloseAltBtn) {
    detailCloseAltBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeStoryChapterDetailModal();
      audio.playPop();
    });
  }
  if (detailBackdrop) {
    detailBackdrop.addEventListener("click", () => {
      closeStoryChapterDetailModal();
      audio.playPop();
    });
  }

  // Jump to Story Chapter Button from Map Popup
  const jumpBtn = document.getElementById("jumpToTimelineBtn");
  if (jumpBtn) {
    jumpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const activeSlide = currentActiveSlides && currentActiveSlides[currentActiveSlideIdx];
      const isChina = tabChina && tabChina.classList.contains("active");
      const isIndo = tabIndonesia && tabIndonesia.classList.contains("active");
      const tourChapters = isChina ? chinaTourChapters : (isIndo ? indonesiaTourChapters : globalTourChapters);
      const targetChapterId = activeSlide ? activeSlide.chapterId : (tourChapters[currentTourIndex] || CITY_TO_CHAPTER_MAP[currentActiveMemoryKey] || "chap-guangzhou-start");
      closePopup();
      openStoryChapterDetailModal(targetChapterId, currentActiveMemoryKey);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closePopup();
      audio.playPop();
    });
  }

  if (closeAltBtn) {
    closeAltBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closePopup();
      audio.playPop();
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      closePopup();
      audio.playPop();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (distModal && !distModal.classList.contains("hidden")) {
      if (e.key === "Escape") {
        closeDistanceModal();
        return;
      }
    }
    if (detailModal && !detailModal.classList.contains("hidden")) {
      if (e.key === "Escape") {
        closeStoryChapterDetailModal();
        return;
      }
      if (e.key === "ArrowLeft") {
        const prevBtn = document.getElementById("chapterDetailPrevPhotoBtn");
        if (prevBtn && !prevBtn.classList.contains("hidden")) prevBtn.click();
        return;
      }
      if (e.key === "ArrowRight") {
        const nextBtn = document.getElementById("chapterDetailNextPhotoBtn");
        if (nextBtn && !nextBtn.classList.contains("hidden")) nextBtn.click();
        return;
      }
    }
    if (e.key !== "Escape") return;
    const lb = document.getElementById("photoLightbox");
    const dm = document.getElementById("directMemoryModal");
    const dc = document.getElementById("directChapterModal");
    if ((lb && !lb.classList.contains("hidden")) || (dm && !dm.classList.contains("hidden")) || (dc && !dc.classList.contains("hidden"))) return;
    closePopup();
  });

  // Scroll Trigger: start animation from origin once user reaches the map screen
  const mapScrollTriggerEl = document.getElementById("mapFrame");
  if (mapScrollTriggerEl && "IntersectionObserver" in window) {
    let wasVisible = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !wasVisible) {
          wasVisible = true;
          const currentTab = tabChina && tabChina.classList.contains("active") ? "china" : (tabIndonesia && tabIndonesia.classList.contains("active") ? "indonesia" : "global");
          restartMapAnimation(currentTab);
        } else if (!entry.isIntersecting) {
          wasVisible = false;
        }
      });
    }, { threshold: 0.25 });
    observer.observe(mapScrollTriggerEl);
  }
}
