// Storage & Image Persistence Engine (IndexedDB + Canvas Downsampling + LocalStorage)

const LOCAL_IMG_DB = "ElaRomanticDB";
const LOCAL_IMG_STORE = "local_images";
const LOCAL_IMG_CACHE = {};
window.LOCAL_IMG_CACHE = LOCAL_IMG_CACHE;

function openLocalDatabase() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve(null);
    try {
      const req = indexedDB.open(LOCAL_IMG_DB, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(LOCAL_IMG_STORE)) {
          db.createObjectStore(LOCAL_IMG_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function saveImageToLocalDb(key, dataUrl) {
  try {
    const db = await openLocalDatabase();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(LOCAL_IMG_STORE, "readwrite");
      if (dataUrl) {
        tx.objectStore(LOCAL_IMG_STORE).put(dataUrl, key);
      } else {
        tx.objectStore(LOCAL_IMG_STORE).delete(key);
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}
window.saveImageToLocalDb = saveImageToLocalDb;

function optimizeImage(fileOrDataUrl, maxWidth = 720, maxHeight = 720, quality = 0.72) {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) return resolve(null);

    const processImg = (img, fallback) => {
      try {
        let { width, height } = img;
        if (!width || !height) return resolve(fallback);
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (err) {
        resolve(fallback);
      }
    };

    if (typeof fileOrDataUrl === "string") {
      if (!fileOrDataUrl.startsWith("data:image/")) return resolve(fileOrDataUrl);
      const img = new Image();
      img.onload = () => processImg(img, fileOrDataUrl);
      img.onerror = () => resolve(fileOrDataUrl);
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => processImg(img, e.target.result);
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

async function syncLocalDbImages() {
  try {
    try {
      const rawPhotos = localStorage.getItem("gf_city_photos");
      if (rawPhotos) {
        const p = JSON.parse(rawPhotos);
        for (const k in p) {
          const item = p[k];
          if (!item) continue;
          if (Array.isArray(item.images)) {
            for (let idx = item.images.length; idx <= 25; idx++) {
              const subKey = idx === 0 ? k : `${k}_${idx}`;
              delete LOCAL_IMG_CACHE[`city_${subKey}`];
              delete LOCAL_IMG_CACHE[subKey];
            }
            item.images.forEach((im, idx) => {
              if (im) {
                const subKey = idx === 0 ? k : `${k}_${idx}`;
                LOCAL_IMG_CACHE[`city_${subKey}`] = im;
                LOCAL_IMG_CACHE[subKey] = im;
                if (typeof im === "string" && im.startsWith("data:")) {
                  saveImageToLocalDb(`city_${subKey}`, im);
                }
              }
            });
            if (item.images.length === 0) {
              delete LOCAL_IMG_CACHE[`city_${k}`];
              delete LOCAL_IMG_CACHE[k];
            }
          } else if (item.img) {
            LOCAL_IMG_CACHE[`city_${k}`] = item.img;
            LOCAL_IMG_CACHE[k] = item.img;
            if (typeof item.img === "string" && item.img.startsWith("data:")) {
              saveImageToLocalDb(`city_${k}`, item.img);
            }
          } else if (item.img === "") {
            delete LOCAL_IMG_CACHE[`city_${k}`];
            delete LOCAL_IMG_CACHE[k];
          }
        }
      }
    } catch (e) {}

    try {
      const rawMem = localStorage.getItem("gf_memories");
      if (rawMem) {
        const mList = JSON.parse(rawMem);
        if (Array.isArray(mList)) {
          for (const m of mList) {
            if (m?.img) {
              LOCAL_IMG_CACHE[`mem_${m.id}`] = m.img;
              LOCAL_IMG_CACHE[m.id] = m.img;
              if (typeof m.img === "string" && m.img.startsWith("data:")) {
                saveImageToLocalDb(`mem_${m.id}`, m.img);
              }
            }
          }
        }
      }
    } catch (e) {}

    const db = await openLocalDatabase();
    if (db) {
      const tx = db.transaction(LOCAL_IMG_STORE, "readonly");
      const store = tx.objectStore(LOCAL_IMG_STORE);
      await new Promise((resolve) => {
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            const { key, value } = cursor;
            if (typeof key === "string" && value) {
              if (typeof value === "string" && value.startsWith("data:")) {
                LOCAL_IMG_CACHE[key] = value;
                if (key.startsWith("city_")) {
                  LOCAL_IMG_CACHE[key.replace("city_", "")] = value;
                } else if (key.startsWith("mem_")) {
                  LOCAL_IMG_CACHE[key.replace("mem_", "")] = value;
                }
              } else if (!LOCAL_IMG_CACHE[key]) {
                LOCAL_IMG_CACHE[key] = value;
              }
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        req.onerror = () => resolve();
      });
    }

    if (typeof state !== "undefined" && state.memories) {
      state.memories.forEach(m => {
        const img = LOCAL_IMG_CACHE[`mem_${m.id}`] || LOCAL_IMG_CACHE[m.id];
        if (img) m.img = img;
      });
    }
    if (typeof renderTimeline === "function") renderTimeline();
    if (typeof renderPolaroids === "function") renderPolaroids();
  } catch (e) {}
}

function generateDefaultCitySvg(key, story) {
  const s = story || (typeof CITY_STORIES !== "undefined" ? CITY_STORIES[key] : null) || { title: key, icon: "📍", tag: "Memory", colorA: "#ff758c", colorB: "#7028e4", symbol: "💖" };
  const cA = s.colorA || "#ff758c";
  const cB = s.colorB || "#7028e4";
  const sym = s.symbol || s.icon || "📍";
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="g_${key}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${cA}" />
        <stop offset="100%" stop-color="${cB}" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g_${key})" />
    <circle cx="300" cy="170" r="85" fill="rgba(255,255,255,0.18)" />
    <text x="300" y="185" font-size="70" text-anchor="middle" dominant-baseline="middle">${sym}</text>
    <rect x="140" y="270" width="320" height="34" rx="17" fill="rgba(0,0,0,0.35)" />
    <text x="300" y="292" font-size="13" font-family="sans-serif" font-weight="bold" fill="#ffd700" text-anchor="middle" letter-spacing="1.5">${(s.tag || "MEMORY DESTINATION").toUpperCase()}</text>
    <text x="300" y="345" font-size="22" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">${s.title}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function dataUrlToBlob(dataUrl) {
  try {
    const parts = dataUrl.split(",");
    const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    return null;
  }
}

async function saveFileToDisk(dataUrlOrSrc, suggestedName) {
  if (!dataUrlOrSrc) return false;

  const slug = (typeof window !== "undefined" && window.CURRENT_TENANT_SLUG) || (() => {
    if (typeof window === "undefined" || !window.location) return "demo";
    const m = window.location.pathname.match(/\/sites\/([a-zA-Z0-9_-]+)/);
    return m ? m[1] : "demo";
  })();

  // Try 1: multipart/form-data upload (safest against WAF/mod_security)
  if (typeof dataUrlOrSrc === "string" && dataUrlOrSrc.startsWith("data:")) {
    const blob = dataUrlToBlob(dataUrlOrSrc);
    if (blob) {
      try {
        const fd = new FormData();
        fd.append("filename", suggestedName);
        fd.append("image", blob, suggestedName);
        const res = await sendApiRequest("/save-image", {
          method: "POST",
          headers: { "X-Tenant-Slug": slug },
          body: fd
        });
        if (res && res.ok) {
          const json = await res.json().catch(() => null);
          if (json && (json.path || json.url || json.status === "ok" || json.success)) {
            return json.path || json.url || true;
          }
        }
      } catch (e) {}
    }
  }

  // Try 2: JSON base64 POST
  try {
    const res = await sendApiRequest("/save-image", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-Slug": slug },
      body: JSON.stringify({ filename: suggestedName, dataUrl: dataUrlOrSrc, slug })
    });
    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      if (json && (json.path || json.url || json.status === "ok" || json.success)) {
        return json.path || json.url || true;
      }
    }
  } catch (err) {}
  return false;
}

async function saveAudioToDisk(dataUrl, suggestedName = "audio.webm") {
  if (!dataUrl) return false;
  const slug = (typeof window !== "undefined" && window.CURRENT_TENANT_SLUG) || "demo";
  try {
    const res = await sendApiRequest("/save-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-Slug": slug },
      body: JSON.stringify({ filename: suggestedName, dataUrl, slug })
    });
    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      return json && (json.url || json.path) ? (json.url || json.path) : res.ok;
    }
    return false;
  } catch (err) {
    return false;
  }
}

async function deleteFileFromDisk(filename) {
  if (!filename) return false;
  const slug = (typeof window !== "undefined" && window.CURRENT_TENANT_SLUG) || "demo";
  try {
    const res = await sendApiRequest("/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-Slug": slug },
      body: JSON.stringify({ filename, slug })
    });
    return res ? res.ok : false;
  } catch (err) {
    return false;
  }
}

