// Lightbox Engine
function openLightbox(mem) {
  const lb = document.getElementById("photoLightbox");
  const img = document.getElementById("lightboxImg");
  const cap = document.getElementById("lightboxCaption");
  const desc = document.getElementById("lightboxDesc");
  if (img) img.src = mem.img;
  if (cap) cap.textContent = mem.title;
  if (desc) desc.textContent = mem.desc || "";
  const dlBtn = document.getElementById("lightboxDownloadBtn");
  if (dlBtn && mem.img) {
    dlBtn.href = mem.img;
    dlBtn.download = `${(mem.title || "romantic_memory").replace(/[^a-z0-9_-]/gi, "_").toLowerCase()}.jpg`;
  }
  if (lb) lb.classList.remove("hidden");
  audio.playPop();
}

function closeLightbox() {
  const lb = document.getElementById("photoLightbox");
  if (lb) lb.classList.add("hidden");
}

// Memories Gallery & Polaroid Album Engine
let currentMemoryFilter = "all";
let slideshowTimer = null;

async function persistMemoriesOrder() {
  const seenIds = new Set();
  state.memories = state.memories.filter(m => {
    if (!m || !m.id || seenIds.has(m.id)) return false;
    seenIds.add(m.id);
    return true;
  });
  const safeMemories = state.memories.map(m => ({
    id: m.id,
    title: m.title,
    desc: m.desc,
    img: m.img || `images/${m.id}.jpg`
  }));
  try {
    localStorage.setItem("gf_memories", JSON.stringify(safeMemories));
  } catch (err) {}
  if (typeof saveToComputer === "function") {
    await saveToComputer({ gf_memories: JSON.stringify(safeMemories), memories: safeMemories, _source: "memory_editor" });
  }
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "SYNC_MEMORIES", memories: safeMemories }, window.location.origin);
  }
}

function renderPolaroids() {
  const grid = document.getElementById("polaroidGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const listToRender = state.memories;

  listToRender.forEach((mem, idx) => {
    const card = document.createElement("div");
    card.className = "polaroid-card";
    card.setAttribute("draggable", "true");
    card.setAttribute("data-id", mem.id);
    card.setAttribute("data-idx", String(idx));
    card.innerHTML = `
      <div class="polaroid-top-bar">
        <div class="polaroid-reorder-controls" title="Change album position">
          <button type="button" class="polaroid-move-btn" data-id="${mem.id}" data-dir="-1" title="Move earlier" ${idx === 0 ? 'disabled' : ''}>◀</button>
          <span class="polaroid-order-badge">#${idx + 1}</span>
          <button type="button" class="polaroid-move-btn" data-id="${mem.id}" data-dir="1" title="Move later" ${idx === listToRender.length - 1 ? 'disabled' : ''}>▶</button>
        </div>
        <button type="button" class="polaroid-inline-edit-btn" title="Edit photo & description">
          <span>✏️ Edit</span>
        </button>
      </div>
      <div class="polaroid-image-wrap">
        <img src="${mem.img}" alt="${mem.title}" loading="lazy" decoding="async" onerror="if(this.dataset.tried!=='1'){this.dataset.tried='1';this.src='${mem.svgFallback || generateDefaultCitySvg(mem.id)}';}">
      </div>
      <p class="polaroid-caption">${mem.title}</p>
      ${mem.desc ? `<p class="polaroid-desc">${mem.desc}</p>` : ""}
    `;

    const editBtn = card.querySelector(".polaroid-inline-edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openDirectMemoryEditor(mem.id);
      });
    }

    card.querySelectorAll(".polaroid-move-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const dir = parseInt(btn.getAttribute("data-dir"), 10);
        const currIdx = state.memories.findIndex(m => m.id === mem.id);
        const targetIdx = currIdx + dir;
        if (targetIdx >= 0 && targetIdx < state.memories.length) {
          const [moved] = state.memories.splice(currIdx, 1);
          state.memories.splice(targetIdx, 0, moved);
          await persistMemoriesOrder();
          renderPolaroids();
          if (typeof audio !== "undefined" && audio.playPop) audio.playPop();
          if (typeof showComplimentToast === "function") {
            showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, `✨ Moved "${moved.title || 'Memory'}" to #${targetIdx + 1}!`);
          }
        }
      });
    });

    card.addEventListener("dragstart", (e) => {
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", mem.id);
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      grid.querySelectorAll(".polaroid-card").forEach(c => c.classList.remove("drag-over-card"));
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      card.classList.add("drag-over-card");
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("drag-over-card");
    });

    card.addEventListener("drop", async (e) => {
      e.preventDefault();
      card.classList.remove("drag-over-card");
      const draggedId = e.dataTransfer.getData("text/plain");
      if (!draggedId || draggedId === mem.id) return;
      const fromIdx = state.memories.findIndex(m => m.id === draggedId);
      const toIdx = state.memories.findIndex(m => m.id === mem.id);
      if (fromIdx !== -1 && toIdx !== -1) {
        const [moved] = state.memories.splice(fromIdx, 1);
        state.memories.splice(toIdx, 0, moved);
        await persistMemoriesOrder();
        renderPolaroids();
        if (typeof audio !== "undefined" && audio.playPop) audio.playPop();
        if (typeof showComplimentToast === "function") {
          showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, `✨ Reordered "${moved.title || 'Memory'}" to #${toIdx + 1}!`);
        }
      }
    });

    card.addEventListener("click", () => openLightbox(mem));
    grid.appendChild(card);
  });

  // Direct Add Memory Card at end of polaroid grid
  const addCard = document.createElement("div");
  addCard.className = "polaroid-card polaroid-add-card";
  addCard.setAttribute("role", "button");
  addCard.setAttribute("tabindex", "0");
  addCard.setAttribute("title", "Click to add a new memory photo & story");
  addCard.innerHTML = `
    <div class="polaroid-add-inner">
      <span class="add-card-icon">➕📷</span>
      <strong class="add-card-title">Add Our Moment</strong>
      <span class="add-card-sub">Upload photo & story</span>
    </div>
  `;
  addCard.addEventListener("click", () => openDirectMemoryEditor(null));
  grid.appendChild(addCard);
}

