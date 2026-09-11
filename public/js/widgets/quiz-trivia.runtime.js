/**
 * Runtime Widget Engine: quiz-trivia.runtime.js
 * Modularized for high maintainability.
 */
function getActiveQuizQuestions() {
  if (typeof window.QUIZ_QUESTIONS !== "undefined" && Array.isArray(window.QUIZ_QUESTIONS) && window.QUIZ_QUESTIONS.length > 0) {
    return window.QUIZ_QUESTIONS;
  }
  if (typeof TRIVIA_QUESTIONS !== "undefined" && Array.isArray(TRIVIA_QUESTIONS) && TRIVIA_QUESTIONS.length > 0) {
    return TRIVIA_QUESTIONS;
  }
  return [];
}

function renderQuizStep() {
  const container = document.getElementById("quizContainer");
  if (!container) return;

  const questions = getActiveQuizQuestions();
  if (!questions || questions.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding: 20px; color: var(--text-muted, #888);">No trivia questions configured yet.</p>`;
    return;
  }

  if (currentQuizStep >= questions.length) {
    const certModal = document.getElementById("certificateModal");
    if (certModal) certModal.classList.remove("hidden");
    if (typeof audio !== "undefined" && audio.playFanfare) audio.playFanfare();
    return;
  }

  const q = questions[currentQuizStep];
  const opts = Array.isArray(q.options) ? q.options : [];
  container.innerHTML = `
    <span class="quiz-step-tag">Question ${currentQuizStep + 1} of ${questions.length}</span>
    <h3 class="quiz-question-title">${q.q || ""}</h3>
    <div class="quiz-options-list">
      ${opts.map((opt, i) => `<button class="quiz-option-btn" data-index="${i}">${opt}</button>`).join("")}
    </div>
  `;

  container.querySelectorAll(".quiz-option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedIdx = parseInt(btn.getAttribute("data-index"), 10);
      const isCorrect = selectedIdx === q.correct;
      const rect = btn.getBoundingClientRect();

      container.querySelectorAll(".quiz-option-btn").forEach((b) => {
        b.disabled = true;
      });

      if (isCorrect) {
        btn.style.background = "#2ecc71";
        btn.style.color = "#ffffff";
        if (typeof audio !== "undefined" && audio.playSuccessChime) audio.playSuccessChime();
        if (typeof particles !== "undefined" && particles.burst) particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);
      } else {
        btn.style.background = "#e74c3c";
        btn.style.color = "#ffffff";
        if (typeof audio !== "undefined" && audio.playWobbleFail) audio.playWobbleFail();
        const correctBtn = container.querySelector(`.quiz-option-btn[data-index="${q.correct}"]`);
        if (correctBtn) {
          correctBtn.style.background = "#2ecc71";
          correctBtn.style.color = "#ffffff";
        }
      }

      if (q.comment) {
        const existingComment = container.querySelector(".quiz-comment-card");
        if (existingComment) existingComment.remove();

        const isLast = currentQuizStep + 1 >= questions.length;
        const commentDiv = document.createElement("div");
        commentDiv.className = `quiz-comment-card ${isCorrect ? "correct" : "wrong"}`;
        commentDiv.innerHTML = `
          <div class="quiz-comment-badge">${isCorrect ? "✨ Memory Unlocked!" : "💡 Memory Note:"}</div>
          <p class="quiz-comment-body">${q.comment}</p>
          <button class="quiz-next-btn" id="quizNextBtn">${isLast ? "Claim Certificate 🏆" : "Next Question →"}</button>
        `;
        container.appendChild(commentDiv);

        const nextBtn = commentDiv.querySelector("#quizNextBtn");
        if (nextBtn) {
          nextBtn.addEventListener("click", () => {
            currentQuizStep++;
            renderQuizStep();
          });
        }
      } else {
        setTimeout(() => {
          currentQuizStep++;
          renderQuizStep();
        }, 600);
      }
    });
  });
}

