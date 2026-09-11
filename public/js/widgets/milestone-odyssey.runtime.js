(function() {
  window.setupMilestoneOdyssey = function(data) {
    const section = document.getElementById("milestoneOdysseySection");
    if (!section) return;

    const container = document.getElementById("odysseyRunwayContainer");
    const track = document.getElementById("odysseyRunwayTrack");
    const svgPath = document.getElementById("odysseySvgPath");
    const svgCanvas = document.getElementById("odysseySvgCanvas");
    const btnPrev = document.getElementById("btnOdysseyPrev");
    const btnNext = document.getElementById("btnOdysseyNext");

    const modalBackdrop = document.getElementById("odysseyModalBackdrop");
    const btnModalClose = document.getElementById("btnOdysseyModalClose");
    const modalTitle = document.getElementById("odysseyModalTitle");
    const modalDate = document.getElementById("odysseyModalDate");
    const modalLocation = document.getElementById("odysseyModalLocation");
    const modalIcon = document.getElementById("odysseyModalIcon");
    const modalDesc = document.getElementById("odysseyModalDesc");
    const modalImg = document.getElementById("odysseyModalImg");
    const modalMedia = document.getElementById("odysseyModalMedia");

    const nodes = Array.from(section.querySelectorAll(".odyssey-node"));

    function updateSvgLine() {
      if (!track || !svgPath || !svgCanvas || nodes.length === 0) return;

      const trackRect = track.getBoundingClientRect();
      const points = [];

      nodes.forEach(node => {
        const pin = node.querySelector(".odyssey-pin");
        if (!pin) return;
        const pinRect = pin.getBoundingClientRect();
        const cx = (pinRect.left + pinRect.width / 2) - trackRect.left;
        const cy = (pinRect.top + pinRect.height / 2) - trackRect.top;
        points.push({ x: cx, y: cy });
      });

      if (points.length < 2) {
        svgPath.setAttribute("d", "");
        return;
      }

      svgCanvas.setAttribute("width", track.scrollWidth || trackRect.width);
      svgCanvas.setAttribute("height", track.scrollHeight || trackRect.height);

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midX = (p0.x + p1.x) / 2;
        d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
      }
      svgPath.setAttribute("d", d);
    }

    // Horizontal Scroll Controls
    const getScrollStep = () => Math.min(380, Math.max(220, (container?.clientWidth || 300) * 0.85));
    if (btnPrev && container) {
      btnPrev.onclick = () => {
        container.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
      };
    }
    if (btnNext && container) {
      btnNext.onclick = () => {
        container.scrollBy({ left: getScrollStep(), behavior: "smooth" });
      };
    }

    // Drag to scroll
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;

    if (container) {
      container.addEventListener("mousedown", (e) => {
        isDown = true;
        hasDragged = false;
        container.classList.add("dragging");
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      });

      window.addEventListener("mouseup", () => {
        if (!isDown) return;
        isDown = false;
        container.classList.remove("dragging");
      });

      container.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 5) hasDragged = true;
        container.scrollLeft = scrollLeft - walk;
      });
    }

    // Open Modal Details
    function openModal(node) {
      if (hasDragged) return;
      const { title, date, location, icon, desc, img } = node.dataset;

      if (modalTitle) modalTitle.textContent = title || "Milestone";
      if (modalDate) modalDate.textContent = date || "";
      if (modalLocation) {
        modalLocation.textContent = location ? `📍 ${location}` : "";
        modalLocation.style.display = location ? "inline-block" : "none";
      }
      if (modalIcon) modalIcon.textContent = icon || "📍";
      if (modalDesc) modalDesc.textContent = desc || "";

      if (modalMedia && modalImg) {
        if (img) {
          modalImg.src = img;
          modalMedia.style.display = "block";
        } else {
          modalMedia.style.display = "none";
        }
      }

      if (modalBackdrop) {
        modalBackdrop.classList.add("active");
        modalBackdrop.setAttribute("aria-hidden", "false");
      }
    }

    function closeModal() {
      if (modalBackdrop) {
        modalBackdrop.classList.remove("active");
        modalBackdrop.setAttribute("aria-hidden", "true");
      }
    }

    nodes.forEach(node => {
      node.onclick = () => openModal(node);
    });

    if (btnModalClose) btnModalClose.onclick = closeModal;
    if (modalBackdrop) {
      modalBackdrop.onclick = (e) => {
        if (e.target === modalBackdrop) closeModal();
      };
    }
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    // Resize and images loading listeners
    window.addEventListener("resize", updateSvgLine);
    section.querySelectorAll("img").forEach(img => {
      img.addEventListener("load", updateSvgLine);
    });
    setTimeout(updateSvgLine, 100);
    setTimeout(updateSvgLine, 500);

    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "ODYSSEY_SCROLL_NEXT" && container) {
        container.scrollBy({ left: getScrollStep(), behavior: "smooth" });
      }
    });

    window.odysseyScrollNext = () => {
      if (container) container.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    };
  };
})();