function setupMemoryFilterAndSlideshow() {
  const filterBtns = document.querySelectorAll(".filter-chip-btn[data-filter]");
  const slideshowBtn = document.getElementById("launchSlideshowBtn");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMemoryFilter = btn.getAttribute("data-filter") || "all";
      renderPolaroids();
      audio.playPop();
    });
  });

  if (slideshowBtn) {
    slideshowBtn.addEventListener("click", () => {
      if (state.memories.length === 0) return;
      audio.playFanfare();
      particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);

      let slideIdx = 0;
      openLightbox(state.memories[slideIdx]);
      showComplimentToast(window.innerWidth / 2, 80, "▶️ Fullscreen Slideshow Started! Tap anywhere to exit.");

      clearInterval(slideshowTimer);
      slideshowTimer = setInterval(() => {
        const lightbox = document.getElementById("photoLightbox");
        if (lightbox && lightbox.classList.contains("hidden")) {
          clearInterval(slideshowTimer);
          return;
        }
        slideIdx = (slideIdx + 1) % state.memories.length;
        openLightbox(state.memories[slideIdx]);
        audio.playSparkle();
      }, 3500);
    });
  }
}

// Direct Memory Editor Engine
let currentEditingMemoryId = null;
let currentEditingMemoryImg = null;
let cachedProjectImages = null;
let currentProjectFilter = 'all';
let currentProjectSearch = '';

