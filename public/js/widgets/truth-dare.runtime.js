/**
 * Runtime Widget Engine: truth-dare.runtime.js
 * Comprehensive duel engine: Rigging controls (P1/P2/Fair/Custom),
 * Touch/flick bottle physics, dual winner challenges, and mobile polish.
 */
function setupTruthOrDareGame(customData, heroData) {
  const section = document.getElementById("truthDareSection");
  if (!section) return;

  const td = customData || window.TRUTH_DARE_DATA || window.__TENANT_CONFIG__?.sectionsData?.truth_dare || {};
  const hero = heroData || window.__TENANT_CONFIG__?.sectionsData?.hero || {};
  const p1 = td.p1Name || (typeof state !== "undefined" && state.senderName) || hero.partner1 || "Aghiles";
  const p2 = td.p2Name || (typeof state !== "undefined" && state.partnerName) || hero.partner2 || "Ela";

  const box = section.querySelector(".truth-dare-box") || section;
  const spinBtn = document.getElementById("todSpinBtn");
  const spinRow = document.getElementById("todSpinRow");
  const bottleZone = document.getElementById("todBottleZone");
  const bottleDisc = document.getElementById("todBottleDisc");
  const bottleWrapper = document.getElementById("todBottleWrapper");
  const scoreAghiles = document.getElementById("todScoreAghiles");
  const scoreEla = document.getElementById("todScoreEla");
  const roundBadge = document.getElementById("todRoundBadge");
  const statusAlert = document.getElementById("todStatusAlert");
  const challengeCard = document.getElementById("todChallengeCard");
  const cardAghiles = document.getElementById("todCardAghiles");
  const cardEla = document.getElementById("todCardElla");
  const targetP1 = document.getElementById("todTargetP1");
  const targetP2 = document.getElementById("todTargetP2");

  let currentRound = 1;
  let spinning = false;
  let currentRotation = 0;
  let p1Score = 0;
  let p2Score = 0;
  let rigMode = td.rigMode || section.dataset.rig || "p1_rigged";
  let spinDuration = parseFloat(td.spinDuration) || 2.8;

  // Determine winner for the given round
  const getRoundWinner = (round) => {
    if (rigMode === "p1_rigged") return "p1";
    if (rigMode === "p2_rigged") return "p2";
    if (rigMode === "fair") return Math.random() < 0.5 ? "p1" : "p2";
    if (rigMode === "alternate") return round % 2 === 1 ? "p1" : "p2";
    if (rigMode === "custom") {
      const customKey = "r" + round + "Winner";
      return td[customKey] || (round === 2 ? "p2" : "p1");
    }
    return "p1";
  };

  const updateIndicators = () => {
    if (roundBadge) roundBadge.textContent = currentRound <= 3 ? `Game ${currentRound}/3` : "Complete 🏆";
    if (cardAghiles) cardAghiles.classList.remove("active-turn", "winner-pulse");
    if (cardEla) cardEla.classList.remove("active-turn", "winner-pulse");
    if (targetP1) targetP1.classList.remove("targeted");
    if (targetP2) targetP2.classList.remove("targeted");
  };

  const startBottleSpin = (forcedWinner) => {
    if (spinning || currentRound > 3) return;
    spinning = true;
    if (spinBtn) spinBtn.disabled = true;
    if (challengeCard) challengeCard.classList.add("hidden");
    if (box) box.classList.remove("challenge-active");
    if (spinRow) spinRow.classList.remove("hidden");
    if (bottleDisc) bottleDisc.classList.add("has-spun");
    if (bottleWrapper) bottleWrapper.classList.add("spinning");

    const winner = forcedWinner || getRoundWinner(currentRound);

    const taunts = [
      `Game 1 spin! Who will fate choose?! 🍾`,
      `Game 2 spin! Tension is soaring between ${p1} and ${p2}! 🌊`,
      `Game 3 spin! The high-stakes finale is turning! 💫`
    ];
    if (statusAlert) statusAlert.textContent = taunts[currentRound - 1] || "The bottle of destiny is spinning! 🍾";

    let ticks = 0;
    const tickInterval = setInterval(() => {
      if (typeof audio !== "undefined" && typeof audio.playTick === "function") audio.playTick();
      ticks++;
      if (ticks > 18) clearInterval(tickInterval);
    }, 120);

    // Target angle: P1 is North (0 deg mod 360), P2 is South (180 deg mod 360)
    const baseTargetAngle = winner === "p1" ? 0 : 180;
    const organicJitter = (Math.random() - 0.5) * 8; // -4deg to +4deg
    const fullSpins = (4 + currentRound) * 360;
    const currentModulo = ((currentRotation % 360) + 360) % 360;
    const deltaToTarget = (baseTargetAngle - currentModulo + 360) % 360;

    currentRotation += fullSpins + deltaToTarget + organicJitter;

    if (bottleWrapper) {
      bottleWrapper.style.transition = `transform ${spinDuration}s cubic-bezier(0.12, 0.88, 0.26, 1)`;
      bottleWrapper.style.transform = `rotate(${currentRotation}deg)`;
    }

    setTimeout(() => {
      spinning = false;
      if (bottleWrapper) bottleWrapper.classList.remove("spinning");

      if (winner === "p1") {
        p1Score++;
        if (scoreAghiles) {
          scoreAghiles.textContent = String(p1Score);
          scoreAghiles.classList.add("score-bump");
          setTimeout(() => scoreAghiles.classList.remove("score-bump"), 500);
        }
        if (cardAghiles) cardAghiles.classList.add("winner-pulse", "active-turn");
        if (targetP1) targetP1.classList.add("targeted");
      } else {
        p2Score++;
        if (scoreEla) {
          scoreEla.textContent = String(p2Score);
          scoreEla.classList.add("score-bump");
          setTimeout(() => scoreEla.classList.remove("score-bump"), 500);
        }
        if (cardEla) cardEla.classList.add("winner-pulse", "active-turn");
        if (targetP2) targetP2.classList.add("targeted");
      }

      if (typeof audio !== "undefined" && typeof audio.playFanfare === "function") audio.playFanfare();
      if (typeof particles !== "undefined" && typeof particles.burst === "function" && bottleWrapper) {
        const b = bottleWrapper.getBoundingClientRect();
        particles.burst(b.left + b.width / 2, b.top + b.height / 2, 36);
      }

      const winName = winner === "p1" ? p1 : p2;
      const loseName = winner === "p1" ? p2 : p1;
      const winAlerts = [
        `🎉 Bottle lands on ${winName.toUpperCase()}! ${winName} claims Game 1! (${p1Score} - ${p2Score})`,
        `😱 ${winName.toUpperCase()} STRIKES! ${winName} takes Game 2! (${p1Score} - ${p2Score})`,
        `👑 CLIMAX! ${winName.toUpperCase()} WINS GAME 3! Final Score: ${p1Score} - ${p2Score}!`
      ];
      if (statusAlert) statusAlert.textContent = winAlerts[currentRound - 1] || `${winName} wins!`;

      renderChallenge(winner);
    }, spinDuration * 1000);
  };

  // Render Challenge Card based on who won the round
  const renderChallenge = (winner) => {
    if (challengeCard) challengeCard.classList.remove("hidden");
    if (box) box.classList.add("challenge-active");
    if (spinRow) spinRow.classList.add("hidden");
    if (!challengeCard) return;

    const chooser = winner === "p1" ? p1 : p2;
    const target = winner === "p1" ? p2 : p1;

    challengeCard.innerHTML = `
      <div class="tod-decision-panel">
        <div style="font-size: 1.4rem;">🤔</div>
        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${chooser} won! ${chooser} is choosing for ${target}...</div>
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <span style="padding: 4px 12px; border-radius: 999px; background: rgba(255,67,101,0.1); font-weight: 700; font-size: 0.8rem; color: var(--primary);">Game ${currentRound} of 3</span>
        </div>
      </div>
    `;

    setTimeout(() => {
      if (typeof audio !== "undefined") {
        if (typeof audio.playSparkle === "function") audio.playSparkle();
        if (typeof audio.playPop === "function") audio.playPop();
      }

      if (winner === "p1") {
        renderP1WinningRound();
      } else {
        renderP2WinningRound();
      }
    }, 600);
  };

  // P1 Winning challenge flow
  const renderP1WinningRound = () => {
    if (currentRound === 1) {
      const r1Prompt = td.r1Prompt || (td.rounds && td.rounds[0]?.prompt) || `Do you really lof someone called ${p1}, who lives in Algeria?`;
      const r1Yes = td.r1YesText || `Yes, I really lof ${p1 === "Aghiles" ? "him" : p1} with all my heart! ❤️🥰`;
      const r1No = td.r1NoText || "No, who is that? 😜";
      const r1Feedback = td.r1Feedback || `<strong>${p1}:</strong> "Hehehe I knew it! Correct answer! 🥰 But I'm still up 1 - 0!"`;

      challengeCard.innerHTML = `
        <div class="tod-choice-announcement">👑 ${p1} Chose: TRUTH! 🔮</div>
        <h3 class="tod-prompt-text">"${r1Prompt.replace(/^"|"$/g, '')}"</h3>
        <div class="tod-options-grid">
          <button type="button" class="btn btn-primary" id="todR1YesBtn">
            <span>${r1Yes}</span>
          </button>
          <div class="tod-evasive-wrap">
            <button type="button" class="btn btn-secondary tod-evasive-btn" id="todR1NoBtn">
              <span>${r1No}</span>
            </button>
          </div>
        </div>
        <div class="tod-feedback-box hidden" id="todR1Feedback"></div>
      `;

      const yesBtn = document.getElementById("todR1YesBtn");
      const noBtn = document.getElementById("todR1NoBtn");
      const feedback = document.getElementById("todR1Feedback");
      let evasiveClicks = 0;

      const evasiveTexts = [
        `🚨 Warning: Answer rejected by border control!`,
        `Nice try! 'No' button is currently out of order! 🚫`,
        `Error 404: 'No' not found in ${p2}'s heart! 💕`,
        `Your finger slipped! Just tap the YES button! 🥰`
      ];

      const dodgeNo = (e) => {
        if (e) e.preventDefault();
        evasiveClicks++;
        const randX = (Math.random() - 0.5) * 120;
        const randY = (Math.random() - 0.5) * 50;
        if (noBtn) noBtn.style.transform = `translate(${randX}px, ${randY}px) scale(${Math.max(0.7, 1 - evasiveClicks * 0.08)})`;
        if (feedback) {
          feedback.textContent = evasiveTexts[evasiveClicks % evasiveTexts.length];
          feedback.classList.remove("hidden");
        }
        if (typeof audio !== "undefined" && typeof audio.playPop === "function") audio.playPop();
      };

      if (noBtn) {
        noBtn.addEventListener("mouseenter", dodgeNo);
        noBtn.addEventListener("click", dodgeNo);
        noBtn.addEventListener("touchstart", dodgeNo, { passive: false });
      }

      if (yesBtn) {
        yesBtn.addEventListener("click", () => {
          if (typeof audio !== "undefined") {
            if (typeof audio.playKiss === "function") audio.playKiss();
            if (typeof audio.playSuccessChime === "function") audio.playSuccessChime();
          }
          if (typeof particles !== "undefined" && typeof particles.burst === "function") {
            const b = yesBtn.getBoundingClientRect();
            particles.burst(b.left + b.width / 2, b.top + b.height / 2, 35);
          }
          if (feedback) {
            feedback.innerHTML = r1Feedback;
            feedback.classList.remove("hidden");
          }
          yesBtn.disabled = true;
          if (noBtn) noBtn.style.display = "none";

          setTimeout(() => {
            challengeCard.innerHTML += `
              <div style="margin-top: 14px;">
                <button type="button" class="btn btn-primary btn-pulse" id="todNextR2Btn">
                  <span>Spin for Game 2 🍾🎲 ➡️</span>
                </button>
              </div>
            `;
            const nextR2Btn = document.getElementById("todNextR2Btn");
            if (nextR2Btn) {
              nextR2Btn.addEventListener("click", () => {
                currentRound = 2;
                updateIndicators();
                startBottleSpin();
              });
            }
          }, 500);
        });
      }

    } else if (currentRound === 2) {
      const r2Prompt = td.r2Prompt || (td.rounds && td.rounds[1]?.prompt) || `If your previous answer was yes, send him a message on WhatsApp tell him: 'Yes i really lof someone from algeria'`;
      const r2WaText = td.r2WaText || "Yes i really lof someone from algeria";
      const r2WaPhone = (td.r2WaPhone || "").replace(/[^0-9]/g, "");
      const r2WaHref = r2WaPhone ? `https://wa.me/${r2WaPhone}?text=${encodeURIComponent(r2WaText)}` : `https://wa.me/?text=${encodeURIComponent(r2WaText)}`;
      const r2WaBtnText = td.r2WaBtnText || `📱 Send WhatsApp Dare to ${p1}`;
      const r2DoneText = td.r2DoneText || "I sent it! (Or promised to!) 😇💌";
      const r2Feedback = td.r2Feedback || `<strong>${p1}'s WhatsApp is buzzing! 📲</strong> Dare completed! Ready for Game 3?`;

      challengeCard.innerHTML = `
        <div class="tod-choice-announcement" style="background: #fff4ea; border-color: #ffd8a8; color: #d9480f;">👑 ${p1} Chose: DARE! 🔥</div>
        <h3 class="tod-prompt-text">"${r2Prompt.replace(/^"|"$/g, '')}"</h3>
        <div class="tod-options-grid">
          <a class="btn btn-primary" id="todR2WaBtn" href="${r2WaHref}" target="_blank" rel="noopener noreferrer">
            <span>${r2WaBtnText}</span>
          </a>
          <button type="button" class="btn btn-secondary" id="todR2DoneBtn">
            <span>${r2DoneText}</span>
          </button>
        </div>
        <div class="tod-feedback-box hidden" id="todR2Feedback"></div>
      `;

      const waBtn = document.getElementById("todR2WaBtn");
      const doneBtn = document.getElementById("todR2DoneBtn");
      const feedback = document.getElementById("todR2Feedback");

      const completeDare = () => {
        if (typeof audio !== "undefined" && typeof audio.playChimeCascade === "function") audio.playChimeCascade();
        if (typeof particles !== "undefined" && typeof particles.burst === "function" && doneBtn) {
          const b = doneBtn.getBoundingClientRect();
          particles.burst(b.left + b.width / 2, b.top + b.height / 2, 35);
        }
        if (feedback) {
          feedback.innerHTML = r2Feedback;
          feedback.classList.remove("hidden");
        }
        if (doneBtn) doneBtn.disabled = true;

        setTimeout(() => {
          challengeCard.innerHTML += `
            <div style="margin-top: 14px;">
              <button type="button" class="btn btn-primary btn-pulse" id="todNextR3Btn">
                <span>Spin for Finale Game 3 🍾🎲 ➡️</span>
              </button>
            </div>
          `;
          const nextR3Btn = document.getElementById("todNextR3Btn");
          if (nextR3Btn) {
            nextR3Btn.addEventListener("click", () => {
              currentRound = 3;
              updateIndicators();
              startBottleSpin();
            });
          }
        }, 500);
      };

      if (waBtn) {
        waBtn.addEventListener("click", () => {
          if (typeof audio !== "undefined" && typeof audio.playPop === "function") audio.playPop();
          setTimeout(completeDare, 500);
        });
      }
      if (doneBtn) doneBtn.addEventListener("click", completeDare);

    } else if (currentRound === 3) {
      const showConfession = td.showConfession !== false && rigMode.includes("rigged");
      const r3Confession = td.r3Confession || (td.rounds && td.rounds[2]?.prompt) || "I cheated that is why you lost for a third time, oops... you were supposed to say the truth not me! omg you cheat too?";
      const r3Author = td.r3Author || `— Confession by ${p1} 😏`;
      const r3Prompt = td.r3Prompt || `How does ${p2} plead to this outrageous confession?`;
      const r3Reactions = Array.isArray(td.r3Reactions) && td.r3Reactions.length > 0 ? td.r3Reactions : [
        `"I KNEW IT!! You big cheater!! 😂🥊"`,
        `"OMG you caught me... I cheat too! 🙈🤫"`,
        `"I demand infinite kisses and hugs as compensation! 💋🤗"`
      ];

      let reactionsHtml = "";
      r3Reactions.forEach(rx => {
        reactionsHtml += `<button type="button" class="tod-reaction-btn">${rx}</button>`;
      });

      challengeCard.innerHTML = `
        <div class="tod-choice-announcement" style="background: #f3f0ff; border-color: #d0bfff; color: #5f3dc4;">👑 ${p1} Chose: ${showConfession ? 'CONFESSION' : 'TRUTH'} 🕵️</div>
        <div class="tod-speech-bubble">
          <p class="tod-speech-quote">"${r3Confession.replace(/^"|"$/g, '')}"</p>
          <span class="tod-speech-author">${r3Author}</span>
        </div>
        <p style="font-weight: 600; font-size: 0.88rem; margin-bottom: 8px; color: var(--text-main);">${r3Prompt}</p>
        <div class="tod-reactions-list">
          ${reactionsHtml}
        </div>
        <div id="todFinalVerdict" class="hidden"></div>
      `;

      attachReactionListeners();
    }
  };

  // P2 Winning challenge flow
  const renderP2WinningRound = () => {
    if (currentRound === 1) {
      const p2R1Prompt = td.p2R1Prompt || `What was the exact millisecond you realized you fell head-over-heels in love with ${p2}?`;
      const opt1 = td.p2R1Opt1 || "From the very first conversation! 💘";
      const opt2 = td.p2R1Opt2 || "Every single day even more and more! 🥰";
      const feedbackText = td.p2R1Feedback || `<strong>${p2}:</strong> "Awww! That is 100% the right answer! Point 1 goes to the Queen! 👑💅"`;

      challengeCard.innerHTML = `
        <div class="tod-choice-announcement" style="background: #fff0f6; border-color: #ffdeeb; color: #c2255c;">👸🏻 ${p2} Chose: TRUTH! 🔮</div>
        <h3 class="tod-prompt-text">"${p2R1Prompt.replace(/^"|"$/g, '')}"</h3>
        <div class="tod-options-grid">
          <button type="button" class="btn btn-primary" id="todP2R1Opt1"><span>${opt1}</span></button>
          <button type="button" class="btn btn-secondary" id="todP2R1Opt2"><span>${opt2}</span></button>
        </div>
        <div class="tod-feedback-box hidden" id="todP2R1Feedback"></div>
      `;

      const btn1 = document.getElementById("todP2R1Opt1");
      const btn2 = document.getElementById("todP2R1Opt2");
      const fb = document.getElementById("todP2R1Feedback");

      const handleChoice = () => {
        if (typeof audio !== "undefined") {
          if (typeof audio.playKiss === "function") audio.playKiss();
          if (typeof audio.playSuccessChime === "function") audio.playSuccessChime();
        }
        if (typeof particles !== "undefined" && typeof particles.burst === "function" && btn1) {
          const b = btn1.getBoundingClientRect();
          particles.burst(b.left + b.width / 2, b.top + b.height / 2, 35);
        }
        if (fb) {
          fb.innerHTML = feedbackText;
          fb.classList.remove("hidden");
        }
        if (btn1) btn1.disabled = true;
        if (btn2) btn2.disabled = true;

        setTimeout(() => {
          challengeCard.innerHTML += `
            <div style="margin-top: 14px;">
              <button type="button" class="btn btn-primary btn-pulse" id="todNextR2Btn">
                <span>Spin for Game 2 🍾🎲 ➡️</span>
              </button>
            </div>
          `;
          const nextR2Btn = document.getElementById("todNextR2Btn");
          if (nextR2Btn) {
            nextR2Btn.addEventListener("click", () => {
              currentRound = 2;
              updateIndicators();
              startBottleSpin();
            });
          }
        }, 500);
      };

      if (btn1) btn1.addEventListener("click", handleChoice);
      if (btn2) btn2.addEventListener("click", handleChoice);

    } else if (currentRound === 2) {
      const p2R2Prompt = td.p2R2Prompt || `Dare for ${p1}: Send a 10-second cute voice message or selfie with your biggest smile right now!`;
      const p2R2Done = td.p2R2DoneText || "Dare Accepted & Done! 🫡💖";
      const p2R2Feedback = td.p2R2Feedback || `<strong>${p2}'s heart just melted! 💖</strong> Dare fulfilled! Ready for Game 3?`;

      challengeCard.innerHTML = `
        <div class="tod-choice-announcement" style="background: #fff4ea; border-color: #ffd8a8; color: #d9480f;">👸🏻 ${p2} Chose: DARE! 🔥</div>
        <h3 class="tod-prompt-text">"${p2R2Prompt.replace(/^"|"$/g, '')}"</h3>
        <div class="tod-options-grid">
          <button type="button" class="btn btn-primary" id="todP2DoneBtn">
            <span>${p2R2Done}</span>
          </button>
        </div>
        <div class="tod-feedback-box hidden" id="todP2R2Feedback"></div>
      `;

      const doneBtn = document.getElementById("todP2DoneBtn");
      const fb = document.getElementById("todP2R2Feedback");

      if (doneBtn) {
        doneBtn.addEventListener("click", () => {
          if (typeof audio !== "undefined" && typeof audio.playChimeCascade === "function") audio.playChimeCascade();
          if (typeof particles !== "undefined" && typeof particles.burst === "function") {
            const b = doneBtn.getBoundingClientRect();
            particles.burst(b.left + b.width / 2, b.top + b.height / 2, 35);
          }
          if (fb) {
            fb.innerHTML = p2R2Feedback;
            fb.classList.remove("hidden");
          }
          doneBtn.disabled = true;

          setTimeout(() => {
            challengeCard.innerHTML += `
              <div style="margin-top: 14px;">
                <button type="button" class="btn btn-primary btn-pulse" id="todNextR3Btn">
                  <span>Spin for Finale Game 3 🍾🎲 ➡️</span>
                </button>
              </div>
            `;
            const nextR3Btn = document.getElementById("todNextR3Btn");
            if (nextR3Btn) {
              nextR3Btn.addEventListener("click", () => {
                currentRound = 3;
                updateIndicators();
                startBottleSpin();
              });
            }
          }, 500);
        });
      }

    } else if (currentRound === 3) {
      const p2R3Prompt = td.p2R3Prompt || `${p2} takes Round 3! How does ${p1} bow to the reigning champion?`;
      const p2R3Reactions = [
        `"I bow to my Queen! You win everything! 👑👸🏻"`,
        `"Rematch tonight on video call! 😂🥊"`,
        `"Infinite kisses granted as royal tribute! 💋🤗"`
      ];

      let reactionsHtml = "";
      p2R3Reactions.forEach(rx => {
        reactionsHtml += `<button type="button" class="tod-reaction-btn">${rx}</button>`;
      });

      challengeCard.innerHTML = `
        <div class="tod-choice-announcement" style="background: #f3f0ff; border-color: #d0bfff; color: #5f3dc4;">👸🏻 ${p2} Claims Victory! 🏆</div>
        <p style="font-weight: 700; font-size: 1.05rem; margin-bottom: 12px; color: var(--text-main);">${p2R3Prompt}</p>
        <div class="tod-reactions-list">
          ${reactionsHtml}
        </div>
        <div id="todFinalVerdict" class="hidden"></div>
      `;

      attachReactionListeners();
    }
  };

  // Attach Reaction buttons and final verdict
  const attachReactionListeners = () => {
    const reactionBtns = challengeCard.querySelectorAll(".tod-reaction-btn");
    const verdict = document.getElementById("todFinalVerdict");

    reactionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (typeof audio !== "undefined") {
          if (typeof audio.playFanfare === "function") audio.playFanfare();
          if (typeof audio.playChimeCascade === "function") audio.playChimeCascade();
        }
        if (typeof particles !== "undefined" && typeof particles.burst === "function") {
          particles.burst(window.innerWidth / 2, window.innerHeight / 2, 50);
        }
        document.body.classList.add("screen-shake");
        setTimeout(() => document.body.classList.remove("screen-shake"), 500);

        reactionBtns.forEach((b) => (b.style.pointerEvents = "none"));
        btn.style.background = "var(--primary)";
        btn.style.color = "#fff";

        // Determine Final Verdict
        let vTitle = td.verdictTitle || "🏆 Official Verdict: Rigged by Love! ❤️";
        let vDesc = td.verdictDesc || `${p1} may have won, but <strong>${p2} wins their entire heart 10,000% forever</strong> across every kilometer! ✈️💍`;

        if (p2Score > p1Score) {
          vTitle = td.p2VerdictTitle || `👑 Official Verdict: ${p2} Reigns Supreme! 👸🏻`;
          vDesc = td.p2VerdictDesc || `${p2} takes the crown with a ${p2Score} - ${p1Score} victory! Undisputed queen of our hearts, ruling with love! 💖✨`;
        } else if (p1Score === p2Score) {
          vTitle = td.tieVerdictTitle || `🕊️ Official Verdict: Perfect Couple's Harmony! 💕`;
          vDesc = td.tieVerdictDesc || `A deadlock tie of pure devotion! Both ${p1} and ${p2} are undefeated champions together forever! 💑🌍`;
        }

        if (verdict) {
          verdict.innerHTML = `
            <div class="tod-trophy-banner">
              <h3>${vTitle}</h3>
              <p>${vDesc}</p>
            </div>
            <div class="tod-options-grid" style="margin-top: 12px;">
              <button type="button" class="btn btn-secondary" id="todResetBtn">
                <span>Play Again 🔄</span>
              </button>
              <a href="#dateNightSpinnerSection" class="btn btn-primary" id="todGoToSpinnerBtn">
                <span>Continue to Date Night Spinner 🎡 ⬇️</span>
              </a>
            </div>
          `;
          verdict.classList.remove("hidden");

          const resetBtn = document.getElementById("todResetBtn");
          if (resetBtn) {
            resetBtn.addEventListener("click", () => {
              window.todReset();
            });
          }

          const toSpinnerBtn = document.getElementById("todGoToSpinnerBtn");
          if (toSpinnerBtn) {
            toSpinnerBtn.addEventListener("click", (e) => {
              const targetSec = document.getElementById("dateNightSpinnerSection");
              if (targetSec) {
                e.preventDefault();
                targetSec.scrollIntoView({ behavior: "smooth" });
              }
            });
          }
        }
      });
    });
  };

  // Touch / Drag Flick gesture physics on bottle disc
  if (bottleDisc) {
    let isDragging = false;
    let startAngle = 0;
    let lastAngle = 0;
    let dragAngularVelocity = 0;
    let lastTime = 0;

    const getAngleFromEvent = (e) => {
      const rect = bottleDisc.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
      return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    };

    bottleDisc.addEventListener("pointerdown", (e) => {
      if (spinning || currentRound > 3) return;
      isDragging = true;
      startAngle = getAngleFromEvent(e);
      lastAngle = startAngle;
      lastTime = Date.now();
      dragAngularVelocity = 0;
      bottleDisc.setPointerCapture(e.pointerId);
      if (bottleWrapper) bottleWrapper.style.transition = "none";
    });

    bottleDisc.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const currentAngle = getAngleFromEvent(e);
      const delta = currentAngle - lastAngle;
      const now = Date.now();
      const dt = Math.max(now - lastTime, 1);
      dragAngularVelocity = delta / dt;

      currentRotation += delta;
      if (bottleWrapper) bottleWrapper.style.transform = `rotate(${currentRotation}deg)`;

      lastAngle = currentAngle;
      lastTime = now;
    });

    const finishDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try { bottleDisc.releasePointerCapture(e.pointerId); } catch (_) {}

      if (Math.abs(dragAngularVelocity) > 0.25 || Math.abs(currentRotation - startAngle) > 20) {
        startBottleSpin();
      } else {
        startBottleSpin();
      }
    };

    bottleDisc.addEventListener("pointerup", finishDrag);
    bottleDisc.addEventListener("pointercancel", finishDrag);
  }

  // Global methods for admin live testing
  window.todJumpToRound = (round) => {
    currentRound = Math.min(Math.max(1, round), 3);
    p1Score = Math.max(0, currentRound - 1);
    p2Score = 0;
    if (scoreAghiles) scoreAghiles.textContent = String(p1Score);
    if (scoreEla) scoreEla.textContent = String(p2Score);
    updateIndicators();
    renderChallenge(getRoundWinner(currentRound));
  };

  window.todSpin = () => {
    startBottleSpin();
  };

  window.todReset = () => {
    currentRound = 1;
    p1Score = 0;
    p2Score = 0;
    if (scoreAghiles) scoreAghiles.textContent = "0";
    if (scoreEla) scoreEla.textContent = "0";
    updateIndicators();
    if (challengeCard) challengeCard.classList.add("hidden");
    if (box) box.classList.remove("challenge-active");
    if (spinRow) spinRow.classList.remove("hidden");
    if (statusAlert) statusAlert.textContent = "Rematch! Tap or flick to spin the bottle! 🍾";
    if (spinBtn) {
      spinBtn.disabled = false;
      spinBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  window.todSetRig = (newMode) => {
    rigMode = newMode;
    if (section) section.dataset.rig = newMode;
    if (statusAlert) statusAlert.textContent = `Rig mode set to: ${newMode}. Ready to spin! 🍾`;
  };

  window.todSetSkin = (newSkin) => {
    if (bottleWrapper) {
      bottleWrapper.className = `tod-bottle-wrapper tod-skin-${newSkin}`;
    }
  };

  if (spinBtn) {
    spinBtn.addEventListener("click", () => startBottleSpin());
  }
}


// Date Night Spinner (Long Distance Edition)
