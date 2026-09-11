/**
 * Runtime Engine: Roast & Toast Wheel Widget
 */
(function() {
  window.setupRoastToast = function(data) {
    const section = document.getElementById("roastToastSection");
    if (!section) return;

    const canvas = document.getElementById("roastToastWheelCanvas");
    const btnSpin = document.getElementById("btnSpinRoastToast");
    const modal = document.getElementById("roastToastResultModal");
    const pill = document.getElementById("resultTypePill");
    const msg = document.getElementById("resultMsgBody");
    const btnClose = document.getElementById("btnCloseRoastToastResult");

    const roasts = (data && Array.isArray(data.roasts) && data.roasts.length) ? data.roasts : [
      "🔥 Takes 45 minutes to get ready, then claims you are the one running late!",
      "🔥 Always 'just resting their eyes' 5 minutes into a movie you picked.",
      "🔥 Said 'I am not hungry' but finished half of your french fries!",
      "🔥 Has 87 open browser tabs and refuses to close a single one."
    ];

    const toasts = (data && Array.isArray(data.toasts) && data.toasts.length) ? data.toasts : [
      "🥂 The kindest, most radiant soul in every single room you enter.",
      "🥂 Cheers to the person who makes the ordinary moments feel like magic.",
      "🥂 Aging like the finest champagne—more breathtaking with every year.",
      "🥂 To your boundless generosity, infectious laugh, and golden heart."
    ];

    const numSlices = 8;
    let currentRotation = 0;
    let isSpinning = false;

    function drawWheel() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const size = canvas.width;
      const center = size / 2;
      const radius = center - 8;
      const sliceAngle = (2 * Math.PI) / numSlices;

      ctx.clearRect(0, 0, size, size);

      for (let i = 0; i < numSlices; i++) {
        const isRoast = (i % 2 === 0);
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.fillStyle = isRoast ? "#ef4444" : "#f59e0b";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate((i + 0.5) * sliceAngle);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px -apple-system, sans-serif";
        ctx.fillText(isRoast ? "ROAST 🔥" : "TOAST 🥂", radius - 20, 7);
        ctx.restore();
      }
    }

    drawWheel();

    function spin() {
      if (isSpinning) return;
      isSpinning = true;
      if (modal) modal.classList.remove("shown");

      const extraRounds = 5 + Math.floor(Math.random() * 4);
      const targetSlice = Math.floor(Math.random() * numSlices);
      const sliceAngleDeg = 360 / numSlices;
      // Pointer is at top (270 deg)
      const targetDeg = (extraRounds * 360) + (targetSlice * sliceAngleDeg) + (sliceAngleDeg / 2);
      currentRotation += targetDeg;

      if (canvas) {
        canvas.style.transform = "rotate(" + currentRotation + "deg)";
      }

      setTimeout(() => {
        isSpinning = false;
        const normalizedDeg = (currentRotation % 360);
        // Determine slice at 270 deg pointer
        const pointerSlice = Math.floor(((360 - (normalizedDeg % 360) + 270) % 360) / sliceAngleDeg);
        const isRoast = (pointerSlice % 2 === 0);

        if (modal && pill && msg) {
          modal.className = "roast-toast-result-modal shown " + (isRoast ? "mode-roast" : "mode-toast");
          pill.className = "result-type-pill " + (isRoast ? "roast" : "toast");
          pill.textContent = isRoast ? "ROAST 🔥" : "TOAST 🥂";

          const pool = isRoast ? roasts : toasts;
          const chosen = pool[Math.floor(Math.random() * pool.length)];
          msg.textContent = chosen;
        }

        if (typeof window.confetti === "function") {
          window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.65 } });
        }
      }, 4100);
    }

    if (btnSpin) btnSpin.onclick = spin;
    if (btnClose && modal) {
      btnClose.onclick = function() {
        modal.classList.remove("shown");
      };
    }

    window.roastToastSpin = spin;
  };
})();