const PROJECT_IMAGE_LIST = ["images/algeria.jpg", "images/bipenggou.jpg", "images/chap-baiyun.jpg", "images/chap-baiyun_1788947022967_0_vyuk.jpg", "images/chap-baiyun_1788947022992_1_d51x.jpg", "images/chap-baiyun_1788947023054_2_pq9x.jpg", "images/chap-baiyun_1788947023138_3_6qps.jpg", "images/chap-baiyun_1788947023221_4_l08l.jpg", "images/chap-bali_1788945798743_1_k0ch.jpg", "images/chap-bali_1788945798761_2_jczb.jpg", "images/chap-bali_1788945798772_3_k8ql.jpg", "images/chap-bali_1788945798780_4_j1yh.jpg", "images/chap-bali_1788945798789_5_zo3g.jpg", "images/chap-bali_1788945798797_6_h891.jpg", "images/chap-bali_1788945798806_7_68dz.jpg", "images/chap-bali_1788945798813_8_uv77.jpg", "images/chap-bali_1788945798823_9_rcg6.jpg", "images/chap-bali_1788945798830_10_en5v.jpg", "images/chap-bali_1788945798839_11_feq1.jpg", "images/chap-bali_1788945798846_12_sh66.jpg", "images/chap-bali_1788945798856_13_o8qm.jpg", "images/chap-bali_1788945798863_14_txrd.jpg", "images/chap-bali_1788945798874_15_avgf.jpg", "images/chap-bali_1788945798883_16_rhpn.jpg", "images/chap-bali_1788945798893_17_5czy.jpg", "images/chap-bali_1788945798906_18_rz26.jpg", "images/chap-bali_1788945798915_19_oaei.jpg", "images/chap-bali_1788945798925_20_vts3.jpg", "images/chap-bali_1788945798937_21_5jfr.jpg", "images/chap-bali_1788945798945_22_1ld8.jpg", "images/chap-bali_1788945798956_23_wzrk.jpg", "images/chap-bipenggou.jpg", "images/chap-bipenggou_1788943540311_0_70vp.jpg", "images/chap-bipenggou_1788943540332_1_ll26.jpg", "images/chap-bipenggou_1788943540344_2_u34e.jpg", "images/chap-bipenggou_1788943540352_3_jw0r.jpg", "images/chap-bipenggou_1788943540362_4_gsy2.jpg", "images/chap-bipenggou_1788944736912_5_h4nt.jpg", "images/chap-canton-tower-proposal.jpg", "images/chap-canton-tower-proposal_1788946607232_0_3sjt.jpg", "images/chap-canton-tower-proposal_1788946607260_1_7skc.jpg", "images/chap-canton-tower-proposal_1788946607284_2_pqo0.jpg", "images/chap-chengdu-return.jpg", "images/chap-chengdu-return_1788945080613_0_3x0r.jpg", "images/chap-chengdu-return_1788945080635_1_3s84.jpg", "images/chap-chengdu.jpg", "images/chap-chengdu_1788943395092_0_lo38.jpg", "images/chap-chengdu_1788943395116_1_fh1r.jpg", "images/chap-chengdu_1788943395125_2_ogcb.jpg", "images/chap-chengdu_1788943395134_3_q4ae.jpg", "images/chap-chengdu_1788943395145_4_x6nt.jpg", "images/chap-chengdu_1788943395166_5_y96r.jpg", "images/chap-chengdu_1788943395184_6_oww0.jpg", "images/chap-chengdu_1788943395202_7_vj9h.jpg", "images/chap-chengdu_1788944582980_8_cwm1.jpg", "images/chap-chongqing_1788942944458_0_v1r1.jpg", "images/chap-chongqing_1788942944478_1_vyki.jpg", "images/chap-chongqing_1788942944494_2_sd7m.jpg", "images/chap-chongqing_1788942944511_3_cuny.jpg", "images/chap-chongqing_1788942944530_4_qsm1.jpg", "images/chap-chongqing_1788942944559_5_3kjb.jpg", "images/chap-chongqing_1788942944578_6_3myp.jpg", "images/chap-chongqing_1788942944594_7_qao1.jpg", "images/chap-chongqing_1788942944610_8_gxaa.jpg", "images/chap-chongqing_1788942944627_9_5oss.jpg", "images/chap-chongqing_1788942944644_10_5qlt.jpg", "images/chap-chongqing_1788942944660_11_kloo.jpg", "images/chap-chongqing_1788942944677_12_xmnu.jpg", "images/chap-chongqing_1788942944696_13_w8as.jpg", "images/chap-chongqing_1788942944735_14_l0do.jpg", "images/chap-chongqing_1788944420550_8_1gzo.jpg", "images/chap-chongqing_1788944470595_11_xnet.jpg", "images/chap-chongqing_1788944505810_4_f9rl.jpg", "images/chap-chongqing_1788944566946_12_g95a.jpg", "images/chap-dagu.jpg", "images/chap-dagu_1788943749797_0_s7ba.jpg", "images/chap-dagu_1788943749820_1_rpof.jpg", "images/chap-dagu_1788943749838_2_0kpx.jpg", "images/chap-dagu_1788943749853_3_nmfo.jpg", "images/chap-dagu_1788943749871_4_85ny.jpg", "images/chap-dagu_1788943749887_5_f28h.jpg", "images/chap-dagu_1788943749904_6_q6k5.jpg", "images/chap-dagu_1788943749936_7_55cf.jpg", "images/chap-guangzhou-buffet.jpg", "images/chap-guangzhou-cozy_1788945201701_2_8g55.jpg", "images/chap-guangzhou-cozy_1788945201711_3_9959.jpg", "images/chap-guangzhou-cozy_1788945254395_0_whuu.jpg", "images/chap-guangzhou-dec.jpg", "images/chap-guangzhou-dec_1788941933467_0_0ebt.jpg", "images/chap-guangzhou-dec_1788941933488_1_75mm.jpg", "images/chap-guangzhou-dec_1788941933500_2_oo21.jpg", "images/chap-guangzhou-dec_1788941933508_3_mydu.jpg", "images/chap-guangzhou-dec_1788941933517_4_j916.jpg", "images/chap-guangzhou-dec_1788941933525_5_bfiq.jpg", "images/chap-guangzhou-dec_1788942528208_6_sz6l.jpg", "images/chap-guangzhou-dec_1788942528225_7_ow9o.jpg", "images/chap-guangzhou-farewell.jpg", "images/chap-guangzhou-farewell_1788948243801_0_y1jc.jpg", "images/chap-guangzhou-farewell_1788948243848_1_0en4.jpg", "images/chap-guangzhou-spring.jpg", "images/chap-guangzhou-spring_1788946453385_0_b6rz.jpg", "images/chap-guangzhou-spring_1788946453409_1_a7dd.jpg", "images/chap-guangzhou-spring_1788946453418_2_10co.jpg", "images/chap-guangzhou-spring_1788946453426_3_pixk.jpg", "images/chap-guangzhou-spring_1788946453436_4_00bk.jpg", "images/chap-guangzhou-spring_1788946453443_5_hhhe.jpg", "images/chap-guangzhou-spring_1788946453452_6_jq04.jpg", "images/chap-guangzhou-spring_1788946453460_7_wczm.jpg", "images/chap-guangzhou-spring_1788946453469_8_0a23.jpg", "images/chap-guangzhou-spring_1788946453478_9_30yc.jpg", "images/chap-guangzhou-spring_1788946453487_10_43es.jpg", "images/chap-guangzhou-spring_1788946453495_11_rxuo.jpg", "images/chap-guangzhou-spring_1788946804419_0_v067.jpg", "images/chap-guangzhou-spring_1788946843946_13_xds0.jpg", "images/chap-guangzhou-spring_1788946917419_14_4hzc.jpg", "images/chap-guangzhou-spring_1788946917474_15_jjpz.jpg", "images/chap-guangzhou-spring_1788946917512_16_xo5a.jpg", "images/chap-guangzhou-spring_1788947048847_17_s4hv.jpg", "images/chap-guangzhou-spring_1788947062284_18_i83x.jpg", "images/chap-guangzhou-spring_1788947084098_19_of9o.jpg", "images/chap-guangzhou-spring_1788947097614_20_jsxx.jpg", "images/chap-guangzhou-spring_1788947122431_21_3b3f.jpg", "images/chap-guangzhou-start_1.jpg", "images/chap-guangzhou-start_1788941452128_0_7md1.jpg", "images/chap-guangzhou-start_1788941452164_1_3ubt.jpg", "images/chap-guangzhou-start_2.jpg", "images/chap-guangzhou-start_3.jpg", "images/chap-guangzhou-start_4.jpg", "images/chap-guangzhou-start_5.jpg", "images/chap-guangzhou-start_6.jpg", "images/chap-huanglong.jpg", "images/chap-huanglong_1788944369467_0_25f0.jpg", "images/chap-huanglong_1788944369488_1_rsum.jpg", "images/chap-huanglong_1788944369501_2_spcz.jpg", "images/chap-huanglong_1788944369509_3_e7iz.jpg", "images/chap-huanglong_1788944369519_4_k0x8.jpg", "images/chap-huanglong_1788944915524_5_9v5x.jpg", "images/chap-jakarta.jpg", "images/chap-jakarta_1788946194696_0_tqok.jpg", "images/chap-jakarta_1788946194719_1_ewgy.jpg", "images/chap-jakarta_1788946194730_2_ta04.jpg", "images/chap-jakarta_1788946194740_3_0gjh.jpg", "images/chap-jakarta_1788946194750_4_me9y.jpg", "images/chap-jakarta_1788946194763_5_3evl.jpg", "images/chap-jakarta_1788946194772_6_0rp4.jpg", "images/chap-jakarta_1788946194781_7_k7e2.jpg", "images/chap-jakarta_1788946194790_8_vt54.jpg", "images/chap-jakarta_1788946194799_9_tzry.jpg", "images/chap-jiuzhaigou_1788944084978_3_o8zs.jpg", "images/chap-jiuzhaigou_1788944084985_4_qcpc.jpg", "images/chap-jiuzhaigou_1788944888178_2_cbul.jpg", "images/chap-jiuzhaigou_1788944888196_3_nrom.jpg", "images/chap-jiuzhaigou_1788944888207_4_t351.jpg", "images/chap-jiuzhaigou_1788944888216_5_gzao.jpg", "images/chap-jiuzhaigou_1788944888224_6_9sov.jpg", "images/chap-jiuzhaigou_1788944888234_7_9zwp.jpg", "images/chap-ldr.jpg", "images/chap-ldr_1788948309888_0_02rb.jpg", "images/chap-nanjing.jpg", "images/chap-nanjing_1788947797763_0_vi21.jpg", "images/chap-nanjing_1788947797814_1_0d39.jpg", "images/chap-nanjing_1788947797839_2_t7u6.jpg", "images/chap-nanjing_1788947797889_3_4fso.jpg", "images/chap-nanjing_1788947797994_4_vr84.jpg", "images/chap-nanjing_1788948506925_4_odwn.jpg", "images/chap-nansha.jpg", "images/chap-nansha_1788946793811_0_ae3i.jpg", "images/chap-nansha_1788946793872_1_yl43.jpg", "images/chap-nansha_1788946793913_2_kqxy.jpg", "images/chap-nansha_1788946793968_3_7r8p.jpg", "images/chap-shanghai.jpg", "images/chap-shanghai_1788948051909_0_oiey.jpg", "images/chap-shanghai_1788948051936_1_6t5u.jpg", "images/chap-shanghai_1788948051979_2_2q6m.jpg", "images/chap-shanghai_1788948052026_3_0gxm.jpg", "images/chap-shanghai_1788948052078_4_j5kp.jpg", "images/chap-shanghai_1788948052130_5_q7wv.jpg", "images/chap-shenzhen_1788942301219_0_q1gm.jpg", "images/chap-shenzhen_1788942301255_1_k2dz.jpg", "images/chap-shenzhen_1788942301272_2_ds8f.jpg", "images/chap-shenzhen_1788942301289_3_7q23.jpg", "images/chap-shenzhen_1788942301305_4_iv72.jpg", "images/chap-shenzhen_1788942301321_5_9yr0.jpg", "images/chap-shenzhen_1788942301338_6_6hw7.jpg", "images/chap-shenzhen_1788942301356_7_e6ck.jpg", "images/chap-shenzhen_1788942301371_8_zdt1.jpg", "images/chap-shenzhen_1788942301387_9_y346.jpg", "images/chap-shenzhen_1788942301403_10_346y.jpg", "images/chap-shenzhen_1788942301420_11_quc5.jpg", "images/chap-shenzhen_1788942301437_12_w4qe.jpg", "images/chap-shenzhen_1788942301453_13_qggt.jpg", "images/chap-shenzhen_1788942301470_14_1zar.jpg", "images/chap-shenzhen_1788942301486_15_l5kf.jpg", "images/chap-shenzhen_1788942301503_16_z5bs.jpg", "images/chap-vietnam_1788945383687_1_cpwd.jpg", "images/chap-vietnam_1788945383703_2_1tc9.jpg", "images/chap-wuhan.jpg", "images/chap-wuhan_1788947557689_0_q0oj.jpg", "images/chap-wuhan_1788947557747_1_2fzt.jpg", "images/chap-wuhan_1788947557815_2_b9rt.jpg", "images/chap-wuhan_1788947557882_3_vbvd.jpg", "images/chap-wuhan_1788947557950_4_0ujt.jpg", "images/chap-wuhan_1788947558018_5_d7j6.jpg", "images/chap-wuhan_1788947558087_6_hevl.jpg", "images/chap-wuhan_1788947558172_7_wqqx.jpg", "images/chengdu.jpg", "images/china-base.jpg", "images/china.jpg", "images/chongqing.jpg", "images/dagu.jpg", "images/guangzhou.jpg", "images/guangzhou_1.jpg", "images/guangzhou_2.jpg", "images/guangzhou_3.jpg", "images/guangzhou_4.jpg", "images/guangzhou_5.jpg", "images/guangzhou_6.jpg", "images/huanglong.jpg", "images/indonesia.jpg", "images/jakarta.jpg", "images/jiuzhaigou.jpg", "images/mem-2.jpg", "images/mem-3.jpg", "images/mem-4.jpg", "images/mem-5.jpg", "images/nanjing.jpg", "images/nansha.jpg", "images/shanghai.jpg", "images/shenzhen.jpg", "images/vietnam.jpg", "images/wuhan.jpg"];