async function resetServerData() {
  try {
    const res = await sendApiRequest("/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    return res ? res.ok : false;
  } catch (err) {
    return false;
  }
}
function getCityPhotoData(key, fallbackKey) {
  const allChapters = (typeof window !== "undefined" && Array.isArray(window.TIMELINE_CHAPTERS) && window.TIMELINE_CHAPTERS.length > 0)
    ? window.TIMELINE_CHAPTERS
    : (typeof TIMELINE_CHAPTERS !== "undefined" ? TIMELINE_CHAPTERS : []);
  const isChapter = typeof key === "string" && (key.startsWith("chap-") || allChapters.some(c => c.id === key));
  const effectiveKey = key || fallbackKey || "guangzhou";
  const stories = typeof CITY_STORIES !== "undefined" ? CITY_STORIES : {};
  const story = stories[fallbackKey || key] || stories[key] || stories["guangzhou"] || {};
  const ch = allChapters.find(c => c.id === key) || null;
  let caption = (ch && ch.caption) ? ch.caption : ((ch && ch.title) ? ch.title : (story.defaultCaption || story.title || "Our favorite memory ❤️"));
  let desc = (ch && ch.desc) ? ch.desc : (story.desc || "");
  let img = (ch && ch.img) ? ch.img : null;
  let images = (ch && Array.isArray(ch.images) && ch.images.length > 0) ? [...ch.images] : (img ? [img] : []);
  let highlights = (ch && Array.isArray(ch.highlights)) ? [...ch.highlights] : null;
  const svgFallback = generateDefaultCitySvg(effectiveKey, story);

  if (ch && ((Array.isArray(ch.images) && ch.images.length > 0) || ch.img)) {
    images = (Array.isArray(ch.images) && ch.images.length > 0) ? [...ch.images] : [ch.img];
    img = images[0] || svgFallback;
    return { img, images, caption, desc, highlights, svgFallback };
  }

  let explicitPhotoSaved = false;

  const isIframe = typeof window !== "undefined" && window.parent && window.parent !== window;
  try {
    const saved = localStorage.getItem("gf_city_photos");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        const item = parsed[key] || (!isChapter && fallbackKey ? parsed[fallbackKey] : null);
        if (item && !isIframe) {
          if (item.caption && item.caption.trim()) caption = item.caption.trim();
          if (item.desc && item.desc.trim()) desc = item.desc.trim();
          if (Array.isArray(item.highlights) && item.highlights.length > 0) highlights = item.highlights;
          if (Array.isArray(item.images)) {
            images = item.images.filter(im => im && !im.startsWith("data:image/svg+xml"));
            img = images[0] || (item.img && !item.img.startsWith("data:image/svg+xml") ? item.img : "");
            explicitPhotoSaved = true;
          } else if (item.img !== undefined) {
            img = item.img && !item.img.startsWith("data:image/svg+xml") ? item.img : "";
            images = img ? [img] : [];
            explicitPhotoSaved = true;
          }
        }
      }
    }
  } catch (e) {}

  if (!desc || !desc.trim()) {
    desc = (ch && ch.desc) ? ch.desc : (story.desc || "");
  }

  if (!highlights && typeof TIMELINE_CHAPTERS !== "undefined") {
    const ch = TIMELINE_CHAPTERS.find(c => c.id === key || (!isChapter && (c.cityKey === key || (fallbackKey && (c.id === fallbackKey || c.cityKey === fallbackKey)))));
    if (ch && Array.isArray(ch.highlights)) highlights = [...ch.highlights];
  }

  if (explicitPhotoSaved) {
    if (Array.isArray(images) && images.length > 0) {
      images = images.map((im, i) => {
        const subKey = i === 0 ? key : `${key}_${i}`;
        const cached = LOCAL_IMG_CACHE[`city_${subKey}`] || LOCAL_IMG_CACHE[subKey] || (fallbackKey ? (LOCAL_IMG_CACHE[`city_${fallbackKey}_${i}`] || LOCAL_IMG_CACHE[`${fallbackKey}_${i}`]) : null);
        return (cached && typeof cached === "string" && cached.startsWith("data:")) ? cached : im;
      });
      img = images[0] || img;
    }
    if (!img || images.length === 0) {
      img = svgFallback;
      images = [];
    }
    return { img, images, caption, desc, highlights, svgFallback };
  }

  if (!isChapter) {
    if (LOCAL_IMG_CACHE[`city_${key}`]) {
      img = LOCAL_IMG_CACHE[`city_${key}`];
    } else if (LOCAL_IMG_CACHE[key]) {
      img = LOCAL_IMG_CACHE[key];
    } else if (fallbackKey && LOCAL_IMG_CACHE[`city_${fallbackKey}`]) {
      img = LOCAL_IMG_CACHE[`city_${fallbackKey}`];
    } else if (fallbackKey && LOCAL_IMG_CACHE[fallbackKey]) {
      img = LOCAL_IMG_CACHE[fallbackKey];
    }
  } else {
    if (LOCAL_IMG_CACHE[`city_${key}`]) img = LOCAL_IMG_CACHE[`city_${key}`];
    else if (LOCAL_IMG_CACHE[key]) img = LOCAL_IMG_CACHE[key];
  }

  if (images.length === 0) {
    if (img) images.push(img);
    for (let i = 1; i <= 20; i++) {
      const cachedSub = LOCAL_IMG_CACHE[`city_${key}_${i}`] || (!isChapter && fallbackKey ? LOCAL_IMG_CACHE[`city_${fallbackKey}_${i}`] : null);
      if (cachedSub && !images.includes(cachedSub)) images.push(cachedSub);
    }
  }

  if (!img) {
    if (ch && (ch.img || (Array.isArray(ch.images) && ch.images[0]))) {
      img = ch.img || ch.images[0];
    } else {
      img = `images/${key}.jpg`;
    }
    if (images.length === 0) images.push(img);
  }

  return { img, images, caption, desc, highlights, svgFallback };
}

