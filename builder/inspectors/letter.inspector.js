/**
 * Builder Inspector Module: letter
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["letter"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {},
      openMediaPicker = () => {}
    } = ctx || {};

if (!state.sectionsData.letter) state.sectionsData.letter = {};
      if (typeof state.sectionsData.letter === "string") {
        state.sectionsData.letter = { body: state.sectionsData.letter };
      }
      const letObj = state.sectionsData.letter;
      const bodyVal = letObj.body || "";

      inspectorFormContainer.innerHTML = `
        <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">Section Header</h4>
          <div class="grid-2">
            <div class="input-group">
              <label>Tag / Badge</label>
              <input type="text" id="let_tag" value="${escapeHtml(letObj.tag || 'Straight From My Heart • Birthday Edition')}">
            </div>
            <div class="input-group">
              <label>Main Title</label>
              <input type="text" id="let_title" value="${escapeHtml(letObj.title || 'A Birthday Love Letter For You 📜🎂')}">
            </div>
          </div>
        </div>

        <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">💌 Sealed Envelope</h4>
          <div class="grid-3">
            <div class="input-group">
              <label>Wax Seal Icon</label>
              <input type="text" id="let_seal" value="${escapeHtml(letObj.seal || '💌')}">
            </div>
            <div class="input-group">
              <label>Envelope Badge</label>
              <input type="text" id="let_envBadge" value="${escapeHtml(letObj.envelopeBadge || ('👑 For My Princess ' + (state.partner2 || 'Ella')))}">
            </div>
            <div class="input-group">
              <label>Envelope Title</label>
              <input type="text" id="let_envTitle" value="${escapeHtml(letObj.envelopeTitle || 'A Birthday Love Letter 🎂')}">
            </div>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Envelope Subtitle</label>
              <input type="text" id="let_envSub" value="${escapeHtml(letObj.envelopeSub || 'Sealed with infinite love, kissies & romantic voice reading')}">
            </div>
            <div class="input-group">
              <label>Break Seal Button Text</label>
              <input type="text" id="let_openBtnText" value="${escapeHtml(letObj.openBtnText || '💌 Break Seal & Open Letter')}">
            </div>
          </div>
          <div class="input-group">
            <label>Envelope Hint</label>
            <input type="text" id="let_envHint" value="${escapeHtml(letObj.envelopeHint || '✨ Tap the sealed envelope to break the seal, open your letter, and listen to my voice ❤️')}">
          </div>
        </div>

        <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">📜 Parchment Letter Content</h4>
          <div class="grid-3">
            <div class="input-group">
              <label>Date Header</label>
              <input type="text" id="let_date" value="${escapeHtml(letObj.dateDisplay || 'Today & Always')}">
            </div>
            <div class="input-group">
              <label>Salutation</label>
              <input type="text" id="let_salut" value="${escapeHtml(letObj.salutation || 'Dearest')}">
            </div>
            <div class="input-group">
              <label>Recipient Name</label>
              <input type="text" id="let_recipient" value="${escapeHtml(letObj.recipient || state.partner2 || 'Ella')}">
            </div>
          </div>
          <div class="input-group">
            <label>Letter Body (Separate paragraphs with double enter)</label>
            <textarea id="let_body" style="height: 180px; font-family: inherit; line-height: 1.5;">${escapeHtml(bodyVal)}</textarea>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Closing Phrase</label>
              <input type="text" id="let_closing" value="${escapeHtml(letObj.closingPhrase || 'Forever and always, with infinite kiss kiss & hug hug,')}">
            </div>
            <div class="input-group">
              <label>Sender Signature</label>
              <input type="text" id="let_sender" value="${escapeHtml(letObj.sender || state.partner1 || 'Your Love from Algeria ❤️')}">
            </div>
          </div>
        </div>

        <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">🎙️ Romantic Voice Narration</h4>
          <div class="input-group" style="margin-bottom: 10px;">
            <label>Love Letter Narration Preset</label>
            <select id="let_audio_preset" class="inspector-select" style="width: 100%;">
              <option value="audio/letter_voice-volume-adjusted.m4r">🎙️ Authentic Letter Voice (Volume Boosted ⚡ - Original Production)</option>
              <option value="audio/letter_voice.m4r">🎙️ Original Voice Narration (Raw Recording)</option>
              <option value="custom">⚙️ Custom Audio URL / Cloudflare R2 Upload</option>
            </select>
          </div>
          <div class="input-group">
            <label>Audio URL / Path</label>
            <div style="display:flex; gap:8px;">
              <input type="text" id="let_audioUrl" value="${escapeHtml(letObj.audioUrl || 'audio/letter_voice-volume-adjusted.m4r')}" style="flex:1;">
              <label class="file-upload-btn" style="cursor:pointer; display:inline-flex; align-items:center; padding: 6px 12px; background: rgba(255,255,255,0.08); border-radius:6px; font-size:12px; white-space:nowrap;">
                <span>Upload Audio</span>
                <input type="file" id="let_audioFileInput" accept="audio/*" style="display:none;">
              </label>
              <button type="button" class="btn-pick-from-media" id="btnPickLetterAudioFromMedia" title="Pick voice audio from media library">📁 Library</button>
            </div>
            <div id="let_audioUploadStatus" style="font-size:11px; color:var(--text-muted); margin-top:4px;"></div>
          </div>
          <div style="margin-top: 10px;">
            <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Studio Narration Preview:</label>
            <audio id="let_audioPreview" controls src="${escapeHtml(letObj.audioUrl || 'audio/letter_voice-volume-adjusted.m4r')}" style="width: 100%; height: 36px;"></audio>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          <h4 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">🎮 Live Interactive Test Controls</h4>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <button type="button" id="btnTestLetterOpen" class="btn-sm btn-primary">💌 Break Seal & Open</button>
            <button type="button" id="btnTestLetterPlay" class="btn-sm btn-secondary">▶️ Toggle Voice Narration</button>
            <button type="button" id="btnTestLetterReseal" class="btn-sm btn-outline">🔒 Reseal Envelope</button>
          </div>
        </div>
      `;

      document.getElementById("let_tag").oninput = (e) => { letObj.tag = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_title").oninput = (e) => { letObj.title = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_seal").oninput = (e) => { letObj.seal = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_envBadge").oninput = (e) => { letObj.envelopeBadge = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_envTitle").oninput = (e) => { letObj.envelopeTitle = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_envSub").oninput = (e) => { letObj.envelopeSub = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_openBtnText").oninput = (e) => { letObj.openBtnText = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_envHint").oninput = (e) => { letObj.envelopeHint = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_date").oninput = (e) => { letObj.dateDisplay = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_salut").oninput = (e) => { letObj.salutation = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_recipient").oninput = (e) => { letObj.recipient = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_body").oninput = (e) => { letObj.body = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_closing").oninput = (e) => { letObj.closingPhrase = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("let_sender").oninput = (e) => { letObj.sender = e.target.value; debouncedLiveUpdate(); };

      const letPreset = document.getElementById("let_audio_preset");
      const letAudioInput = document.getElementById("let_audioUrl");
      const letAudioPreview = document.getElementById("let_audioPreview");
      const curLetAudio = letObj.audioUrl || "audio/letter_voice-volume-adjusted.m4r";
      if (letPreset) {
        if (curLetAudio.includes("letter_voice-volume-adjusted")) {
          letPreset.value = "audio/letter_voice-volume-adjusted.m4r";
        } else if (curLetAudio.includes("letter_voice")) {
          letPreset.value = "audio/letter_voice.m4r";
        } else {
          letPreset.value = "custom";
        }
        letPreset.onchange = (e) => {
          if (e.target.value !== "custom") {
            letObj.audioUrl = e.target.value;
            if (letAudioInput) letAudioInput.value = e.target.value;
            if (letAudioPreview) letAudioPreview.src = e.target.value;
            debouncedLiveUpdate();
          }
        };
      }
      if (letAudioInput) {
        letAudioInput.oninput = (e) => {
          letObj.audioUrl = e.target.value.trim();
          if (letAudioPreview) letAudioPreview.src = letObj.audioUrl;
          if (letPreset && !["audio/letter_voice-volume-adjusted.m4r", "audio/letter_voice.m4r"].includes(letObj.audioUrl)) {
            letPreset.value = "custom";
          }
          debouncedLiveUpdate();
        };
      }

      const audioInput = document.getElementById("let_audioFileInput");
      const uploadStatus = document.getElementById("let_audioUploadStatus");
      if (audioInput) {
        audioInput.onchange = async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo limit
          if (file.size > MAX_SIZE) {
            if (uploadStatus) {
              uploadStatus.textContent = `❌ Narration size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 10 Mo limit!`;
              uploadStatus.style.color = "#ff4365";
            }
            audioInput.value = "";
            return;
          }
          if (uploadStatus) {
            uploadStatus.textContent = "Uploading audio narration (max 10 Mo)...";
            uploadStatus.style.color = "var(--text-muted)";
          }
          try {
            const publicUrl = await uploadFileToR2(file);
            letObj.audioUrl = publicUrl;
            if (letAudioInput) letAudioInput.value = publicUrl;
            if (letAudioPreview) letAudioPreview.src = publicUrl;
            if (letPreset) letPreset.value = "custom";
            if (uploadStatus) {
              uploadStatus.textContent = "✓ Audio uploaded successfully!";
              uploadStatus.style.color = "#2ed573";
            }
            debouncedLiveUpdate();
          } catch (err) {
            if (uploadStatus) {
              uploadStatus.textContent = "Upload failed: " + err.message;
              uploadStatus.style.color = "#ff4365";
            }
          }
        };
      }

      const btnPickLetterAudioFromMedia = document.getElementById("btnPickLetterAudioFromMedia");
      if (btnPickLetterAudioFromMedia) {
        btnPickLetterAudioFromMedia.onclick = () => {
          if (typeof openMediaPicker === "function") {
            openMediaPicker({
              filter: "audio",
              onSelect: (url) => {
                letObj.audioUrl = url;
                if (letAudioInput) letAudioInput.value = url;
                if (letAudioPreview) letAudioPreview.src = url;
                if (letPreset) letPreset.value = "custom";
                debouncedLiveUpdate();
              }
            });
          }
        };
      }

      document.getElementById("btnTestLetterOpen").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "LETTER_OPEN" }, "*");
        }
      };

      document.getElementById("btnTestLetterPlay").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "LETTER_PLAY_TOGGLE" }, "*");
        }
      };

      document.getElementById("btnTestLetterReseal").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "LETTER_RESEAL" }, "*");
        }
      };
  };
})();