async function loadProjectImages() {
  if (cachedProjectImages && cachedProjectImages.length > 0) return cachedProjectImages;
  let serverImages = [];
  try {
    const res = await sendApiRequest('/images', { cache: 'no-store' });
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) serverImages = data;
    }
  } catch (e) {}

  const set = new Set(serverImages.length > 0 ? serverImages : PROJECT_IMAGE_LIST);
  PROJECT_IMAGE_LIST.forEach(img => set.add(img));
  if (typeof state !== 'undefined' && state.memories) {
    state.memories.forEach(m => {
      if (m.img && !m.img.startsWith('data:')) set.add(m.img);
    });
  }
  cachedProjectImages = Array.from(set).sort();
  return cachedProjectImages;
}

function filterProjectImages(images, filterTag, query) {
  const q = (query || '').trim().toLowerCase();
  return images.filter(img => {
    const name = img.split('/').pop().toLowerCase();
    if (q && !name.includes(q)) return false;
    if (filterTag === 'all') return true;
    if (filterTag === 'mem') return /mem-|moment/i.test(name);
    if (filterTag === 'guangzhou') return /guangzhou|canton/i.test(name);
    if (filterTag === 'bali') return /bali/i.test(name);
    if (filterTag === 'chongqing') return /chongqing/i.test(name);
    if (filterTag === 'chengdu') return /chengdu/i.test(name);
    if (filterTag === 'mountains') return /dagu|bipenggou|huanglong|jiuzhaigou/i.test(name);
    if (filterTag === 'jakarta') return /jakarta/i.test(name);
    if (filterTag === 'shenzhen') return /shenzhen/i.test(name);
    if (filterTag === 'vietnam') return /vietnam/i.test(name);
    return true;
  });
}

