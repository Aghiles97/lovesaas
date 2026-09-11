/**
 * Runtime Engine: Gift Unboxer Widget
 */
(function() {
  window.setupGiftUnboxer = function(data) {
    const section = document.getElementById("giftUnboxerSection");
    if (!section) return;

    let stage = 1; // 1: ribbon on, 2: ribbon off, 3: lid off & revealed
    const boxWrap = section.querySelector(".gift-stage-wrap");
    const giftBox = document.getElementById("giftBox3d");
    const revealCard = document.getElementById("giftSurpriseReveal");
    const btnRewrap = document.getElementById("btnRewrapGift");
    const dot1 = document.getElementById("dotStep1");
    const dot2 = document.getElementById("dotStep2");
    const dot3 = document.getElementById("dotStep3");

    function setStage(newStage) {
      stage = newStage;
      if (dot1) dot1.classList.toggle("active", stage >= 1);
      if (dot2) dot2.classList.toggle("active", stage >= 2);
      if (dot3) dot3.classList.toggle("active", stage >= 3);

      if (stage === 1) {
        if (boxWrap) {
          boxWrap.classList.remove("stage-ribbon-off", "stage-lid-off", "stage-revealed");
        }
        if (revealCard) revealCard.classList.remove("shown");
      } else if (stage === 2) {
        if (boxWrap) {
          boxWrap.classList.add("stage-ribbon-off");
          boxWrap.classList.remove("stage-lid-off", "stage-revealed");
        }
      } else if (stage === 3) {
        if (boxWrap) {
          boxWrap.classList.add("stage-ribbon-off", "stage-lid-off", "stage-revealed");
        }
        if (revealCard) revealCard.classList.add("shown");
        if (typeof window.confetti === "function") {
          window.confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 } });
        }
      }
    }

    if (giftBox) {
      giftBox.onclick = function() {
        if (stage === 1) setStage(2);
        else if (stage === 2) setStage(3);
      };
    }

    const btnClaim = document.getElementById("btnClaimGift");
    if (btnClaim) {
      btnClaim.onclick = function(e) {
        const href = btnClaim.getAttribute("href");
        if (!href || href === "#" || href === "") {
          e.preventDefault();
          if (typeof window.confetti === "function") {
            window.confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
          } else {
            alert("🎉 Birthday Surprise Claimed! Enjoy your special treat! 💖");
          }
        }
      };
    }

    window.unboxGiftStep = function() {
      if (stage < 3) setStage(stage + 1);
    };
    window.unboxGiftReset = function() {
      setStage(1);
    };
  };
})();
