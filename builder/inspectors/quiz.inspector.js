/**
 * Builder Inspector Module: quiz
 * Isolated, maintainable widget editor.
 */
(function() {
  window.WIDGET_INSPECTORS = window.WIDGET_INSPECTORS || {};

  window.WIDGET_INSPECTORS["quiz"] = function(inspectorFormContainer, state, ctx) {
    const {
      debouncedLiveUpdate = () => {},
      debouncedAutoSaveLayout = () => {},
      uploadFileToR2 = async () => {},
      previewIframe = null,
      renderWidgetInspector = () => {},
      selectWidgetForInspector = () => {}
    } = ctx || {};

if (Array.isArray(state.sectionsData.quiz)) {
        state.sectionsData.quiz = {
          tag: "Couples Trivia Challenge",
          title: "How Well Do You Know Our Lof Story? 🧠💖",
          desc: "Answer sweet questions about our trips and memories to earn your Certificate of Infinite Lof!",
          certTitle: "Certificate of Infinite Lof",
          certAwardee: "This prestigious lifelong honor is officially presented to",
          certTitleQuote: "« The Greatest & Prettiest Girlfriend in the Entire Universe »",
          certBody: "For scoring a perfect 100% on the Couple Trivia Challenge and holding the eternal title of",
          certBody2: "Valid across Algeria, China, Indonesia, and throughout all infinity with unlimited hug hugs & kissies.",
          certFooter: "Signed with Kiss Kiss & Hug Hug,",
          certSender: state.partner1 || "Your Love from Algeria",
          items: state.sectionsData.quiz
        };
      } else if (!state.sectionsData.quiz) {
        state.sectionsData.quiz = {
          tag: "Couples Trivia Challenge",
          title: "How Well Do You Know Our Lof Story? 🧠💖",
          desc: "Answer sweet questions about our trips and memories to earn your Certificate of Infinite Lof!",
          certTitle: "Certificate of Infinite Lof",
          certAwardee: "This prestigious lifelong honor is officially presented to",
          certTitleQuote: "« The Greatest & Prettiest Girlfriend in the Entire Universe »",
          certBody: "For scoring a perfect 100% on the Couple Trivia Challenge and holding the eternal title of",
          certBody2: "Valid across Algeria, China, Indonesia, and throughout all infinity with unlimited hug hugs & kissies.",
          certFooter: "Signed with Kiss Kiss & Hug Hug,",
          certSender: state.partner1 || "Your Love from Algeria",
          items: []
        };
      }
      const qzObj = state.sectionsData.quiz;
      if (!Array.isArray(qzObj.items)) qzObj.items = [];
      const quiz = qzObj.items;

      let listHtml = "";
      quiz.forEach((item, idx) => {
        const opts = item.options || ["Option A", "Option B", "Option C", "Option D"];
        let optionsFields = "";
        opts.forEach((opt, optIdx) => {
          optionsFields += `
            <div class="input-group" style="margin-bottom: 6px;">
              <label>Option ${optIdx + 1}</label>
              <input type="text" class="quiz-opt-input" data-opt-idx="${optIdx}" value="${escapeHtml(opt)}">
            </div>
          `;
        });

        listHtml += `
          <div class="item-editor-card" data-idx="${idx}">
            <div class="item-editor-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
              <span class="item-editor-title">🧠 Question #${idx + 1}</span>
              <div style="display:flex; gap:4px;">
                <button type="button" class="btn-sm btn-reorder-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Up">▲</button>
                <button type="button" class="btn-sm btn-reorder-down" data-idx="${idx}" ${idx === quiz.length - 1 ? 'disabled' : ''} title="Move Down">▼</button>
                <button type="button" class="btn-sm btn-preview-step" data-idx="${idx}" title="Preview in Live Site">▶️ Test</button>
                <button type="button" class="btn-remove-item" data-remove-quiz="${idx}" title="Delete Question">🗑️</button>
              </div>
            </div>
            <div class="input-group">
              <label>Question Prompt</label>
              <input type="text" class="quiz-q-input" value="${escapeHtml(item.q || '')}">
            </div>
            <div class="quiz-options-group" style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
              ${optionsFields}
            </div>
            <div class="grid-2" style="margin-top:8px;">
              <div class="input-group">
                <label>Correct Option</label>
                <select class="quiz-correct-select">
                  ${opts.map((_, i) => `<option value="${i}" ${item.correct === i ? 'selected' : ''}>Option ${i + 1}</option>`).join('')}
                </select>
              </div>
              <div class="input-group">
                <label>Memory Comment / Note</label>
                <input type="text" class="quiz-comment-input" value="${escapeHtml(item.comment || '')}">
              </div>
            </div>
          </div>
        `;
      });

      inspectorFormContainer.innerHTML = `
        <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">Section Header</h4>
          <div class="grid-2">
            <div class="input-group">
              <label>Tag / Badge</label>
              <input type="text" id="qz_tag" value="${escapeHtml(qzObj.tag || '')}">
            </div>
            <div class="input-group">
              <label>Main Title</label>
              <input type="text" id="qz_title" value="${escapeHtml(qzObj.title || '')}">
            </div>
          </div>
          <div class="input-group">
            <label>Description</label>
            <input type="text" id="qz_desc" value="${escapeHtml(qzObj.desc || '')}">
          </div>
        </div>

        <div class="section-settings-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">Certificate of Infinite Lof</h4>
          <div class="grid-2">
            <div class="input-group">
              <label>Certificate Title</label>
              <input type="text" id="qz_certTitle" value="${escapeHtml(qzObj.certTitle || '')}">
            </div>
            <div class="input-group">
              <label>Honorary Title Quote</label>
              <input type="text" id="qz_certTitleQuote" value="${escapeHtml(qzObj.certTitleQuote || '')}">
            </div>
          </div>
          <div class="input-group">
            <label>Certificate Body</label>
            <textarea id="qz_certBody" rows="2">${escapeHtml(qzObj.certBody || '')}</textarea>
          </div>
          <div class="grid-2">
            <div class="input-group">
              <label>Footer Sign-off Prefix</label>
              <input type="text" id="qz_certFooter" value="${escapeHtml(qzObj.certFooter || '')}">
            </div>
            <div class="input-group">
              <label>Signer Name</label>
              <input type="text" id="qz_certSender" value="${escapeHtml(qzObj.certSender || '')}">
            </div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          <h4 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">🎮 Live Interactive Test Controls</h4>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <button type="button" id="btnTestQuizReset" class="btn-sm btn-secondary">🔄 Reset to Step 1</button>
            <button type="button" id="btnTestQuizOpenCert" class="btn-sm btn-primary">🏆 Open Certificate Modal</button>
          </div>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <h4 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin: 0;">Trivia Questions (${quiz.length})</h4>
          <button type="button" id="btnAddQuiz" class="btn-sm btn-primary">➕ Add Question</button>
        </div>

        <div id="quizListContainer">${listHtml}</div>
      `;

      document.getElementById("qz_tag").oninput = (e) => { qzObj.tag = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("qz_title").oninput = (e) => { qzObj.title = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("qz_desc").oninput = (e) => { qzObj.desc = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("qz_certTitle").oninput = (e) => { qzObj.certTitle = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("qz_certTitleQuote").oninput = (e) => { qzObj.certTitleQuote = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("qz_certBody").oninput = (e) => { qzObj.certBody = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("qz_certFooter").oninput = (e) => { qzObj.certFooter = e.target.value; debouncedLiveUpdate(); };
      document.getElementById("qz_certSender").oninput = (e) => { qzObj.certSender = e.target.value; debouncedLiveUpdate(); };

      document.getElementById("btnTestQuizReset").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "QUIZ_RESET" }, "*");
        }
      };

      document.getElementById("btnTestQuizOpenCert").onclick = () => {
        if (previewIframe && previewIframe.contentWindow) {
          previewIframe.contentWindow.postMessage({ type: "QUIZ_OPEN_CERT" }, "*");
        }
      };

      document.querySelectorAll("#quizListContainer .item-editor-card").forEach(card => {
        const idx = parseInt(card.dataset.idx, 10);
        card.querySelector(".quiz-q-input").oninput = (e) => { quiz[idx].q = e.target.value; debouncedLiveUpdate(); };
        card.querySelectorAll(".quiz-opt-input").forEach(optInput => {
          const optIdx = parseInt(optInput.dataset.optIdx, 10);
          optInput.oninput = (e) => {
            quiz[idx].options[optIdx] = e.target.value;
            debouncedLiveUpdate();
          };
        });
        card.querySelector(".quiz-correct-select").onchange = (e) => {
          quiz[idx].correct = parseInt(e.target.value, 10);
          debouncedLiveUpdate();
        };
        card.querySelector(".quiz-comment-input").oninput = (e) => { quiz[idx].comment = e.target.value; debouncedLiveUpdate(); };

        const upBtn = card.querySelector(".btn-reorder-up");
        if (upBtn) {
          upBtn.onclick = () => {
            if (idx > 0) {
              const temp = quiz[idx];
              quiz[idx] = quiz[idx - 1];
              quiz[idx - 1] = temp;
              renderWidgetInspector("quiz");
              debouncedLiveUpdate();
            }
          };
        }

        const downBtn = card.querySelector(".btn-reorder-down");
        if (downBtn) {
          downBtn.onclick = () => {
            if (idx < quiz.length - 1) {
              const temp = quiz[idx];
              quiz[idx] = quiz[idx + 1];
              quiz[idx + 1] = temp;
              renderWidgetInspector("quiz");
              debouncedLiveUpdate();
            }
          };
        }

        const previewBtn = card.querySelector(".btn-preview-step");
        if (previewBtn) {
          previewBtn.onclick = () => {
            if (previewIframe && previewIframe.contentWindow) {
              previewIframe.contentWindow.postMessage({ type: "QUIZ_JUMP_STEP", step: idx }, "*");
            }
          };
        }

        card.querySelector(`[data-remove-quiz="${idx}"]`).onclick = () => {
          quiz.splice(idx, 1);
          renderWidgetInspector("quiz");
          debouncedLiveUpdate();
        };
      });

      document.getElementById("btnAddQuiz").onclick = () => {
        quiz.push({
          q: "What is our favorite inside joke or routine?",
          options: ["Midnight snacking 🍕", "Silly dance moves 💃", "Voice note spam 🎙️", "Teasing hugs 🤗"],
          correct: 0,
          comment: "Always makes us laugh every single time!"
        });
        renderWidgetInspector("quiz");
        debouncedLiveUpdate();
      };
  };
})();
