/**
 * Builder Inspector Module: hero
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["hero"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {},
      openMediaPicker = () => {}
    } = ctx || {};

if (!state.sectionsData.hero) state.sectionsData.hero = {};
      const h = state.sectionsData.hero;
      if (!h.voiceAudio) h.voiceAudio = "audio/myrecording-volume-adjusted.m4r";
      if (!h.musicTrackTitle) h.musicTrackTitle = "The Fate of Ophelia • Taylor Swift ✨";
      if (!h.musicTrackUrl) h.musicTrackUrl = "taylor-swift-fate-of-ophelia.m4r";

      inspectorFormContainer.innerHTML = `
        <!-- SUBTABS NAVIGATION: SEPARATE HERO, SMALL VOICE WIDGET, AND BACKGROUND MUSIC -->
        <div class="hero-subtabs-bar">
          <button type="button" class="hero-subtab-btn active" data-subtab="main">👑 1. Hero Banner</button>
          <button type="button" class="hero-subtab-btn" data-subtab="voice">🎙️ 2. Small Voice Widget</button>
          <button type="button" class="hero-subtab-btn" data-subtab="music">🎵 3. Background Music</button>
          <button type="button" class="hero-subtab-btn" data-subtab="theme">🎨 4. Theme & Wallpaper</button>
        </div>

        <!-- PANE 1: MAIN HERO BANNER & CLOCKS -->
        <div class="hero-subpane active" id="heroSubtab_main">
          <div class="grid-2">
            <div class="input-group">
              <label>Partner 1 Name (Sender)</label>
              <input type="text" id="h_p1" value="${escapeHtml(h.partner1 || state.partner1 || 'Partner 1')}">
            </div>
            <div class="input-group">
              <label>Partner 2 Name (Receiver)</label>
              <input type="text" id="h_p2" value="${escapeHtml(h.partner2 || state.partner2 || 'Partner 2')}">
            </div>
          </div>
          <div class="input-group">
            <label>Subtitle / Motto</label>
            <input type="text" id="h_subtitle" value="${escapeHtml(h.subtitle || 'Our Infinite Love Story ❤️')}">
          </div>
          <div class="input-group">
            <label>Hero Description Message</label>
            <textarea id="h_heroDesc" rows="3">${escapeHtml(h.heroDesc || 'Today is all about celebrating you. Even across the miles in our long-distance journey, my heart is always right beside you. Here is our personal world filled with birthday wishes, kisses, and hugs!')}</textarea>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>City 1 (Departure)</label>
              <input type="text" id="h_city1" value="${escapeHtml(h.cityAlg || 'Paris 🇫🇷')}">
            </div>
            <div class="input-group">
              <label>City 2 (Destination)</label>
              <input type="text" id="h_city2" value="${escapeHtml(h.cityPartner || 'Tokyo 🇯🇵')}">
            </div>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Flag / Icon 1</label>
              <input type="text" id="h_flag1" value="${escapeHtml(h.flag1 || '🇩🇿')}">
            </div>
            <div class="input-group">
              <label>Flag / Icon 2</label>
              <input type="text" id="h_flag2" value="${escapeHtml(h.flag2 || '🇮🇩')}">
            </div>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Physical Distance (KM)</label>
              <input type="text" id="h_dist" value="${escapeHtml(h.distanceKm || '11,550')}">
            </div>
            <div class="input-group">
              <label>Flight Code</label>
              <input type="text" id="h_flight" value="${escapeHtml(h.flightNumber || 'LOF-777')}">
            </div>
          </div>
          <div class="input-group">
            <label>Anniversary Date & Time</label>
            <input type="datetime-local" id="h_anni" value="${h.anniversaryDate ? h.anniversaryDate.substring(0, 16) : ''}">
          </div>
        </div>

        <!-- PANE 2: SMALL HERO VOICE NOTE WIDGET -->
        <div class="hero-subpane" id="heroSubtab_voice">
          <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin: 0;">🎙️ Small Hero Voice Memo Widget</h4>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer;">
                <input type="checkbox" id="h_show_voice" ${h.showVoiceWidget !== false ? 'checked' : ''}>
                <span>Active inside Hero</span>
              </label>
            </div>
            <div class="grid-2">
              <div class="input-group">
                <label>Widget Card Title</label>
                <input type="text" id="h_voice_title" value="${escapeHtml(h.voiceTitle || 'My Voice for You')}">
              </div>
              <div class="input-group">
                <label>Sender Origin Badge</label>
                <input type="text" id="h_voice_badge" value="${escapeHtml(h.voiceBadge || `From ${h.cityAlg || 'Paris'} 🇩🇿`)}">
              </div>
            </div>
            <div class="input-group">
              <label>Widget Subtitle / Status Prompt</label>
              <input type="text" id="h_voice_subtitle" value="${escapeHtml(h.voiceSubtitle || 'Tap to listen to my voice & kissies ❤️')}">
            </div>
            <div class="input-group" style="margin-bottom: 10px;">
              <label>Voice Memo Preset</label>
              <select id="h_voice_preset" class="inspector-select" style="width: 100%;">
                <option value="audio/myrecording-volume-adjusted.m4r">🎙️ Authentic Voice Memo (Volume Boosted ⚡ - Original Production)</option>
                <option value="audio/myrecording.m4r">🎙️ Original Voice Memo (Raw Recording)</option>
                <option value="custom">⚙️ Custom Audio URL / Cloudflare R2 Upload</option>
              </select>
            </div>
            <div class="input-group">
              <label>Audio URL / Path</label>
              <div style="display:flex; gap:6px;">
                <input type="text" id="h_voice" value="${escapeHtml(h.voiceAudio || 'audio/myrecording-volume-adjusted.m4r')}" style="flex:1;">
                <label class="file-upload-btn" style="cursor:pointer; display:inline-flex; align-items:center; padding: 5px 10px; background: rgba(255,255,255,0.08); border-radius:6px; font-size:12px; white-space:nowrap;">
                  <span>Upload</span>
                  <input type="file" id="h_voiceFileInput" accept="audio/*" style="display:none;">
                </label>
                <button type="button" class="btn-pick-from-media" id="btnPickHeroVoiceFromMedia" title="Pick voice memo from media library">📁 Library</button>
              </div>
              <div id="h_voiceUploadStatus" style="font-size:11px; color:var(--text-muted); margin-top:4px;"></div>
            </div>
            <div style="margin-top: 10px;">
              <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Studio Audio Preview:</label>
              <audio id="h_voicePreview" controls src="${escapeHtml(h.voiceAudio || 'audio/myrecording-volume-adjusted.m4r')}" style="width: 100%; height: 36px;"></audio>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              <button type="button" id="btnTestVoicePlay" class="btn-sm btn-secondary">▶️ Test Voice Note in Preview Site</button>
            </div>
          </div>
        </div>

        <!-- PANE 3: BACKGROUND SOUNDTRACK -->
        <div class="hero-subpane" id="heroSubtab_music">
          <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
            <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">🎵 Romantic Background Soundtrack</h4>
            <div class="input-group" style="margin-bottom: 10px;">
              <label>Soundtrack Preset (Intro & Floating Vinyl Player)</label>
              <select id="h_music_preset" class="inspector-select" style="width: 100%;">
                <option value="taylor-swift-fate-of-ophelia.m4r" data-title="The Fate of Ophelia" data-artist="Taylor Swift ✨">🎵 Taylor Swift — The Fate of Ophelia ✨</option>
                <option value="lady-gaga-always-remember-us-this-way.m4r" data-title="Always Remember Us This Way" data-artist="Lady Gaga 🌹">🌹 Lady Gaga — Always Remember Us This Way 🌹</option>
                <option value="imagine-dragons-i-follow-you.m4r" data-title="Follow You" data-artist="Imagine Dragons 💫">💫 Imagine Dragons — Follow You 💫</option>
                <option value="custom">⚙️ Custom Music Track / Cloudflare R2 Upload</option>
              </select>
            </div>
            <div class="grid-2">
              <div class="input-group">
                <label>Track Title (Floating Music Bar)</label>
                <input type="text" id="h_musicTitle" value="${escapeHtml(h.musicTrackTitle || 'The Fate of Ophelia • Taylor Swift ✨')}">
              </div>
              <div class="input-group">
                <label>Track Audio URL / Path</label>
                <div style="display:flex; gap:6px;">
                  <input type="text" id="h_musicUrl" value="${escapeHtml(h.musicTrackUrl || 'taylor-swift-fate-of-ophelia.m4r')}" style="flex:1;">
                  <label class="file-upload-btn" style="cursor:pointer; display:inline-flex; align-items:center; padding: 5px 10px; background: rgba(255,255,255,0.08); border-radius:6px; font-size:12px; white-space:nowrap;">
                    <span>Upload</span>
                    <input type="file" id="h_musicFileInput" accept="audio/*" style="display:none;">
                  </label>
                  <button type="button" class="btn-pick-from-media" id="btnPickHeroMusicFromMedia" title="Pick soundtrack from media library">📁 Library</button>
                </div>
              </div>
            </div>
            <div id="h_musicUploadStatus" style="font-size:11px; color:var(--text-muted); margin-top:4px;"></div>
            <div style="margin-top: 10px;">
              <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Studio Soundtrack Preview:</label>
              <audio id="h_musicPreview" controls src="${escapeHtml(h.musicTrackUrl || 'taylor-swift-fate-of-ophelia.m4r')}" style="width: 100%; height: 36px;"></audio>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              <button type="button" id="btnTestMusicPlay" class="btn-sm btn-secondary">🎵 Toggle Music in Preview Site</button>
            </div>
          </div>
        </div>

        <!-- PANE 4: THEME & BACKGROUND WALLPAPER -->
        <div class="hero-subpane" id="heroSubtab_theme">
          <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin: 0;">🎨 Website Visual Theme & Wallpaper</h4>
              <button type="button" id="btnGoToSiteThemeTab" class="btn-sm btn-secondary" style="font-size: 11px; cursor: pointer;">⚙️ All Themes →</button>
            </div>
            <div class="input-group">
              <label>Custom Background Wallpaper Image</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" id="h_customBgUrl" placeholder="Paste image URL or upload..." value="${escapeHtml(state.customBgUrl || '')}" style="flex: 1; font-size: 12px;">
                <button type="button" id="btnHeroPickBg" class="btn-sm btn-secondary" style="cursor: pointer; white-space: nowrap;">📁 Library</button>
                <label class="file-upload-btn" style="cursor: pointer; display: inline-flex; align-items: center; padding: 5px 10px; background: rgba(255,255,255,0.08); border-radius: 6px; font-size: 12px; white-space: nowrap;">
                  <span>⬆️ Upload</span>
                  <input type="file" id="heroUploadBgFile" accept="image/*" style="display: none;">
                </label>
              </div>
              ${state.customBgUrl ? `
                <div style="margin-top: 10px; width: 100%; height: 90px; background: url('${escapeHtml(state.customBgUrl)}') center/cover no-repeat; border-radius: 6px; border: 1px solid var(--primary);"></div>
              ` : `
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">Currently using theme preset background. You can choose a custom wallpaper above or pick from 11 illustrated presets in <a href="#" id="linkGoToTheme" style="color: var(--primary); text-decoration: underline;">Site & Theme</a>.</p>
              `}
            </div>
          </div>
        </div>
      `;

      // Subtab switcher bindings
      const subtabBtns = inspectorFormContainer.querySelectorAll ? inspectorFormContainer.querySelectorAll(".hero-subtab-btn") : [];
      const subtabPanes = inspectorFormContainer.querySelectorAll ? inspectorFormContainer.querySelectorAll(".hero-subpane") : [];
      subtabBtns.forEach(btn => {
        btn.onclick = () => {
          const target = btn.dataset.subtab;
          subtabBtns.forEach(b => b.classList.toggle("active", b === btn));
          subtabPanes.forEach(pane => pane.classList.toggle("active", pane.id === `heroSubtab_${target}`));
        };
      });

      const bindHero = (id, key) => {
        const el = document.getElementById(id);
        if (el) {
          el.oninput = (e) => {
            h[key] = e.target.value.trim();
            debouncedLiveUpdate();
          };
        }
      };
      bindHero("h_p1", "partner1");
      bindHero("h_p2", "partner2");
      bindHero("h_subtitle", "subtitle");
      bindHero("h_heroDesc", "heroDesc");
      bindHero("h_city1", "cityAlg");
      bindHero("h_city2", "cityPartner");
      bindHero("h_flag1", "flag1");
      bindHero("h_flag2", "flag2");
      bindHero("h_dist", "distanceKm");
      bindHero("h_flight", "flightNumber");
      bindHero("h_voice_title", "voiceTitle");
      bindHero("h_voice_subtitle", "voiceSubtitle");
      bindHero("h_voice_badge", "voiceBadge");
      bindHero("h_musicTitle", "musicTrackTitle");

      const showVoiceToggle = document.getElementById("h_show_voice");
      if (showVoiceToggle) {
        showVoiceToggle.onchange = (e) => {
          h.showVoiceWidget = e.target.checked;
          debouncedLiveUpdate(true);
        };
      }

      const anniEl = document.getElementById("h_anni");
      if (anniEl) {
        anniEl.onchange = (e) => {
          h.anniversaryDate = e.target.value;
          debouncedLiveUpdate();
        };
      }

      // Voice Memo controls
      const voicePreset = document.getElementById("h_voice_preset");
      const voiceInput = document.getElementById("h_voice");
      const voicePreview = document.getElementById("h_voicePreview");
      const curVoice = h.voiceAudio || "audio/myrecording-volume-adjusted.m4r";
      if (voicePreset) {
        if (curVoice === "audio/myrecording-volume-adjusted.m4r" || curVoice === "myrecording-volume-adjusted.m4r") {
          voicePreset.value = "audio/myrecording-volume-adjusted.m4r";
        } else if (curVoice === "audio/myrecording.m4r" || curVoice === "myrecording.m4r") {
          voicePreset.value = "audio/myrecording.m4r";
        } else {
          voicePreset.value = "custom";
        }
        voicePreset.onchange = (e) => {
          if (e.target.value !== "custom") {
            h.voiceAudio = e.target.value;
            if (voiceInput) voiceInput.value = e.target.value;
            if (voicePreview) voicePreview.src = e.target.value;
            debouncedLiveUpdate();
          }
        };
      }
      if (voiceInput) {
        voiceInput.oninput = (e) => {
          h.voiceAudio = e.target.value.trim();
          if (voicePreview) voicePreview.src = h.voiceAudio;
          if (voicePreset && !["audio/myrecording-volume-adjusted.m4r", "audio/myrecording.m4r"].includes(h.voiceAudio)) {
            voicePreset.value = "custom";
          }
          debouncedLiveUpdate();
        };
      }
      const voiceFileInput = document.getElementById("h_voiceFileInput");
      const voiceUploadStatus = document.getElementById("h_voiceUploadStatus");
      if (voiceFileInput) {
        voiceFileInput.onchange = async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const MAX_SIZE = 10 * 1024 * 1024; // 10MB (10 Mo)
          if (file.size > MAX_SIZE) {
            const mb = (file.size / (1024 * 1024)).toFixed(1);
            if (voiceUploadStatus) {
              voiceUploadStatus.textContent = `❌ Voice file size (${mb} MB) exceeds 10 Mo (10MB) limit!`;
              voiceUploadStatus.style.color = "#ff4365";
            }
            voiceFileInput.value = "";
            return;
          }
          if (voiceUploadStatus) {
            voiceUploadStatus.textContent = "Uploading voice memo to R2 (max 10 Mo)...";
            voiceUploadStatus.style.color = "var(--text-muted)";
          }
          try {
            const publicUrl = await uploadFileToR2(file);
            h.voiceAudio = publicUrl;
            if (voiceInput) voiceInput.value = publicUrl;
            if (voicePreview) voicePreview.src = publicUrl;
            if (voicePreset) voicePreset.value = "custom";
            if (voiceUploadStatus) {
              voiceUploadStatus.textContent = `✓ Voice memo uploaded successfully (${(file.size / (1024 * 1024)).toFixed(2)} MB)!`;
              voiceUploadStatus.style.color = "#2ed573";
            }
            debouncedLiveUpdate();
          } catch (err) {
            if (voiceUploadStatus) {
              voiceUploadStatus.textContent = "Upload failed: " + err.message;
              voiceUploadStatus.style.color = "#ff4365";
            }
          }
        };
      }
      const btnPickHeroVoiceFromMedia = document.getElementById("btnPickHeroVoiceFromMedia");
      if (btnPickHeroVoiceFromMedia) {
        btnPickHeroVoiceFromMedia.onclick = () => {
          if (typeof openMediaPicker === "function") {
            openMediaPicker({
              filter: "audio",
              onSelect: (url) => {
                h.voiceAudio = url;
                if (voiceInput) voiceInput.value = url;
                if (voicePreview) voicePreview.src = url;
                if (voicePreset) voicePreset.value = "custom";
                debouncedLiveUpdate();
              }
            });
          }
        };
      }
      const btnTestVoicePlay = document.getElementById("btnTestVoicePlay");
      if (btnTestVoicePlay) {
        btnTestVoicePlay.onclick = () => {
          if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.postMessage({ type: "HERO_VOICE_TOGGLE" }, "*");
          }
        };
      }

      // Romantic Soundtrack controls
      const musicPreset = document.getElementById("h_music_preset");
      const musicUrlInput = document.getElementById("h_musicUrl");
      const musicTitleInput = document.getElementById("h_musicTitle");
      const musicPreview = document.getElementById("h_musicPreview");
      const curMusic = h.musicTrackUrl || "taylor-swift-fate-of-ophelia.m4r";
      if (musicPreset) {
        if (curMusic.includes("taylor-swift")) {
          musicPreset.value = "taylor-swift-fate-of-ophelia.m4r";
        } else if (curMusic.includes("lady-gaga")) {
          musicPreset.value = "lady-gaga-always-remember-us-this-way.m4r";
        } else if (curMusic.includes("imagine-dragons")) {
          musicPreset.value = "imagine-dragons-i-follow-you.m4r";
        } else {
          musicPreset.value = "custom";
        }
        musicPreset.onchange = (e) => {
          if (e.target.value !== "custom") {
            const opt = e.target.selectedOptions[0];
            const title = opt ? opt.getAttribute("data-title") : "";
            const artist = opt ? opt.getAttribute("data-artist") : "";
            h.musicTrackUrl = e.target.value;
            if (title && artist) {
              h.musicTrackTitle = `${title} • ${artist}`;
              if (musicTitleInput) musicTitleInput.value = h.musicTrackTitle;
            }
            if (musicUrlInput) musicUrlInput.value = e.target.value;
            if (musicPreview) musicPreview.src = e.target.value;
            debouncedLiveUpdate();
            if (previewIframe && previewIframe.contentWindow) {
              previewIframe.contentWindow.postMessage({
                type: "SET_SONG",
                song: { src: e.target.value, title: title || "Romantic Soundtrack", artist: artist || "" }
              }, "*");
            }
          }
        };
      }
      if (musicUrlInput) {
        musicUrlInput.oninput = (e) => {
          h.musicTrackUrl = e.target.value.trim();
          if (musicPreview) musicPreview.src = h.musicTrackUrl;
          if (musicPreset && !["taylor-swift-fate-of-ophelia.m4r", "lady-gaga-always-remember-us-this-way.m4r", "imagine-dragons-i-follow-you.m4r"].includes(h.musicTrackUrl)) {
            musicPreset.value = "custom";
          }
          debouncedLiveUpdate();
          if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.postMessage({
              type: "SET_SONG",
              song: { src: h.musicTrackUrl, title: h.musicTrackTitle || "Custom Soundtrack", artist: "Custom Track ✨" }
            }, "*");
          }
        };
      }
      const musicFileInput = document.getElementById("h_musicFileInput");
      const musicUploadStatus = document.getElementById("h_musicUploadStatus");
      if (musicFileInput) {
        musicFileInput.onchange = async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const MAX_SIZE = 10 * 1024 * 1024; // 10MB / 10 Mo
          if (file.size > MAX_SIZE) {
            const mb = (file.size / (1024 * 1024)).toFixed(1);
            if (musicUploadStatus) {
              musicUploadStatus.textContent = `❌ Song size (${mb} MB) exceeds 10 Mo (10MB) limit! Choose a file under 10 Mo.`;
              musicUploadStatus.style.color = "#ff4365";
            }
            musicFileInput.value = "";
            return;
          }
          if (musicUploadStatus) {
            musicUploadStatus.textContent = "Uploading custom song to R2 (max 10 Mo)...";
            musicUploadStatus.style.color = "var(--text-muted)";
          }
          try {
            const publicUrl = await uploadFileToR2(file);
            h.musicTrackUrl = publicUrl;
            const customTitle = file.name.replace(/\.[^/.]+$/, "") + " 🎵";
            h.musicTrackTitle = customTitle;
            if (musicTitleInput) musicTitleInput.value = customTitle;
            if (musicUrlInput) musicUrlInput.value = publicUrl;
            if (musicPreview) musicPreview.src = publicUrl;
            if (musicPreset) musicPreset.value = "custom";
            if (musicUploadStatus) {
              musicUploadStatus.textContent = `✓ Song uploaded successfully (${(file.size / (1024 * 1024)).toFixed(2)} MB)!`;
              musicUploadStatus.style.color = "#2ed573";
            }
            debouncedLiveUpdate();
            if (previewIframe && previewIframe.contentWindow) {
              previewIframe.contentWindow.postMessage({
                type: "SET_SONG",
                song: { src: publicUrl, title: customTitle, artist: "Custom Track ✨" }
              }, "*");
            }
          } catch (err) {
            if (musicUploadStatus) {
              musicUploadStatus.textContent = "Upload failed: " + err.message;
              musicUploadStatus.style.color = "#ff4365";
            }
          }
        };
      }
      const btnPickHeroMusicFromMedia = document.getElementById("btnPickHeroMusicFromMedia");
      if (btnPickHeroMusicFromMedia) {
        btnPickHeroMusicFromMedia.onclick = () => {
          if (typeof openMediaPicker === "function") {
            openMediaPicker({
              filter: "audio",
              onSelect: (url) => {
                h.musicTrackUrl = url;
                const fileName = url.split("/").pop().replace(/\.[^/.]+$/, "");
                const customTitle = fileName + " 🎵";
                h.musicTrackTitle = customTitle;
                if (musicTitleInput) musicTitleInput.value = customTitle;
                if (musicUrlInput) musicUrlInput.value = url;
                if (musicPreview) musicPreview.src = url;
                if (musicPreset) musicPreset.value = "custom";
                debouncedLiveUpdate();
                if (previewIframe && previewIframe.contentWindow) {
                  previewIframe.contentWindow.postMessage({
                    type: "SET_SONG",
                    song: { src: url, title: customTitle, artist: "Custom Track ✨" }
                  }, "*");
                }
              }
            });
          }
        };
      }
      const btnTestMusicPlay = document.getElementById("btnTestMusicPlay");
      if (btnTestMusicPlay) {
        btnTestMusicPlay.onclick = () => {
          if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.postMessage({ type: "MUSIC_TOGGLE" }, "*");
          }
        };
      }

      // Theme & Wallpaper subtab bindings
      const btnGoToTheme = document.getElementById("btnGoToSiteThemeTab");
      if (btnGoToTheme) {
        btnGoToTheme.onclick = () => {
          if (window.switchToTab) window.switchToTab("tab-website");
        };
      }
      const linkGoToTheme = document.getElementById("linkGoToTheme");
      if (linkGoToTheme) {
        linkGoToTheme.onclick = (e) => {
          e.preventDefault();
          if (window.switchToTab) window.switchToTab("tab-website");
        };
      }
      const btnHeroPickBg = document.getElementById("btnHeroPickBg");
      if (btnHeroPickBg) {
        btnHeroPickBg.onclick = () => {
          if (typeof openMediaPicker === "function") {
            openMediaPicker({
              filter: "image",
              onSelect: (url) => {
                state.customBgUrl = url;
                if (previewIframe && previewIframe.contentWindow) {
                  previewIframe.contentWindow.postMessage({ type: "SET_THEME", themeId: state.themeId, customBgUrl: state.customBgUrl }, "*");
                }
                debouncedLiveUpdate(true);
                debouncedAutoSaveLayout();
                renderWidgetInspector("hero");
              }
            });
          }
        };
      }
      const heroUploadBgFile = document.getElementById("heroUploadBgFile");
      if (heroUploadBgFile) {
        heroUploadBgFile.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            const uploaded = await uploadFileToR2(file, file.name);
            if (uploaded && uploaded.url) {
              state.customBgUrl = uploaded.url;
              if (previewIframe && previewIframe.contentWindow) {
                previewIframe.contentWindow.postMessage({ type: "SET_THEME", themeId: state.themeId, customBgUrl: state.customBgUrl }, "*");
              }
              debouncedLiveUpdate(true);
              debouncedAutoSaveLayout();
              renderWidgetInspector("hero");
            }
          } catch (err) {
            alert("Upload failed: " + err.message);
          }
        };
      }
      const inputHeroBg = document.getElementById("h_customBgUrl");
      if (inputHeroBg) {
        inputHeroBg.onchange = (e) => {
          state.customBgUrl = e.target.value.trim();
          if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.postMessage({ type: "SET_THEME", themeId: state.themeId, customBgUrl: state.customBgUrl }, "*");
          }
          debouncedLiveUpdate(true);
          debouncedAutoSaveLayout();
        };
      }
  };
})();