async function renderProjectImagesGrid(selectedImg) {
  const grid = document.getElementById('projectImagesGrid');
  const countEl = document.getElementById('projectMemoryImgCount');
  const emptyEl = document.getElementById('projectImagesEmpty');
  const selectedNameEl = document.getElementById('projectMemorySelectedName');
  if (!grid) return;

  const images = await loadProjectImages();
  const filtered = filterProjectImages(images, currentProjectFilter, currentProjectSearch);

  if (countEl) countEl.textContent = String(filtered.length);
  if (emptyEl) emptyEl.classList.toggle('hidden', filtered.length > 0);

  const activeSrc = (selectedImg || currentEditingMemoryImg || '').trim();
  const activeFname = activeSrc ? activeSrc.split('/').pop().toLowerCase() : '';

  if (selectedNameEl) {
    if (activeSrc && !activeSrc.startsWith('data:')) {
      selectedNameEl.textContent = activeSrc.split('/').pop();
    } else if (activeSrc.startsWith('data:')) {
      selectedNameEl.textContent = 'Custom uploaded photo';
    } else {
      selectedNameEl.textContent = 'Click a photo to choose';
    }
  }

  grid.innerHTML = '';
  filtered.forEach(imgPath => {
    const fname = imgPath.split('/').pop();
    const isSelected = (imgPath === activeSrc || fname.toLowerCase() === activeFname);
    const thumb = document.createElement('div');
    thumb.className = 'project-img-thumb' + (isSelected ? ' selected' : '');
    thumb.setAttribute('role', 'option');
    thumb.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    thumb.setAttribute('title', fname);
    thumb.innerHTML = '<img src="' + imgPath + '" alt="' + fname + '" loading="lazy" decoding="async"><span class="thumb-check">✓</span><span class="thumb-name">' + fname + '</span>';

    thumb.addEventListener('click', () => {
      currentEditingMemoryImg = imgPath;
      const previewImg = document.getElementById('directMemoryPreviewImg');
      if (previewImg) previewImg.src = imgPath;

      grid.querySelectorAll('.project-img-thumb').forEach(t => {
        t.classList.remove('selected');
        t.setAttribute('aria-selected', 'false');
      });
      thumb.classList.add('selected');
      thumb.setAttribute('aria-selected', 'true');

      if (selectedNameEl) selectedNameEl.textContent = fname;
      if (typeof audio !== 'undefined' && audio.playPop) audio.playPop();
      if (typeof showComplimentToast === 'function') {
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, '📷 Selected ' + fname + ' 💕');
      }
    });

    grid.appendChild(thumb);
    if (isSelected) {
      setTimeout(() => thumb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);
    }
  });
}


