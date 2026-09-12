/**
 * Runtime Widget Engine: boarding-pass.runtime.js
 * Modularized for high maintainability.
 */
function getDestAirportCode(str) {
  const s = (str || "").toLowerCase();
  for (const [k, v] of Object.entries(AIRPORT_CODES)) {
    if (s.includes(k)) return v;
  }
  const letters = s.replace(/[^a-z]/g, "");
  return letters.length >= 3 ? letters.substring(0, 3).toUpperCase() : "VIP";
}

function setupGiftBox() {
  const claimBtn = document.getElementById("claimGiftBtn");
  const chips = document.querySelectorAll(".dest-chip");
  const customInput = document.getElementById("customDestInput");
  const confirmedNotice = document.getElementById("tripConfirmedNotice");
  const ticketDestCode = document.getElementById("ticketDestCode");
  const ticketDestName = document.getElementById("ticketDestName");
  const ticketQuoteText = document.getElementById("ticketQuoteText");
  const ticketStatusVal = document.getElementById("ticketStatusVal");
  const shareWhatsAppBtn = document.getElementById("shareTripWhatsAppBtn");

  let currentDest = {
    name: "Japan 🇯🇵 (Tokyo & Kyoto)",
    code: "TYO",
    quote: "Walking under pink cherry blossoms in Kyoto & eating authentic ramen in Tokyo together!"
  };

  const getWhatsAppPayload = (destName) => {
    const msg = `Baby! I just picked our next dream adventure on our website: ${destName}! Pack your bags, let's fly together! ✈️💖`;
    const encoded = encodeURIComponent(msg);
    const rawPhone = localStorage.getItem("gf_boyfriend_phone") || "";
    const phone = rawPhone.replace(/[^0-9]/g, "");
    const nativeApp = phone ? `whatsapp://send?phone=${phone}&text=${encoded}` : `whatsapp://send?text=${encoded}`;
    const webUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    return { msg, encoded, nativeApp, webUrl };
  };

  const updateWhatsAppShareUrl = (destName) => {
    if (!shareWhatsAppBtn) return;
    const { webUrl } = getWhatsAppPayload(destName);
    shareWhatsAppBtn.href = webUrl;
  };

  const updateTicketView = (name, code, quote) => {
    if (ticketDestCode) ticketDestCode.textContent = code || getDestAirportCode(name);
    if (ticketDestName) {
      let displayName = name;
      const match = name.match(/^(.*?\(.*?\))/);
      if (match && match[1].length <= 32) {
        displayName = match[1];
      } else if (name.length > 28) {
        displayName = name.split("(")[0].trim();
      }
      ticketDestName.textContent = displayName;
    }
    if (ticketQuoteText) ticketQuoteText.innerHTML = `💌 <em>"${quote}"</em>`;
    updateWhatsAppShareUrl(name);
  };

  if (shareWhatsAppBtn) {
    shareWhatsAppBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const { msg, nativeApp, webUrl } = getWhatsAppPayload(currentDest.name);

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(msg).catch(() => {});
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = nativeApp;
        setTimeout(() => {
          if (document.hasFocus()) window.open(webUrl, "_blank");
        }, 1100);
      } else {
        window.open(webUrl, "_blank");
      }
      showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "💬 Opening WhatsApp for boyfriend! ❤️");
    });
  }

  // Initial update
  const savedTripWish = localStorage.getItem("gf_saved_trip_wish");
  if (savedTripWish) {
    let matched = false;
    const s = savedTripWish.trim().toLowerCase();
    chips.forEach(c => {
      const title = (c.getAttribute("data-title") || c.textContent || "").trim();
      const dest = (c.getAttribute("data-dest") || "").trim().toLowerCase();
      const t = title.toLowerCase();
      if (t === s || t.includes(s) || s.includes(t) || (dest && s.includes(dest))) {
        chips.forEach(chip => chip.classList.remove("active", "selected"));
        c.classList.add("active", "selected");
        const code = c.getAttribute("data-code") || getDestAirportCode(title);
        const quote = c.getAttribute("data-quote") || "Our next grand adventure awaits!";
        currentDest = { name: title, code, quote };
        updateTicketView(title, code, quote);
        matched = true;
      }
    });
    if (!matched && customInput) {
      customInput.value = savedTripWish;
      const code = getDestAirportCode(savedTripWish);
      currentDest = {
        name: savedTripWish,
        code,
        quote: `Exploring ${savedTripWish} hand-in-hand together! Our next grand adventure awaits!`
      };
      updateTicketView(currentDest.name, currentDest.code, currentDest.quote);
    }
  } else {
    updateWhatsAppShareUrl(currentDest.name);
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active", "selected"));
      chip.classList.add("active", "selected");

      const title = chip.getAttribute("data-title") || chip.textContent;
      const code = chip.getAttribute("data-code") || getDestAirportCode(title);
      const quote = chip.getAttribute("data-quote") || "Wherever we fly next in the world, our next grand adventure awaits!";

      currentDest = { name: title, code, quote };
      updateTicketView(title, code, quote);
      audio.playPop();

      if (customInput) customInput.value = "";
      if (confirmedNotice) confirmedNotice.classList.add("hidden");
      if (claimBtn) {
        claimBtn.disabled = false;
        claimBtn.innerHTML = "<span>✈️ Lock In & Confirm Flight Wish! 💖</span>";
      }
      if (ticketStatusVal) ticketStatusVal.innerHTML = "<span>RESERVED FOR TWO 🎟️✨</span>";
    });
  });

  if (customInput) {
    customInput.addEventListener("input", () => {
      const val = customInput.value.trim();
      if (val) {
        chips.forEach(c => c.classList.remove("active", "selected"));
        const customTitle = `${val} 🌍✨`;
        const code = getDestAirportCode(val);
        currentDest = {
          name: customTitle,
          code,
          quote: `Exploring ${val} hand-in-hand together! Our next grand adventure awaits!`
        };
        updateTicketView(currentDest.name, currentDest.code, currentDest.quote);
        if (confirmedNotice) confirmedNotice.classList.add("hidden");
        if (claimBtn) {
          claimBtn.disabled = false;
          claimBtn.innerHTML = "<span>✈️ Lock In & Confirm Flight Wish! 💖</span>";
        }
      }
    });
  }

  if (claimBtn) {
    claimBtn.addEventListener("click", () => {
      audio.playFanfare();
      audio.playChimeCascade();
      state.bonusLof += 1000000000000;

      if (ticketStatusVal) ticketStatusVal.innerHTML = "<span>CONFIRMED & BOOKED 🎟️💍</span>";
      claimBtn.innerHTML = "<span>✅ Trip Wish Officially Stamped & Confirmed! ✈️💖</span>";
      claimBtn.disabled = true;

      if (confirmedNotice) confirmedNotice.classList.remove("hidden");

      const rect = claimBtn.getBoundingClientRect();
      particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);
      particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);

      localStorage.setItem("gf_saved_trip_wish", currentDest.name);
      if (typeof saveToComputer === "function") saveToComputer({ gf_saved_trip_wish: currentDest.name });
    });
  }

  // Ultra-Polished High-Res Boarding Pass Ticket PNG Generator
  const downloadTicketBtn = document.getElementById("downloadTicketBtn");
  if (downloadTicketBtn) {
    downloadTicketBtn.addEventListener("click", () => {
      const partnerName = (typeof window !== "undefined" && window.state && window.state.partnerName) ||
                          document.querySelector(".partner-name-display")?.textContent ||
                          (typeof state !== "undefined" && state.partnerName) ||
                          "Ella";
      const seatNumber = localStorage.getItem("gf_seat_number") || "1A (Beside Me Forever)";
      const flightNumber = localStorage.getItem("gf_flight_number") || "LOF-999";
      const isStamped = confirmedNotice && !confirmedNotice.classList.contains("hidden");

      const width = 1600;
      const height = 800;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, width, height);

      const pad = 28;
      const cardX = pad;
      const cardY = pad;
      const cardW = width - pad * 2;
      const cardH = height - pad * 2;
      const radius = 30;
      const stubX = 1180;

      // Card Outline with Notch Cutouts
      const buildCardPath = () => {
        ctx.beginPath();
        ctx.moveTo(cardX + radius, cardY);
        ctx.lineTo(stubX - 22, cardY);
        ctx.arc(stubX, cardY, 22, Math.PI, 0, true);
        ctx.lineTo(cardX + cardW - radius, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
        ctx.lineTo(cardX + cardW, cardY + cardH - radius);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
        ctx.lineTo(stubX + 22, cardY + cardH);
        ctx.arc(stubX, cardY + cardH, 22, 0, Math.PI, true);
        ctx.lineTo(cardX + radius, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
        ctx.lineTo(cardX, cardY + radius);
        ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
        ctx.closePath();
      };

      // Drop Shadow
      ctx.save();
      ctx.shadowColor = "rgba(255, 67, 101, 0.22)";
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 12;
      buildCardPath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();

      // Clip content inside the rounded card
      ctx.save();
      buildCardPath();
      ctx.clip();

      // Background gradient
      const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
      bgGrad.addColorStop(0, "#ffffff");
      bgGrad.addColorStop(1, "#fffdfa");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(cardX, cardY, cardW, cardH);



      // 1. VIP Header
      const headerH = 125;
      const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
      headerGrad.addColorStop(0, "#12141f");
      headerGrad.addColorStop(0.5, "#1f2434");
      headerGrad.addColorStop(1, "#161926");
      ctx.fillStyle = headerGrad;
      ctx.fillRect(cardX, cardY, cardW, headerH);

      // Gold bottom border of header
      const goldGrad = ctx.createLinearGradient(cardX, cardY + headerH, cardX + cardW, cardY + headerH);
      goldGrad.addColorStop(0, "#f1c40f");
      goldGrad.addColorStop(0.5, "#ff758c");
      goldGrad.addColorStop(1, "#f39c12");
      ctx.fillStyle = goldGrad;
      ctx.fillRect(cardX, cardY + headerH - 4, cardW, 4);

      // Header Brand
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 34px 'Outfit', -apple-system, sans-serif";
      ctx.fillText("✈️ INFINITE LOF AIRWAYS", cardX + 44, cardY + 58);

      ctx.fillStyle = "#a4b0be";
      ctx.font = "600 15px 'Outfit', -apple-system, sans-serif";
      ctx.fillText("OFFICIAL FIRST CLASS INTERCONTINENTAL VIP PASS", cardX + 44, cardY + 92);

      // VIP Badge
      const badgeW = 240;
      const badgeH = 44;
      const badgeX = cardX + cardW - badgeW - 44;
      const badgeY = cardY + 40;
      const bGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      bGrad.addColorStop(0, "#ff4365");
      bGrad.addColorStop(1, "#ff758c");
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 22);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px 'Outfit', -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("FIRST CLASS VIP 💕", badgeX + badgeW / 2, badgeY + 28);

      // 2. Tear-Off Perforation Line
      ctx.beginPath();
      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = "rgba(215, 195, 205, 0.75)";
      ctx.lineWidth = 2.5;
      ctx.moveTo(stubX, cardY + 24);
      ctx.lineTo(stubX, cardY + cardH - 24);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Main Ticket Body
      const contentLeft = cardX + 44;
      const contentRight = stubX - 44;

      // Route: ALG / CGK
      ctx.textAlign = "left";
      ctx.fillStyle = "#ff4365";
      ctx.font = "900 54px 'SF Mono', Menlo, monospace";
      ctx.fillText("ALG / CGK", contentLeft, 230);

      ctx.fillStyle = "#747d8c";
      ctx.font = "600 20px 'Outfit', -apple-system, sans-serif";
      ctx.fillText("Algiers & Jakarta", contentLeft, 268);

      // Center Flight Path
      const centerPathX = (contentLeft + contentRight) / 2 - 40;
      ctx.textAlign = "center";
      ctx.fillStyle = "#b7791f";
      ctx.font = "bold 17px 'Outfit', -apple-system, sans-serif";
      ctx.fillText("NON-STOP LOF", centerPathX, 212);

      ctx.fillStyle = "#ff4365";
      ctx.font = "bold 30px 'Outfit', -apple-system, sans-serif";
      ctx.fillText("────── ✈️ ──────▶", centerPathX, 248);

      // Destination Code & Name
      ctx.textAlign = "right";
      ctx.fillStyle = "#ff4365";
      ctx.font = "900 54px 'SF Mono', Menlo, monospace";
      ctx.fillText(currentDest.code || "VIP", contentRight, 230);

      let destFontSz = 22;
      ctx.font = `bold ${destFontSz}px 'Outfit', -apple-system, sans-serif`;
      while (ctx.measureText(currentDest.name).width > 340 && destFontSz > 14) {
        destFontSz -= 1;
        ctx.font = `bold ${destFontSz}px 'Outfit', -apple-system, sans-serif`;
      }
      ctx.fillStyle = "#2f3542";
      ctx.fillText(currentDest.name, contentRight, 268);

      // Separator Line
      ctx.beginPath();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = "rgba(255, 182, 193, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.moveTo(contentLeft, 305);
      ctx.lineTo(contentRight, 305);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Details Grid
      const col1 = contentLeft;
      const col2 = contentLeft + 260;
      const col3 = contentLeft + 540;
      const col4 = contentLeft + 790;

      ctx.textAlign = "left";
      ctx.fillStyle = "#a4b0be";
      ctx.font = "bold 15px 'Outfit', -apple-system, sans-serif";
      ctx.fillText("PASSENGER", col1, 350);
      ctx.fillText("SEAT", col2, 350);
      ctx.fillText("FLIGHT", col3, 350);
      ctx.fillText("STATUS", col4, 350);

      ctx.fillStyle = "#1e272e";
      ctx.font = "bold 25px 'Outfit', -apple-system, sans-serif";
      ctx.fillText(partnerName, col1, 388);

      ctx.fillStyle = "#b7791f";
      ctx.fillText(seatNumber, col2, 388);

      ctx.fillStyle = "#1e272e";
      ctx.fillText(flightNumber, col3, 388);

      ctx.fillStyle = isStamped ? "#27ae60" : "#2980b9";
      ctx.fillText(isStamped ? "OFFICIALLY BOOKED 🎟️💍" : "CONFIRMED FOR TWO 🎟️✨", col4, 388);

      // 5. Romantic Quote Container
      const qBoxX = contentLeft;
      const qBoxY = 432;
      const qBoxW = contentRight - contentLeft;
      const qBoxH = 88;

      ctx.fillStyle = "#fffcf5";
      ctx.beginPath();
      ctx.roundRect(qBoxX, qBoxY, qBoxW, qBoxH, 16);
      ctx.fill();
      ctx.strokeStyle = "#fed330";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#795548";
      ctx.font = "italic 19px 'Georgia', serif";
      ctx.textAlign = "center";
      let qText = `💌 "${currentDest.quote}"`;
      if (ctx.measureText(qText).width > qBoxW - 40) {
        ctx.font = "italic 16px 'Georgia', serif";
      }
      ctx.fillText(qText, qBoxX + qBoxW / 2, qBoxY + 52);

      // 6. Rubber Stamp
      ctx.save();
      const stampX = contentLeft + 780;
      const stampY = 615;
      ctx.translate(stampX, stampY);
      ctx.rotate(-12 * Math.PI / 180);

      ctx.strokeStyle = "rgba(235, 77, 75, 0.88)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(235, 77, 75, 0.92)";
      ctx.textAlign = "center";
      ctx.font = "bold 13px 'SF Mono', monospace";
      ctx.fillText("★ INFINITE LOF ★", 0, -26);
      ctx.font = "bold 16px 'Outfit', sans-serif";
      ctx.fillText("OFFICIAL STAMP", 0, -5);
      ctx.font = "bold 14px 'Outfit', sans-serif";
      ctx.fillText("BOOKED 2026 💍", 0, 16);
      ctx.font = "12px monospace";
      ctx.fillText("VERIFIED LOVE", 0, 36);
      ctx.restore();

      // 7. Realistic Barcode
      ctx.fillStyle = "#1e272e";
      const mainBcW = 680;
      const mainBcH = 48;
      const mainBcY = 595;
      for (let x = contentLeft; x < contentLeft + mainBcW; x += 7) {
        if (Math.sin(x * 0.35) > -0.3) {
          ctx.fillRect(x, mainBcY, (x % 5 === 0 ? 4.5 : 2), mainBcH);
        }
      }
      ctx.fillStyle = "#747d8c";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "left";
      ctx.fillText("ETKT 999 2847 1928 4032 0 • OFFICIALLY ISSUED WITH INFINITE LOF", contentLeft, mainBcY + 72);

      // 8. Right Tear-Off Passenger Stub
      const stubLeft = stubX + 34;
      const stubRight = cardX + cardW - 34;
      const stubCenter = (stubLeft + stubRight) / 2;

      ctx.textAlign = "center";
      ctx.fillStyle = "#ff4365";
      ctx.font = "bold 20px 'Outfit', sans-serif";
      ctx.fillText("BOARDING PASS", stubCenter, 185);

      ctx.fillStyle = "#747d8c";
      ctx.font = "bold 12px 'Outfit', sans-serif";
      ctx.fillText("PASSENGER STUB", stubCenter, 208);

      ctx.fillStyle = "#2f3542";
      ctx.font = "900 32px 'SF Mono', monospace";
      ctx.fillText(`ALG ✈ ${currentDest.code || "VIP"}`, stubCenter, 260);

      ctx.textAlign = "left";
      ctx.fillStyle = "#a4b0be";
      ctx.font = "bold 13px 'Outfit', sans-serif";
      ctx.fillText("PASSENGER", stubLeft, 315);
      ctx.fillStyle = "#1e272e";
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.fillText(partnerName, stubLeft, 340);

      ctx.fillStyle = "#a4b0be";
      ctx.font = "bold 13px 'Outfit', sans-serif";
      ctx.fillText("FLIGHT / SEAT", stubLeft, 385);
      ctx.fillStyle = "#1e272e";
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.fillText(`${flightNumber} • ${seatNumber.split("(")[0].trim()}`, stubLeft, 410);

      ctx.fillStyle = "#a4b0be";
      ctx.font = "bold 13px 'Outfit', sans-serif";
      ctx.fillText("DESTINATION", stubLeft, 455);
      ctx.fillStyle = "#ff4365";
      ctx.font = "bold 16px 'Outfit', sans-serif";
      let shortDestStub = currentDest.name.split("(")[0].trim();
      if (shortDestStub.length > 20) shortDestStub = shortDestStub.substring(0, 18) + "...";
      ctx.fillText(shortDestStub, stubLeft, 478);

      // Stub barcode
      ctx.fillStyle = "#1e272e";
      const stubBcW = stubRight - stubLeft;
      for (let x = stubLeft; x < stubLeft + stubBcW; x += 6) {
        if (Math.sin(x * 0.45) > -0.25) {
          ctx.fillRect(x, 535, (x % 4 === 0 ? 3.5 : 1.8), 65);
        }
      }
      ctx.textAlign = "center";
      ctx.fillStyle = "#747d8c";
      ctx.font = "11px monospace";
      ctx.fillText("VIP • LOF-ETKT-2026", stubCenter, 625);

      // 9. Card Outer Gold Foil Stroke
      ctx.restore();
      ctx.save();
      buildCardPath();
      ctx.strokeStyle = "rgba(224, 172, 105, 0.8)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Trigger high-res file download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `First_Class_Ticket_to_${currentDest.code}_for_${partnerName}.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);

        audio.playFanfare();
        particles.burst(window.innerWidth / 2, window.innerHeight / 2, 45);
        showComplimentToast(window.innerWidth / 2, window.innerHeight / 2, "🎟️ First Class Flight Ticket saved to your device!");
      }, "image/png");
    });
  }
}

window.claimBoardingPassFlight = function() {
  const btn = document.getElementById("claimGiftBtn");
  if (btn) btn.click();
};

window.downloadBoardingPassTicket = function() {
  const btn = document.getElementById("downloadTicketBtn");
  if (btn) btn.click();
};

window.resetBoardingPassWish = function() {
  try { localStorage.removeItem("gf_saved_trip_wish"); } catch (e) {}
  const notice = document.getElementById("tripConfirmedNotice");
  if (notice) notice.classList.add("hidden");
  const claimBtn = document.getElementById("claimGiftBtn");
  if (claimBtn) {
    claimBtn.disabled = false;
    claimBtn.innerHTML = "<span>✈️ Lock In & Confirm Flight Wish! 💖</span>";
  }
  const ticketStatusVal = document.getElementById("ticketStatusVal");
  if (ticketStatusVal) ticketStatusVal.innerHTML = "<span>RESERVED FOR TWO 🎟️✨</span>";
  if (typeof audio !== "undefined" && audio.playSparkle) audio.playSparkle();
};

// Couple Trivia Quiz
let currentQuizStep = 0;

