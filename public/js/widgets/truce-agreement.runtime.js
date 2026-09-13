(function() {
  const root = typeof window !== "undefined" ? window : global;

  let audioCtx = null;
  const getAudioCtx = () => {
    if (typeof window === "undefined") return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  };

  const playTickSound = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  const playStampFanfare = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(140, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);
    gain1.gain.setValueAtTime(0.35, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.25);

    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const st = ctx.currentTime + 0.15 + i * 0.08;
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(f, st);
      gain2.gain.setValueAtTime(0.12, st);
      gain2.gain.exponentialRampToValueAtTime(0.001, st + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(st);
      osc2.stop(st + 0.6);
    });
  };

  const triggerConfetti = () => {
    if (typeof window === "undefined") return;
    if (typeof window.confetti === "function") {
      window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      return;
    }
    const colors = ["#b91c1c", "#f59e0b", "#10b981", "#6366f1", "#ec4899"];
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
    for (let i = 0; i < 50; i++) {
      const p = document.createElement("div");
      p.style.cssText = `position:absolute;width:${Math.random() * 8 + 6}px;height:${Math.random() * 8 + 6}px;background:${colors[i % colors.length]};left:50%;top:50%;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};opacity:1;transition:transform 1.3s cubic-bezier(0.22,1,0.36,1),opacity 1.3s ease-out;`;
      container.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 260 + 80;
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 80}px) rotate(${Math.random() * 720}deg)`;
        p.style.opacity = "0";
      });
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1400);
  };

  function generatePeaceTreaty(data = {}) {
    if (typeof document === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");

    const bgGrad = ctx.createLinearGradient(0, 0, 1400, 960);
    bgGrad.addColorStop(0, "#fdfbf7");
    bgGrad.addColorStop(0.5, "#f7eed9");
    bgGrad.addColorStop(1, "#eeddc0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1400, 960);

    const vignette = ctx.createRadialGradient(700, 480, 400, 700, 480, 750);
    vignette.addColorStop(0, "rgba(255,255,255,0)");
    vignette.addColorStop(1, "rgba(139, 94, 60, 0.25)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1400, 960);

    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 1328, 888);
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2;
    ctx.strokeRect(46, 46, 1308, 868);

    const corners = [[36, 36], [1364, 36], [36, 924], [1364, 924]];
    ctx.fillStyle = "#92400e";
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#78350f";
    ctx.font = "bold 38px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("OFFICIAL PEACE TREATY & PERPETUAL TRUCE", 700, 120);

    ctx.fillStyle = "#92400e";
    ctx.font = "italic 20px Georgia, serif";
    ctx.fillText("Entered into with full hearts, zero grudges, and unconditional affection", 700, 160);

    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(350, 185);
    ctx.lineTo(1050, 185);
    ctx.stroke();

    const p1El = document.getElementById("truceParty1");
    const p2El = document.getElementById("truceParty2");
    const p1 = (p1El && p1El.textContent.trim()) || data.party1 || data.partner1 || (window.state && window.state.senderName) || "Party I";
    const p2 = (p2El && p2El.textContent.trim()) || data.party2 || data.partner2 || (window.state && window.state.partnerName) || "Party II";

    ctx.fillStyle = "#451a03";
    ctx.font = "600 24px Georgia, serif";
    ctx.fillText(`Concluded between ${p1} and ${p2}`, 700, 230);

    ctx.font = "bold 20px Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#78350f";
    ctx.fillText("TERMS & CONDITIONS OF RECONCILIATION:", 120, 290);

    const domTerms = Array.from(document.querySelectorAll("#truceTermsList .term-text")).map(el => el.textContent.trim()).filter(Boolean);
    const defaultTerms = [
      "1. All former misunderstandings, petty spats, and stubbornness are hereby pardoned and dismissed.",
      "2. Going to sleep annoyed or holding unspoken grievances is strictly prohibited under penalty of compulsory cuddles.",
      "3. Peace offerings in the form of sweet treats, warm tea, and patient listening shall be honored unconditionally.",
      "4. Both parties agree that mutual laughter, kindness, and love permanently outweigh winning an argument."
    ];
    const rawTerms = (domTerms.length > 0) ? domTerms : ((Array.isArray(data.terms) && data.terms.length > 0) ? data.terms : defaultTerms);
    const terms = rawTerms.map((t, idx) => /^[0-9]+\./.test(t) ? t : `${idx + 1}. ${t}`);

    ctx.font = "18px Georgia, serif";
    ctx.fillStyle = "#292524";
    terms.forEach((term, idx) => {
      ctx.fillText(term, 120, 340 + idx * 45);
    });

    const sigY = 620;
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(150, sigY + 60);
    ctx.lineTo(450, sigY + 60);
    ctx.stroke();
    ctx.font = "italic 28px Brush Script MT, cursive, serif";
    ctx.fillStyle = "#1e3a8a";
    ctx.fillText(p1, 170, sigY + 45);
    ctx.font = "16px Georgia, serif";
    ctx.fillStyle = "#78350f";
    ctx.fillText(`Signature: ${p1}`, 150, sigY + 85);

    ctx.beginPath();
    ctx.moveTo(950, sigY + 60);
    ctx.lineTo(1250, sigY + 60);
    ctx.stroke();
    ctx.font = "italic 28px Brush Script MT, cursive, serif";
    ctx.fillStyle = "#1e3a8a";
    ctx.fillText(p2, 970, sigY + 45);
    ctx.font = "16px Georgia, serif";
    ctx.fillStyle = "#78350f";
    ctx.fillText(`Signature: ${p2}`, 950, sigY + 85);

    const dateEl = document.getElementById("truceSignedDate");
    const today = (dateEl && dateEl.textContent.trim()) || data.signedDate || data.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    ctx.textAlign = "center";
    ctx.font = "16px Georgia, serif";
    ctx.fillStyle = "#57534e";
    ctx.fillText(`Ratified & Stamped on this day: ${today}`, 700, 750);

    const sealX = 700;
    const sealY = 830;
    const sealGrad = ctx.createRadialGradient(sealX - 10, sealY - 10, 5, sealX, sealY, 55);
    sealGrad.addColorStop(0, "#ef4444");
    sealGrad.addColorStop(0.7, "#991b1b");
    sealGrad.addColorStop(1, "#450a0a");
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 55, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 13px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("SIGNED & SEALED", sealX, sealY - 6);
    ctx.font = "18px sans-serif";
    ctx.fillText("🕊️ ❤️ 🕊️", sealX, sealY + 18);

    const link = document.createElement("a");
    link.download = `Peace_Treaty_${p1}_${p2}.png`.replace(/\s+/g, "_");
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function setupTruceAgreement(data = {}) {
    if (typeof document === "undefined") return;

    const signBtn = document.getElementById("btnHoldToSign") ||
      document.getElementById("holdToSignBtn") ||
      document.querySelector("[data-hold-to-sign]") ||
      document.querySelector(".btn-hold-seal") ||
      document.querySelector(".hold-to-sign-btn");
    const progressCircle = document.getElementById("truceHoldRingFill") ||
      document.getElementById("signProgressCircle") ||
      document.querySelector(".ring-fill") ||
      document.querySelector(".sign-progress-circle");
    const progressCanvas = document.getElementById("signProgressCanvas") ||
      document.querySelector(".sign-progress-canvas");
    const handshakeSvg = document.getElementById("truceHandshakeContainer") ||
      document.getElementById("truceCelebration") ||
      document.querySelector(".treaty-handshake-svg") ||
      document.querySelector(".truce-celebration");
    const certificateState = document.getElementById("truceCertificateState") ||
      document.getElementById("truceWaxSeal") ||
      document.querySelector(".treaty-ratified-state");
    const downloadBtn = document.getElementById("btnDownloadTreaty") ||
      document.getElementById("downloadTreatyBtn") ||
      document.querySelector(".download-treaty-btn");
    const agreementStatus = document.getElementById("agreementStatusText") ||
      document.querySelector(".agreement-status-text");

    let isHolding = false;
    let holdStartTime = 0;
    let animFrame = null;
    let isSigned = false;

    const parsedSec = signBtn ? Number(signBtn.dataset.holdSec) : NaN;
    const HOLD_DURATION = (!isNaN(parsedSec) && parsedSec > 0) ? (parsedSec * 1000) : (data.holdDuration || 2500);

    const r = progressCircle ? (Number(progressCircle.getAttribute("r")) || 52) : 52;
    const circumference = 2 * Math.PI * r;
    if (progressCircle) {
      progressCircle.style.strokeDasharray = `${circumference}`;
      progressCircle.style.strokeDashoffset = `${circumference}`;
      progressCircle.style.transition = "stroke-dashoffset 0.05s linear";
    }

    const drawCanvasProgress = (ratio) => {
      if (!progressCanvas) return;
      const ctx = progressCanvas.getContext("2d");
      const w = progressCanvas.width;
      const h = progressCanvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    const setProgressRatio = (ratio) => {
      if (progressCircle) {
        progressCircle.style.strokeDashoffset = `${circumference * (1 - ratio)}`;
      }
      drawCanvasProgress(ratio);
    };

    const onComplete = () => {
      isSigned = true;
      isHolding = false;
      setProgressRatio(1);
      playStampFanfare();
      triggerConfetti();

      if (certificateState) {
        certificateState.classList.remove("hidden");
        certificateState.classList.add("active", "stamped");
        certificateState.style.display = "block";
      }

      if (handshakeSvg) {
        handshakeSvg.classList.add("active", "celebrate-burst");
        handshakeSvg.style.display = "block";
      }

      if (agreementStatus) {
        agreementStatus.textContent = "SIGNED & SEALED • PEACE DECLARED ❤️";
        agreementStatus.style.color = "#10b981";
      }

      if (downloadBtn) {
        downloadBtn.classList.remove("hidden");
        downloadBtn.style.display = "inline-flex";
      }

      if (signBtn) {
        signBtn.classList.add("signed");
        signBtn.setAttribute("disabled", "true");
        const sealLabel = signBtn.querySelector(".seal-label") || signBtn.querySelector(".btn-text") || signBtn;
        if (sealLabel) sealLabel.textContent = "Ratified & Sealed ✨";
      }
    };

    const step = (timestamp) => {
      if (!isHolding || isSigned) return;
      if (!holdStartTime) holdStartTime = timestamp;
      const elapsed = timestamp - holdStartTime;
      const ratio = Math.min(1, elapsed / HOLD_DURATION);
      setProgressRatio(ratio);

      if (Math.random() < 0.08) playTickSound();

      if (ratio >= 1) {
        onComplete();
      } else {
        animFrame = requestAnimationFrame(step);
      }
    };

    const startHold = (e) => {
      if (isSigned) return;
      if (e && e.cancelable) e.preventDefault();
      isHolding = true;
      holdStartTime = 0;
      if (signBtn) signBtn.classList.add("is-pressing");
      animFrame = requestAnimationFrame(step);
    };

    const cancelHold = () => {
      if (isSigned) return;
      isHolding = false;
      if (animFrame) cancelAnimationFrame(animFrame);
      setProgressRatio(0);
      if (signBtn) signBtn.classList.remove("is-pressing");
    };

    if (signBtn && !signBtn._bound) {
      signBtn._bound = true;
      signBtn.addEventListener("pointerdown", startHold);
      signBtn.addEventListener("pointerup", cancelHold);
      signBtn.addEventListener("pointerleave", cancelHold);
      signBtn.addEventListener("pointercancel", cancelHold);
      signBtn.addEventListener("touchstart", startHold, { passive: false });
      signBtn.addEventListener("touchend", cancelHold);
      signBtn.addEventListener("touchcancel", cancelHold);
    }

    if (downloadBtn && !downloadBtn._bound) {
      downloadBtn._bound = true;
      downloadBtn.addEventListener("click", () => generatePeaceTreaty(data));
    }

    root.downloadPeaceTreaty = () => generatePeaceTreaty(data);
  }

  root.setupTruceAgreement = setupTruceAgreement;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setupTruceAgreement());
    } else {
      setupTruceAgreement();
    }
  }
})();