function openDirectMemoryEditor(memId) {
  if (typeof isAdminEditAllowed === "function" && !isAdminEditAllowed()) return;
  currentEditingMemoryId = memId;

  const isIframe = window.parent && window.parent !== window;
  if (isIframe) {
    window.parent.postMessage({
      type: "SELECT_WIDGET",
      widgetId: "memories",
      memoryId: memId
    }, window.location.origin);
    return;
  }

  const modal = document.getElementById("directMemoryModal");
  if (!modal) return;

  const modalTitle = document.getElementById("directMemoryModalTitle");
  const modalBadge = document.getElementById("directMemoryModalBadge");
  const titleInput = document.getElementById("directMemoryTitle");
  const descInput = document.getElementById("directMemoryDesc");
  const previewImg = document.getElementById("directMemoryPreviewImg");
  const fileInput = document.getElementById("directMemoryFile");
  const saveBtn = document.getElementById("saveDirectMemoryBtn");
  const deleteBtn = document.getElementById("deleteDirectMemoryBtn");

  if (fileInput) fileInput.value = "";

  if (memId) {
    const mem = state.memories.find(m => m.id === memId);
    if (mem) {
      if (modalBadge) modalBadge.textContent = "📷 Edit Memory";
      if (modalTitle) modalTitle.textContent = `Edit "${mem.title || 'Memory'}"`;
      if (titleInput) titleInput.value = mem.title || "";
      if (descInput) descInput.value = mem.desc || "";
      if (previewImg) previewImg.src = mem.img || "";
      currentEditingMemoryImg = mem.img || "";
      if (saveBtn) saveBtn.innerHTML = "<span>💾 Save Memory</span>";
      if (deleteBtn) deleteBtn.style.display = state.memories.length > 1 ? "inline-flex" : "none";
    }
  } else {
    if (modalBadge) modalBadge.textContent = "➕ New Memory";
    if (modalTitle) modalTitle.textContent = "Add Our Moment";
    if (titleInput) titleInput.value = "";
    if (descInput) descInput.value = "";
    currentEditingMemoryImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23ffe8ee'/><text x='200' y='105' font-size='20' font-family='sans-serif' fill='%23ff4365' font-weight='bold' text-anchor='middle'>📷 Choose Photo or Paste (Ctrl+V)</text></svg>";
    if (previewImg) previewImg.src = currentEditingMemoryImg;
    if (saveBtn) saveBtn.innerHTML = "<span>✨ Add Our Moment</span>";
    if (deleteBtn) deleteBtn.style.display = "none";
  }

  currentProjectSearch = "";
  currentProjectFilter = "all";
  const searchInput = document.getElementById("projectImagesSearch");
  if (searchInput) searchInput.value = "";
  const clearSearchBtn = document.getElementById("clearProjectSearchBtn");
  if (clearSearchBtn) clearSearchBtn.classList.add("hidden");

  const tabChoose = document.getElementById("tabChooseProjectPhoto");
  const tabUpload = document.getElementById("tabUploadNewPhoto");
  const panelChoose = document.getElementById("panelChooseProjectPhoto");
  const panelUpload = document.getElementById("panelUploadNewPhoto");
  if (tabChoose && tabUpload && panelChoose && panelUpload) {
    tabChoose.classList.add("active");
    tabUpload.classList.remove("active");
    panelChoose.classList.add("active");
    panelUpload.classList.remove("active");
  }

  const chips = document.querySelectorAll(".project-filter-chip[data-filter]");
  chips.forEach(c => {
    c.classList.toggle("active", c.getAttribute("data-filter") === "all");
  });
  renderProjectImagesGrid(currentEditingMemoryImg);

  modal.classList.remove("hidden");
  if (titleInput) setTimeout(() => titleInput.focus(), 80);
}

function closeDirectMemoryEditor() {
  const modal = document.getElementById("directMemoryModal");
  if (modal) modal.classList.add("hidden");
}

