(function() {
  window.setupThenNowSlider = function(data, heroData) {
    const section = document.getElementById("thenNowSection");
    const container = document.getElementById("thenNowContainer");
    const thenLayer = document.getElementById("thenLayer");
    const divider = document.getElementById("thenNowDivider");
    if (!container || !thenLayer || !divider) return;

    let split = Number(data?.initialSplit ?? section?.dataset?.split ?? 50);
    split = Math.max(0, Math.min(100, split));

    const applySplit = (pct) => {
      split = Math.max(0, Math.min(100, pct));
      thenLayer.style.clipPath = `polygon(0 0, calc(${split}% - 1px) 0, calc(${split}% - 1px) 100%, 0 100%)`;
      divider.style.left = `${split}%`;
      container.setAttribute("aria-valuenow", Math.round(split));
    };

    applySplit(split);

    let isDragging = false;

    const calcPct = (clientX) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return 50;
      return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    };

    const onPointerDown = (e) => {
      isDragging = true;
      container.classList.add("dragging");
      applySplit(calcPct(e.clientX));
      if (e.pointerId && container.setPointerCapture) {
        try { container.setPointerCapture(e.pointerId); } catch (_) {}
      }
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      applySplit(calcPct(e.clientX));
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      container.classList.remove("dragging");
      if (e.pointerId && container.releasePointerCapture) {
        try { container.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };

    container.onpointerdown = onPointerDown;
    container.onpointermove = onPointerMove;
    container.onpointerup = onPointerUp;
    container.onpointercancel = onPointerUp;

    container.onkeydown = (e) => {
      const stepMap = {
        ArrowLeft: e.shiftKey ? -10 : -2,
        ArrowDown: e.shiftKey ? -10 : -2,
        ArrowRight: e.shiftKey ? 10 : 2,
        ArrowUp: e.shiftKey ? 10 : 2,
        Home: -100,
        End: 100
      };
      if (stepMap[e.key] !== undefined) {
        e.preventDefault();
        applySplit(split + stepMap[e.key]);
      }
    };

    window.addEventListener("resize", () => applySplit(split), { passive: true });
  };
})();