async function saveCityPhotoData(key, imgDataOrImages, caption, desc, fallbackKey, highlights, title) {
  let photos = {};
  try {
    const saved = localStorage.getItem("gf_city_photos");
    if (saved) photos = JSON.parse(saved) || {};
  } catch (e) {}
  
  const existing = photos[key] || (fallbackKey ? photos[fallbackKey] : {}) || {};
  const stories = typeof CITY_STORIES !== "undefined" ? CITY_STORIES : {};
  const story = stories[key] || (fallbackKey ? stories[fallbackKey] : {}) || {};
  
  const entry = {
    title: title !== undefined ? title : (existing.title || (story.title || "")),
    caption: caption !== undefined ? caption : (existing.caption || (story.defaultCaption || "Our favorite memory ❤️")),
    desc: desc !== undefined ? desc : (existing.desc !== undefined ? existing.desc : (story.desc || ""))
  };

  if (highlights !== undefined) {
    entry.highlights = Array.isArray(highlights)
      ? highlights
      : (typeof highlights === "string" ? highlights.split("\n").map(s => s.replace(/^[✨•\-\*]\s*/, '').trim()).filter(Boolean) : []);
  } else if (existing.highlights) {
    entry.highlights = existing.highlights;
  }

  const imagesList = Array.isArray(imgDataOrImages)
    ? imgDataOrImages.filter(Boolean)
    : (imgDataOrImages ? [imgDataOrImages] : []);

  const oldImages = Array.isArray(existing.images) ? existing.images : (existing.img ? [existing.img] : []);

  const savedPaths = [];
  let hadDiskSaveFailure = false;
  if (imagesList.length > 0) {
    for (let idx = 0; idx < imagesList.length; idx++) {
      const imgItem = imagesList[idx];
      let diskPath = imgItem;

      if (typeof imgItem === "string" && imgItem.startsWith("data:")) {
        const uniqueId = `${key}_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;
        const fname = `${uniqueId}.jpg`;
        const saved = await saveFileToDisk(imgItem, fname);
        if (saved) {
          const slug = (typeof window !== "undefined" && window.CURRENT_TENANT_SLUG) || "demo";
          diskPath = (typeof saved === "string" && !saved.startsWith("data:")) ? saved : `/uploads/${slug}/${fname}`;
        } else {
          hadDiskSaveFailure = true;
          diskPath = imgItem;
        }
      }
      savedPaths.push(diskPath);

      const subKey = idx === 0 ? key : `${key}_${idx}`;
      LOCAL_IMG_CACHE[`city_${subKey}`] = diskPath;
      LOCAL_IMG_CACHE[subKey] = diskPath;
      const storeData = (typeof imgItem === "string" && imgItem.startsWith("data:")) ? imgItem : diskPath;
      await saveImageToLocalDb(`city_${subKey}`, storeData);

      if (fallbackKey && fallbackKey !== key) {
        const subFbKey = idx === 0 ? fallbackKey : `${fallbackKey}_${idx}`;
        LOCAL_IMG_CACHE[`city_${subFbKey}`] = diskPath;
        LOCAL_IMG_CACHE[subFbKey] = diskPath;
        await saveImageToLocalDb(`city_${subFbKey}`, storeData);
      }
    }

    // Clean up stale higher indices from cache
    for (let idx = imagesList.length; idx <= 30; idx++) {
      for (const k of [key, fallbackKey].filter(Boolean)) {
        const sub = `${k}_${idx}`;
        delete LOCAL_IMG_CACHE[`city_${sub}`];
        delete LOCAL_IMG_CACHE[sub];
        await saveImageToLocalDb(`city_${sub}`, null);
        await saveImageToLocalDb(sub, null);
      }
    }

    entry.img = savedPaths[0];
    entry.images = [...savedPaths];
  } else {
    entry.img = "";
    entry.images = [];
    for (let idx = 0; idx <= 30; idx++) {
      for (const k of [key, fallbackKey].filter(Boolean)) {
        const sub = idx === 0 ? k : `${k}_${idx}`;
        delete LOCAL_IMG_CACHE[`city_${sub}`];
        delete LOCAL_IMG_CACHE[sub];
        await saveImageToLocalDb(`city_${sub}`, null);
        await saveImageToLocalDb(sub, null);
      }
    }
  }

  photos[key] = entry;
  if (!key.startsWith("chap-") && fallbackKey && fallbackKey !== key) {
    photos[fallbackKey] = { ...entry };
  }

  // Safe removal of deleted custom disk files
  const allReferenced = new Set();
  for (const pk in photos) {
    const it = photos[pk];
    if (it) {
      if (Array.isArray(it.images)) it.images.forEach(im => allReferenced.add(im));
      if (it.img) allReferenced.add(it.img);
    }
  }
  for (const oldImg of oldImages) {
    if (typeof oldImg === "string" && oldImg && !allReferenced.has(oldImg)) {
      const bn = oldImg.replace(/^.*[\/\\]/, "");
      const isStock = ["china.jpg", "algeria.jpg", "guangzhou.jpg", "shenzhen.jpg", "chongqing.jpg", "chengdu.jpg", "dagu.jpg", "bipenggou.jpg", "jiuzhaigou.jpg", "huanglong.jpg", "nansha.jpg", "wuhan.jpg", "nanjing.jpg", "shanghai.jpg", "vietnam.jpg", "jakarta.jpg", "indonesia.jpg"].includes(bn);
      if (!isStock) {
        await deleteFileFromDisk(oldImg);
      }
    }
  }

  const timestamp = new Date().toISOString();
  try {
    localStorage.setItem("gf_city_photos", JSON.stringify(photos));
    localStorage.setItem("gf_saved_at", timestamp);
  } catch (err) {}
  if (hadDiskSaveFailure && typeof showComplimentToast === "function") {
    showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "⚠️ Saved locally! Server images/ folder wasn't writable. Run: chmod -R 777 images");
  }
  await saveToComputer({ gf_city_photos: JSON.stringify(photos), gf_saved_at: timestamp });
}

function loadStoredMemories() {
  try {
    const raw = JSON.parse(localStorage.getItem("gf_memories"));
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map(m => {
        const def = DEFAULTS.memories.find(d => d.id === m.id);
        const cached = LOCAL_IMG_CACHE[`mem_${m.id}`] || LOCAL_IMG_CACHE[m.id];
        const defaultImg = (def && def.img) ? def.img : `images/${m.id}.jpg`;
        const svg = def ? generateDefaultCitySvg(m.id) : "";
        return {
          ...m,
          desc: m.desc !== undefined ? m.desc : (def ? def.desc : ""),
          img: cached || (m.img && !m.img.startsWith("data:image/svg+xml") ? m.img : "") || defaultImg,
          svgFallback: svg
        };
      });
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULTS.memories));
}

let _workingUrlTemplate = null;

async function sendApiRequest(endpoint, options = {}) {
  const clean = endpoint.replace(/^\//, "");
  const authData = (() => {
    try { return JSON.parse(localStorage.getItem('lovesaas_auth') || '{}'); } catch { return {}; }
  })();
  const userToken = typeof localStorage !== 'undefined' ? localStorage.getItem('lovesaas_user_token') : null;
  options.headers = options.headers || {};
  if (authData.authToken && !options.headers['X-Auth-Token']) options.headers['X-Auth-Token'] = authData.authToken;
  if (userToken && !options.headers['X-User-Token']) {
    options.headers['X-User-Token'] = userToken;
    options.headers['Authorization'] = `Bearer ${userToken}`;
  }

  if (_workingUrlTemplate) {
    try {
      const u = _workingUrlTemplate.replace("{clean}", clean);
      const res = await fetch(u, options);
      if (res && res.ok) return res;
    } catch {}
    _workingUrlTemplate = null;
  }

  const urls = [];
  if (typeof window !== "undefined" && window.location?.protocol.startsWith("http")) {
    const p = window.location.pathname.replace(/\/index\.html$/i, "").replace(/\/$/, "");
    urls.push(
      `/api/${clean}`,
      `/api.php?endpoint=${clean}`,
      `api.php?endpoint=${clean}`,
      `${window.location.origin}/api/${clean}`,
      `${window.location.origin}/api.php?endpoint=${clean}`,
      `${window.location.origin}${p}/api/${clean}`,
      `${window.location.origin}${p}/api.php?endpoint=${clean}`
    );
  }
  urls.push(
    `http://localhost:3000/api/${clean}`,
    `http://localhost:5173/api/${clean}`
  );
  for (const u of [...new Set(urls)]) {
    try {
      const res = await fetch(u, options);
      if (res && res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("json") || ct.includes("javascript")) {
          _workingUrlTemplate = u.replace(clean, "{clean}");
          return res;
        }
      }
    } catch {}
  }
  return null;
}

const _origSetItem = localStorage.setItem.bind(localStorage);
const _origRemoveItem = localStorage.removeItem.bind(localStorage);
let _saveDebounceTimer = null;
let _isHydrating = false;
let _isSaving = false;

function isInsideBuilderContext() {
  if (typeof window === "undefined") return false;
  return window.parent !== window ||
    window.location.search.includes("preview=builder") ||
    window.location.search.includes("builder=1") ||
    (document.body && (document.body.classList.contains("in-builder-preview") || document.body.classList.contains("builder-mode")));
}

function debouncedSaveToComputer() {
  if (_isHydrating || isInsideBuilderContext()) return;
  clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(() => {
    saveToComputer();
  }, 800);
}

// Auto-sync gf_* modifications directly to disk (exclude internal/runtime keys)
const IGNORED_SYNC_KEYS = new Set(["gf_saved_at", "gf_volume", "gf_redeemed_coupons"]);

localStorage.setItem = function(key, val) {
  _origSetItem(key, val);
  if (typeof key === "string" && key.startsWith("gf_") && !IGNORED_SYNC_KEYS.has(key)) {
    debouncedSaveToComputer();
  }
};

localStorage.removeItem = function(key) {
  _origRemoveItem(key);
  if (typeof key === "string" && key.startsWith("gf_") && !IGNORED_SYNC_KEYS.has(key)) {
    debouncedSaveToComputer();
  }
};

async function syncComputerData() {
  _isHydrating = true;
  try {
    let res = await sendApiRequest("/data", { cache: "no-store" });
    if (!res) {
      try {
        const fallbackRes = await fetch("saved-data.json", { cache: "no-store" });
        if (fallbackRes && fallbackRes.ok) res = fallbackRes;
      } catch (e) {}
    }
    if (!res) {
      _isHydrating = false;
      return false;
    }
    const data = await res.json();
    if (!data || Object.keys(data).length === 0) {
      _isHydrating = false;
      return false;
    }

    window.SERVER_DATA = data;

    // 1. Direct gf_* key restore (skip redeemed coupons — always start fresh)
    for (const [key, val] of Object.entries(data)) {
      if (key.startsWith("gf_") && key !== "gf_redeemed_coupons") {
        const strVal = typeof val === "string" ? val : JSON.stringify(val);
        _origSetItem(key, strVal);
      }
    }

    // 2. Direct REASONS unpack & assign
    const rawReasons = data.gf_reasons || data.reasons;
    if (rawReasons) {
      try {
        const parsedReasons = typeof rawReasons === "string" ? JSON.parse(rawReasons) : rawReasons;
        if (Array.isArray(parsedReasons) && parsedReasons.length > 0) {
          REASONS = parsedReasons;
          _origSetItem("gf_reasons", JSON.stringify(parsedReasons));
        }
      } catch (e) {}
    }

    // 3. Structured field fallback mapping
    const mapping = {
      partnerName: "gf_name",
      senderName: "gf_sender",
      startDate: "gf_start_date",
      letter: "gf_letter",
      giftTitle: "gf_gift_title",
      giftDesc: "gf_gift_desc",
      partnerNick: "gf_partner_nick",
      specialWord: "gf_special_word",
      theme: "gf_theme",
      clockFormat: "gf_clock_format",
      particleStyle: "gf_particle_style",
      particleDensity: "gf_particle_density",
      pumpLabel: "gf_pump_label",
      seatNumber: "gf_seat_number",
      flightNumber: "gf_flight_number",
      envelopeSeal: "gf_envelope_seal",
      cityAlg: "gf_city_alg",
      cityJak: "gf_city_jak",
      tickerPace: "gf_ticker_pace",
      voiceAudio: "gf_voice_audio",
      letterAudio: "gf_letter_audio",
      herVoiceAudio: "gf_her_voice_audio",
      customMusicAudio: "gf_music_audio",
      voiceVolume: "gf_voice_volume",
      voiceBgVolume: "gf_voice_bg_volume",
      letterVoiceVolume: "gf_letter_voice_volume",
      letterBgVolume: "gf_letter_bg_volume",
      savedTripWish: "gf_saved_trip_wish",
      adminEdit: "gf_admin_edit"
    };

    for (const [key, lsKey] of Object.entries(mapping)) {
      if (data[key] !== undefined && typeof data[key] === "string") {
        _origSetItem(lsKey, data[key]);
      }
    }

    if (Array.isArray(data.customReasons)) {
      _origSetItem("gf_custom_reasons", JSON.stringify(data.customReasons));
    }
    if (Array.isArray(data.memories)) {
      _origSetItem("gf_memories", JSON.stringify(data.memories));
    }
    if (Array.isArray(data.starredNotes)) {
      _origSetItem("gf_starred_notes", JSON.stringify(data.starredNotes));
    }
    if (data.cityPhotos && typeof data.cityPhotos === "object") {
      _origSetItem("gf_city_photos", JSON.stringify(data.cityPhotos));
    }

    if (typeof state !== "undefined") {
      state.memories = loadStoredMemories();
      if (typeof renderPolaroids === "function") {
        renderPolaroids();
      }
    }

    _isHydrating = false;
    return true;
  } catch (e) {
    _isHydrating = false;
    return false;
  }
}

async function saveToComputer(extraData = {}) {
  if (isInsideBuilderContext() || _isSaving) return false;
  _isSaving = true;
  try {
    const nowIso = new Date().toISOString();
    const payload = {
      savedAt: nowIso,
      gf_saved_at: nowIso,
      ...extraData
    };
    try { _origSetItem("gf_saved_at", nowIso); } catch (e) {}

    // Collect all gf_* keys from localStorage (skip coupons and memories — save memories only on explicit action)
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("gf_") && k !== "gf_redeemed_coupons" && k !== "gf_memories") {
        payload[k] = localStorage.getItem(k);
      }
    }

    // Always ensure REASONS is directly in payload
    if (typeof REASONS !== "undefined" && Array.isArray(REASONS) && REASONS.length > 0) {
      payload.gf_reasons = JSON.stringify(REASONS);
    }

    // Add structured representations for convenience
    if (typeof state !== "undefined") {
      payload.partnerName = state.partnerName;
      payload.senderName = state.senderName;
      payload.startDate = state.startDate;
      payload.letter = state.letter;
      payload.giftTitle = state.giftTitle;
      payload.giftDesc = state.giftDesc;
      if (state.voiceAudio) payload.gf_voice_audio = state.voiceAudio;
      if (state.letterAudio) payload.gf_letter_audio = state.letterAudio;
      if (state.herVoiceAudio) payload.gf_her_voice_audio = state.herVoiceAudio;
      if (state.customMusicAudio) payload.gf_music_audio = state.customMusicAudio;
      if (state.voiceVolume !== undefined) payload.gf_voice_volume = String(state.voiceVolume);
      if (state.voiceBgVolume !== undefined) payload.gf_voice_bg_volume = String(state.voiceBgVolume);
      if (state.letterVoiceVolume !== undefined) payload.gf_letter_voice_volume = String(state.letterVoiceVolume);
      if (state.letterBgVolume !== undefined) payload.gf_letter_bg_volume = String(state.letterBgVolume);
    }

    Object.assign(payload, extraData);

    const res = await sendApiRequest("/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return res ? res.ok : false;
  } catch (e) {
    return false;
  } finally {
    _isSaving = false;
  }
}