function initDirectMemoryEditor() {
  const modal = document.getElementById("directMemoryModal");
  if (!modal || modal.dataset.initialized === "true") return;
  modal.dataset.initialized = "true";

  const fileInput = document.getElementById("directMemoryFile");
  const previewImg = document.getElementById("directMemoryPreviewImg");
  const dropZone = document.getElementById("directMemoryDropZone");
  const uploadDropZone = document.getElementById("memoryUploadDropZone");
  const closeBtn = document.getElementById("closeDirectMemoryModal");
  const cancelBtn = document.getElementById("cancelDirectMemoryBtn");
  const backdrop = document.getElementById("directMemoryBackdrop");
  const saveBtn = document.getElementById("saveDirectMemoryBtn");
  const deleteBtn = document.getElementById("deleteDirectMemoryBtn");

  const tabChoose = document.getElementById("tabChooseProjectPhoto");
  const tabUpload = document.getElementById("tabUploadNewPhoto");
  const panelChoose = document.getElementById("panelChooseProjectPhoto");
  const panelUpload = document.getElementById("panelUploadNewPhoto");

  const switchMemoryTab = (tab) => {
    const isChoose = tab === "choose";
    if (tabChoose) tabChoose.classList.toggle("active", isChoose);
    if (tabUpload) tabUpload.classList.toggle("active", !isChoose);
    if (panelChoose) panelChoose.classList.toggle("active", isChoose);
    if (panelUpload) panelUpload.classList.toggle("active", !isChoose);
    if (typeof audio !== "undefined" && audio.playPop) audio.playPop();
  };

  if (tabChoose) tabChoose.addEventListener("click", () => switchMemoryTab("choose"));
  if (tabUpload) tabUpload.addEventListener("click", () => switchMemoryTab("upload"));

  const applyMemoryImage = async (fileOrUrl) => {
    if (!fileOrUrl) return;
    let optimized = null;
    if (typeof fileOrUrl === "string") {
      if (fileOrUrl.startsWith("data:image/")) {
        optimized = await optimizeImage(fileOrUrl);
      } else if (fileOrUrl.startsWith("images/") || /^https?:\/\//i.test(fileOrUrl)) {
        optimized = fileOrUrl;
      }
    } else {
      const isImg = (fileOrUrl.type && fileOrUrl.type.startsWith("image/")) || (fileOrUrl.name && /\.(jpe?g|png|webp|gif|svg|bmp|avif)$/i.test(fileOrUrl.name));
      if (isImg) {
        optimized = await optimizeImage(fileOrUrl);
      }
    }
    if (optimized) {
      previewImg.src = optimized;
      currentEditingMemoryImg = optimized;
      const grid = document.getElementById("projectImagesGrid");
      if (grid) {
        grid.querySelectorAll(".project-img-thumb").forEach(t => {
          t.classList.remove("selected");
          t.setAttribute("aria-selected", "false");
        });
      }
      const selectedNameEl = document.getElementById("projectMemorySelectedName");
      if (selectedNameEl) selectedNameEl.textContent = "Custom uploaded photo";
      audio.playSparkle();
      showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "📷 Photo loaded locally! 💕");
    }
  };

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) applyMemoryImage(file);
    });
  }

  const searchInput = document.getElementById("projectImagesSearch");
  const clearSearchBtn = document.getElementById("clearProjectSearchBtn");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentProjectSearch = e.target.value;
      if (clearSearchBtn) clearSearchBtn.classList.toggle("hidden", !currentProjectSearch);
      renderProjectImagesGrid(currentEditingMemoryImg);
    });
  }
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentProjectSearch = "";
      clearSearchBtn.classList.add("hidden");
      renderProjectImagesGrid(currentEditingMemoryImg);
      searchInput.focus();
    });
  }

  const chips = document.querySelectorAll(".project-filter-chip[data-filter]");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentProjectFilter = chip.getAttribute("data-filter") || "all";
      renderProjectImagesGrid(currentEditingMemoryImg);
      if (typeof audio !== "undefined" && audio.playPop) audio.playPop();
    });
  });

  const sizeBtns = document.querySelectorAll(".grid-size-btn[data-size]");
  const projectGrid = document.getElementById("projectImagesGrid");
  sizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const size = btn.getAttribute("data-size");
      sizeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (projectGrid) {
        projectGrid.classList.remove("size-medium", "size-large");
        projectGrid.classList.add("size-" + size);
      }
      if (typeof audio !== "undefined" && audio.playPop) audio.playPop();
    });
  });

  document.addEventListener("paste", async (e) => {
    if (!modal || modal.classList.contains("hidden")) return;
    const clipData = e.clipboardData || window.clipboardData;
    if (!clipData) return;

    const files = clipData.files;
    if (files && files.length > 0) {
      for (const file of files) {
        if (file && (file.type?.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg|bmp|avif)$/i.test(file.name || ""))) {
          e.preventDefault();
          await applyMemoryImage(file);
          return;
        }
      }
    }

    const items = clipData.items;
    if (items) {
      for (const item of items) {
        if (item.type && item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await applyMemoryImage(file);
            return;
          }
        }
      }
    }

    const text = clipData.getData("text")?.trim();
    if (text && (text.startsWith("data:image/") || /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(text))) {
      e.preventDefault();
      await applyMemoryImage(text);
      return;
    }
  });

  const setupDropHandlers = (element) => {
    if (!element) return;
    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.add("drag-over");
    });
    element.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove("drag-over");
    });
    element.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove("drag-over");
      const files = e.dataTransfer?.files;
      if (files && files[0]) applyMemoryImage(files[0]);
    });
  };

  setupDropHandlers(dropZone);
  setupDropHandlers(uploadDropZone);

  [closeBtn, cancelBtn, backdrop].forEach(el => {
    if (el) {
      el.addEventListener("click", () => {
        closeDirectMemoryEditor();
        audio.playPop();
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const lb = document.getElementById("photoLightbox");
    if (lb && !lb.classList.contains("hidden")) return;
    closeDirectMemoryEditor();
  });

  let isSavingMemory = false;

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      if (isSavingMemory) return;
      const titleInput = document.getElementById("directMemoryTitle");
      const descInput = document.getElementById("directMemoryDesc");
      const title = titleInput ? titleInput.value.trim() : "";
      const desc = descInput ? descInput.value.trim() : "";

      if (!title && !currentEditingMemoryId) {
        alert("Please enter a title or caption for this memory! ❤️");
        if (titleInput) titleInput.focus();
        return;
      }

      isSavingMemory = true;
      saveBtn.disabled = true;
      saveBtn.innerHTML = "<span>⏳ Saving...</span>";

      try {
        let finalImg = currentEditingMemoryImg;
        if (finalImg && finalImg.startsWith("data:") && finalImg.length > 50000) {
          finalImg = await optimizeImage(finalImg);
          currentEditingMemoryImg = finalImg;
        }

        let activeId = currentEditingMemoryId;
        if (!activeId) {
          activeId = "mem-" + Date.now();
          currentEditingMemoryId = activeId;
        }

        let diskPath = finalImg;
        if (finalImg && finalImg.startsWith("data:")) {
          const uniqueId = `${activeId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const fname = `${uniqueId}.jpg`;
          const saved = await saveFileToDisk(finalImg, fname);
          if (saved) {
            const slug = (typeof window !== "undefined" && window.CURRENT_TENANT_SLUG) || "demo";
            diskPath = (typeof saved === "string" && !saved.startsWith("data:")) ? saved : `/uploads/${slug}/${fname}`;
          }
        }

        let mem = state.memories.find(m => m.id === activeId);
        if (!mem && title) {
          mem = state.memories.find(m => m && m.title === title && (m.desc === desc || !m.desc));
        }

        if (mem) {
          if (mem.img && diskPath && mem.img !== diskPath && typeof deleteFileFromDisk === "function") {
            await deleteFileFromDisk(mem.img);
          }
          mem.id = activeId;
          if (title) mem.title = title;
          mem.desc = desc;
          if (diskPath) mem.img = diskPath;
        } else {
          mem = {
            id: activeId,
            title: title || "Our Special Moment ❤️",
            desc: desc,
            img: diskPath || "images/mem-1.jpg"
          };
          state.memories = state.memories.filter(m => m && m.id !== activeId);
          state.memories.unshift(mem);
        }

        const seenIds = new Set();
        const seenContent = new Set();
        state.memories = state.memories.filter(m => {
          if (!m || !m.id || seenIds.has(m.id)) return false;
          const key = `${m.title || ""}|${m.desc || ""}|${m.img || ""}`;
          if (seenContent.has(key)) return false;
          seenIds.add(m.id);
          seenContent.add(key);
          return true;
        });

        if (diskPath && activeId) {
          LOCAL_IMG_CACHE[`mem_${activeId}`] = diskPath;
          LOCAL_IMG_CACHE[activeId] = diskPath;
          await saveImageToLocalDb(`mem_${activeId}`, diskPath);
        }

        const safeMemories = state.memories.map(m => ({
          id: m.id,
          title: m.title,
          desc: m.desc,
          img: m.img || `images/${m.id}.jpg`
        }));
        try {
          localStorage.setItem("gf_memories", JSON.stringify(safeMemories));
        } catch (err) {}
        if (typeof saveToComputer === "function") {
          await saveToComputer({ gf_memories: JSON.stringify(safeMemories), memories: safeMemories, _source: "memory_editor" });
        }
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "SYNC_MEMORIES", memories: safeMemories }, window.location.origin);
        }

        cachedProjectImages = null;
        renderPolaroids();
        closeDirectMemoryEditor();
        audio.playChimeCascade();
        particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "📷 Saved to server & album! ❤️");
      } finally {
        isSavingMemory = false;
        saveBtn.disabled = false;
        saveBtn.innerHTML = "<span>💾 Save Memory</span>";
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!currentEditingMemoryId) return;
      if (state.memories.length <= 1) {
        alert("At least one memory must remain in your album! ❤️");
        return;
      }
      const memToDelete = state.memories.find(m => m.id === currentEditingMemoryId);
      if (memToDelete && memToDelete.img && typeof deleteFileFromDisk === "function") {
        await deleteFileFromDisk(memToDelete.img);
      }
      delete LOCAL_IMG_CACHE[`mem_${currentEditingMemoryId}`];
      delete LOCAL_IMG_CACHE[currentEditingMemoryId];
      await saveImageToLocalDb(`mem_${currentEditingMemoryId}`, null);
      state.memories = state.memories.filter(m => m.id !== currentEditingMemoryId);
      const safeMemories = state.memories.map(m => ({
        id: m.id,
        title: m.title,
        desc: m.desc,
        img: m.img || ""
      }));
      try {
        localStorage.setItem("gf_memories", JSON.stringify(safeMemories));
      } catch (e) {}
      if (typeof saveToComputer === "function") {
        await saveToComputer({ gf_memories: JSON.stringify(safeMemories), memories: safeMemories, _source: "memory_editor" });
      }
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "SYNC_MEMORIES", memories: safeMemories }, window.location.origin);
      }
      cachedProjectImages = null;
      renderPolaroids();
      closeDirectMemoryEditor();
      audio.playPop();
      showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "🗑️ Memory removed from album.");
    });
  }

  const downloadBtn = document.getElementById("downloadDirectMemoryBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      if (!currentEditingMemoryImg) return;
      const targetName = `${currentEditingMemoryId || 'mem-' + Date.now()}.jpg`;
      const ok = await saveFileToDisk(currentEditingMemoryImg, targetName);
      if (ok) {
        audio.playChimeCascade();
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, `📥 Saved ${targetName} for images/ folder! 💕`);
      }
    });
  }
}