// Downloadable High-Res Certificate Canvas Engine
function setupCertificateDownload() {
  const downloadBtn = document.getElementById("downloadCertificateBtn");
  if (!downloadBtn) return;

  downloadBtn.addEventListener("click", () => {
    const cert = window.QUIZ_CERT_DATA || {};
    const partner = (window.state && window.state.partnerName) || document.querySelector(".partner-name-display")?.textContent || "Ella";
    const sender = cert.certSender || (window.state && window.state.senderName) || "Your Love from Algeria";

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext("2d");

    // Parchment Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, "#fffcf7");
    bgGrad.addColorStop(0.5, "#fff5ea");
    bgGrad.addColorStop(1, "#fee9d7");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 850);

    // Ornate Golden Borders
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 1140, 790);

    ctx.strokeStyle = "#ff758c";
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 45, 1110, 760);

    // Corner Ornaments
    ctx.fillStyle = "#d4af37";
    ctx.font = "28px sans-serif";
    ctx.fillText("✨", 55, 80);
    ctx.fillText("✨", 1125, 80);
    ctx.fillText("✨", 55, 790);
    ctx.fillText("✨", 1125, 790);

    // Header Seal
    ctx.font = "70px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏆", 600, 140);

    // Main Certificate Title
    ctx.font = "bold 44px 'Georgia', serif";
    ctx.fillStyle = "#222222";
    ctx.fillText((cert.certTitle || "Certificate of Infinite Lof").toUpperCase(), 600, 220);

    ctx.font = "italic 22px 'Georgia', serif";
    ctx.fillStyle = "#666666";
    ctx.fillText(cert.certAwardee || "This prestigious lifelong honor is officially presented to", 600, 280);

    // Partner Name in Big Bold Rose
    ctx.font = "bold 56px 'Georgia', serif";
    ctx.fillStyle = "#ff4365";
    ctx.fillText(partner, 600, 360);

    // Body text wrapped
    ctx.font = "22px 'Outfit', sans-serif";
    ctx.fillStyle = "#444444";
    ctx.fillText(cert.certBody || "For scoring a perfect 100% on the Couple Trivia Challenge and holding the eternal title of", 600, 440);

    ctx.font = "bold italic 26px 'Georgia', serif";
    ctx.fillStyle = "#e67e22";
    ctx.fillText(cert.certTitleQuote || "« The Greatest & Prettiest Girlfriend in the Entire Universe »", 600, 490);

    ctx.font = "20px 'Outfit', sans-serif";
    ctx.fillStyle = "#555555";
    ctx.fillText(cert.certBody2 || "Valid across Algeria, China, Indonesia, and throughout all infinity with unlimited hug hugs & kissies.", 600, 545);

    // Signature Area
    ctx.beginPath();
    ctx.moveTo(350, 680);
    ctx.lineTo(850, 680);
    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "italic 22px 'Georgia', serif";
    ctx.fillStyle = "#ff4365";
    ctx.fillText(`${cert.certFooter || "Signed with Kiss Kiss & Hug Hug,"} ${sender} ❤️`, 600, 725);

    ctx.font = "16px 'Outfit', sans-serif";
    ctx.fillStyle = "#888888";
    ctx.fillText(`Issued: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} • Sealed with 1000% Lof`, 600, 765);

    // Trigger PNG Download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Certificate_of_Infinite_Lof_${partner}.png`;
    link.href = dataUrl;
    link.click();

    if (typeof audio !== "undefined" && audio.playFanfare) audio.playFanfare();
    if (typeof particles !== "undefined" && particles.burst) particles.burst(window.innerWidth / 2, window.innerHeight / 2, 50);
    if (typeof showComplimentToast === "function") showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "🏆 Certificate downloaded as high-res keepsake!");
  });
}

window.quizJumpToQuestion = function(step) {
  const questions = getActiveQuizQuestions();
  currentQuizStep = Math.max(0, Math.min(step, questions.length - 1));
  const modal = document.getElementById("certificateModal");
  if (modal) modal.classList.add("hidden");
  renderQuizStep();
  if (typeof audio !== "undefined" && audio.playSparkle) audio.playSparkle();
};

window.quizReset = function() {
  currentQuizStep = 0;
  const modal = document.getElementById("certificateModal");
  if (modal) modal.classList.add("hidden");
  renderQuizStep();
  if (typeof audio !== "undefined" && audio.playSparkle) audio.playSparkle();
};

window.quizOpenCertificate = function() {
  const modal = document.getElementById("certificateModal");
  if (modal) modal.classList.remove("hidden");
  if (typeof audio !== "undefined" && audio.playFanfare) audio.playFanfare();
};

// Dual Voice Note Player & Recorder
let mediaRecorder;
let audioChunks = [];

