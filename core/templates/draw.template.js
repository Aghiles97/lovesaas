/**
 * /core/templates/draw.template.js
 * Template for Draw for Two 💕 (Synchronized Couple Drawing Studio)
 * Showcase card with launcher triggers + Photobooth-style Fullscreen Focus Modal
 */
(function() {
  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])));

  const renderTemplate = (data = {}, rootData = {}) => {
    const d = (data && typeof data === "object") ? data : {};
    const p1 = d.partner1 || rootData.partner1 || "Alex";
    const p2 = d.partner2 || rootData.partner2 || "Sam";
    const tag = d.tag || "Draw for Two · Studio";
    const title = d.title || "Draw for Two";
    const desc = d.desc || "Synchronized couple drawing studio — sketch prompts together across the distance.";

    const formattedTag = tag.startsWith("💕") ? tag : ("💕 " + tag);

    return `
    <section class="section draw-section" id="section-draw" data-widget-id="draw">
      <div class="container">
        <!-- In-Page Widget Card (Matching Screenshot /draw Lobby Design) -->
        <div class="draw-widget-wrapper">
          <div class="draw-lobby-card photobooth-style" id="drawWidgetLobbyCard">
            <div class="ldr-welcome-pill"><span>${esc(formattedTag)}</span></div>
            <h2 class="ldr-welcome-title">${esc(title)}</h2>
            <p class="ldr-welcome-sub">${esc(desc)}</p>

            <div class="ldr-welcome-choices" id="widgetWelcomeChoices">
              <button type="button" class="ldr-menu-card ldr-card-dark" id="btnLaunchDrawStartRoom">
                <div class="ldr-card-left">
                  <span class="ldr-card-icon">🎨</span>
                  <div class="ldr-card-texts">
                    <span class="ldr-card-title">Start a room</span>
                    <span class="ldr-card-sub">with your partner</span>
                  </div>
                </div>
                <span class="ldr-card-arrow">→</span>
              </button>

              <button type="button" class="ldr-menu-card ldr-card-light" id="btnLaunchDrawJoinRoom">
                <div class="ldr-card-left">
                  <span class="ldr-card-icon">💌</span>
                  <div class="ldr-card-texts">
                    <span class="ldr-card-title">Join a room</span>
                    <span class="ldr-card-sub">with a code</span>
                  </div>
                </div>
                <span class="ldr-card-arrow">→</span>
              </button>

              <div class="ldr-inline-join-form" id="widgetInlineJoinForm" style="display: none;">
                <div class="ldr-join-input-group">
                  <input type="text" id="widgetInputJoinCode" class="ldr-join-input" placeholder="5-LETTER CODE" maxlength="6" autocomplete="off" spellcheck="false" />
                  <button type="button" class="draw-btn-primary draw-btn-sm" id="btnWidgetJoinSubmit"><span>Join ▷</span></button>
                </div>
              </div>

              <div class="ldr-sub-actions-row">
                <button type="button" class="ldr-pill-btn" id="btnLaunchDrawSolo">
                  <span>🎨 Solo Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Synchronized Fullscreen Focus Modal Flow (Photobooth Parity) -->
        <div class="draw-game-modal" id="drawGameModal" style="display:none;" role="dialog" aria-modal="true" aria-label="Draw for Two Studio">
          <div class="draw-game-modal-dialog">
            <!-- Modal Header Bar -->
            <div class="draw-modal-topbar">
              <div class="draw-topbar-left">
                <span class="draw-pulse-dot" style="background:#4ade80;"></span>
                <span class="draw-topbar-title">Draw for Two 💕</span>
              </div>
              <div class="draw-topbar-right">
                <button type="button" class="draw-modal-close-btn" id="btnCloseDrawModal" aria-label="Close Drawing Game">
                  <span>✕ Close</span>
                </button>
              </div>
            </div>

            <!-- Modal Content Body containing the full game -->
            <div class="draw-modal-body">
              <div class="draw-app">
                <!-- Toast Notification -->
                <div id="drawToast" class="draw-toast" role="status" aria-live="polite"></div>

                <!-- Stage 0: Welcome & Room Connect -->
                <div id="stageLobby" class="draw-stage active">
                  <div class="draw-lobby-card photobooth-style">
                    <div class="ldr-welcome-pill"><span>💕 Draw for Two · Studio</span></div>
                    <h1 class="ldr-welcome-title">Draw for Two</h1>
                    <p class="ldr-welcome-sub">Synchronized couple drawing studio — sketch prompts together across the distance.</p>

                    <div class="ldr-welcome-choices" id="lobbyInitialView">
                      <button type="button" class="ldr-menu-card ldr-card-dark" id="btnStartRoom">
                        <div class="ldr-card-left">
                          <span class="ldr-card-icon">🎨</span>
                          <div class="ldr-card-texts">
                            <span class="ldr-card-title">Start a room</span>
                            <span class="ldr-card-sub">with your partner</span>
                          </div>
                        </div>
                        <span class="ldr-card-arrow">→</span>
                      </button>

                      <button type="button" class="ldr-menu-card ldr-card-light" id="btnShowJoinForm">
                        <div class="ldr-card-left">
                          <span class="ldr-card-icon">💌</span>
                          <div class="ldr-card-texts">
                            <span class="ldr-card-title">Join a room</span>
                            <span class="ldr-card-sub">with a code</span>
                          </div>
                        </div>
                        <span class="ldr-card-arrow">→</span>
                      </button>

                      <div class="ldr-inline-join-form" id="lobbyInlineJoinForm" style="display: none;">
                        <div class="ldr-join-input-group">
                          <input type="text" id="inputJoinCode" class="ldr-join-input" placeholder="5-LETTER CODE" maxlength="6" autocomplete="off" spellcheck="false" />
                          <button type="button" class="draw-btn-primary draw-btn-sm" id="btnJoinRoomSubmit"><span>Join ▷</span></button>
                        </div>
                      </div>

                      <div class="ldr-sub-actions-row">
                        <button type="button" class="ldr-pill-btn" id="btnPracticeSolo">
                          <span>🎨 Solo Studio</span>
                        </button>
                      </div>

                      <div style="margin-top: 6px;">
                        <a href="/" class="ldr-text-back-btn" id="btnBackToWebsite">← Back to Website</a>
                      </div>
                    </div>

                    <div id="lobbyWaitingView" style="display: none;">
                      <div class="draw-input-label" style="color: rgba(255, 255, 255, 0.7); margin-bottom: 12px;">Share This Code With Your Partner</div>
                      <div class="draw-code-pill-row">
                        <span id="displayRoomCode" class="draw-code-box">-----</span>
                      </div>

                      <button type="button" id="btnCopyInvite" class="draw-btn-primary" style="width: 100%; height: 48px; margin-bottom: 14px;">
                        <span>🔗 Copy Invite Link ▷</span>
                      </button>

                      <div class="draw-waiting-badge">
                        <span class="draw-pulse-dot"></span>
                        <span id="waitingStatusText">Waiting for your partner to join...</span>
                      </div>

                      <div style="margin-top: 18px;">
                        <button type="button" id="btnWaitingSkipToSolo" class="draw-link-subtle" style="color: rgba(255, 255, 255, 0.7);">Start alone while waiting →</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Stage 0.5: Profile Setup -->
                <div id="stageProfile" class="draw-stage">
                  <div class="draw-lobby-card photobooth-style">
                    <div class="ldr-welcome-pill"><span>💕 Connected</span></div>
                    <h2 class="draw-lobby-title" style="color: #ffffff;">Who's Drawing?</h2>
                    <p class="draw-lobby-desc" style="color: rgba(255, 255, 255, 0.72);">Enter your nickname and select your gender to customize your drawing pad.</p>

                    <div class="draw-input-group">
                      <label class="draw-input-label" for="profileNameInput" style="color: rgba(255, 255, 255, 0.7);">Your Name</label>
                      <input type="text" id="profileNameInput" class="draw-input-text dark-style" placeholder="Enter your name..." maxlength="20" autocomplete="off" value="${esc(p1)}" />
                    </div>

                    <div class="draw-config-group" style="margin-bottom: 22px;">
                      <div class="draw-input-label" style="margin-bottom: 10px; color: rgba(255, 255, 255, 0.75);">Select Your Pad Theme</div>
                      <div class="draw-sex-selector" id="profileSexSelector">
                        <button type="button" class="draw-sex-btn cute-female" data-sex="female">
                          <span class="draw-sex-icon">♀</span>
                          <span class="draw-sex-name">Female</span>
                        </button>
                        <button type="button" class="draw-sex-btn cute-male" data-sex="male">
                          <span class="draw-sex-icon">♂</span>
                          <span class="draw-sex-name">Male</span>
                        </button>
                      </div>
                    </div>

                    <div id="profilePartnerStatus" class="draw-partner-ready-banner" style="display: none;">
                      <span class="draw-pulse-dot" style="background: #4ade80;"></span>
                      <span id="profilePartnerStatusText">Partner is ready! ✓</span>
                    </div>

                    <button type="button" id="btnProfileReady" class="draw-btn-primary" style="width: 100%; height: 48px; margin-top: 4px;">
                      <span>Ready ▷</span>
                    </button>

                    <div class="draw-waiting-badge" id="profileWaitingWrap" style="display: none; justify-content: center;">
                      <span class="draw-pulse-dot"></span>
                      <span id="profileWaitingText">Waiting for partner to finish profile...</span>
                    </div>

                    <div style="margin-top: 14px; text-align: center;">
                      <button type="button" class="ldr-text-back-btn btn-exit-setup" style="background: none; border: none; cursor: pointer; color: rgba(255, 255, 255, 0.72);">← Exit to Menu</button>
                    </div>
                  </div>
                </div>

                <!-- Stage 1: PICK A PROMPT PACK -->
                <div id="stagePackSelect" class="draw-stage">
                  <div class="draw-packs-container">
                    <h2 class="draw-screen-title">PICK A PROMPT PACK</h2>

                    <div class="draw-packs-grid" id="packsGrid">
                      <div class="draw-pack-card" data-pack="animals">
                        <div class="draw-pack-icon-wrap">🐾</div>
                        <div class="draw-pack-name">Animals</div>
                        <div class="draw-pack-desc">Cute critters, big and small.</div>
                        <div class="draw-pack-meta">16 prompts</div>
                      </div>

                      <div class="draw-pack-card" data-pack="food">
                        <div class="draw-pack-icon-wrap">🍜</div>
                        <div class="draw-pack-name">Food & Snacks</div>
                        <div class="draw-pack-desc">Everything you two crave.</div>
                        <div class="draw-pack-meta">12 prompts</div>
                      </div>

                      <div class="draw-pack-card" data-pack="random">
                        <div class="draw-pack-icon-wrap">🎲</div>
                        <div class="draw-pack-name">Random Doodles</div>
                        <div class="draw-pack-desc">Anything goes — go wild.</div>
                        <div class="draw-pack-meta">12 prompts</div>
                      </div>

                      <div class="draw-pack-card selected" data-pack="memories">
                        <div class="draw-pack-icon-wrap">💖</div>
                        <div class="draw-pack-name">Our Memories</div>
                        <div class="draw-pack-desc">Sweet stuff, just about us.</div>
                        <div class="draw-pack-meta">11 prompts</div>
                      </div>

                      <div class="draw-pack-card" data-pack="draw_me">
                        <div class="draw-pack-icon-wrap">💌</div>
                        <div class="draw-pack-name">Draw Me</div>
                        <div class="draw-pack-desc">Each other, lovingly butchered.</div>
                        <div class="draw-pack-meta">10 prompts</div>
                      </div>

                      <div class="draw-pack-card" data-pack="silly">
                        <div class="draw-pack-icon-wrap">🤪</div>
                        <div class="draw-pack-name">Silly & Weird</div>
                        <div class="draw-pack-desc">Low stakes, maximum chaos.</div>
                        <div class="draw-pack-meta">10 prompts</div>
                      </div>
                    </div>

                    <button type="button" id="btnPackNext" class="draw-btn-next">
                      <span>Next ▷</span>
                    </button>

                    <div style="margin-top: 14px; text-align: center;">
                      <button type="button" class="ldr-text-back-btn btn-exit-setup" style="background: none; border: none; cursor: pointer;">← Exit to Menu</button>
                    </div>
                  </div>
                </div>

                <!-- Stage 2: SET THE MATCH -->
                <div id="stageMatchSetup" class="draw-stage">
                  <div class="draw-match-config-wrap">
                    <h2 class="draw-screen-title">SET THE MATCH</h2>

                    <div class="draw-config-group">
                      <div class="draw-config-label">ROUNDS</div>
                      <div class="draw-pills-row" id="roundsSelector">
                        <button type="button" class="draw-pill-btn selected" data-rounds="3">3</button>
                        <button type="button" class="draw-pill-btn" data-rounds="4">4</button>
                        <button type="button" class="draw-pill-btn" data-rounds="5">5</button>
                        <button type="button" class="draw-pill-btn" data-rounds="7">7</button>
                      </div>
                    </div>

                    <div class="draw-config-group">
                      <div class="draw-config-label">SECONDS PER DRAWING</div>
                      <div class="draw-pills-row" id="secondsSelector">
                        <button type="button" class="draw-pill-btn" data-seconds="20">20s</button>
                        <button type="button" class="draw-pill-btn" data-seconds="60">60s</button>
                        <button type="button" class="draw-pill-btn" data-seconds="90">90s</button>
                        <button type="button" class="draw-pill-btn selected" data-seconds="120">120s</button>
                        <button type="button" class="draw-pill-btn" data-seconds="180">180s</button>
                      </div>
                    </div>

                    <button type="button" id="btnStartDrawing" class="draw-btn-start">
                      <span>Start Drawing ▷</span>
                    </button>

                    <div style="margin-top: 14px; text-align: center;">
                      <button type="button" class="ldr-text-back-btn btn-exit-setup" style="background: none; border: none; cursor: pointer;">← Exit to Menu</button>
                    </div>
                  </div>
                </div>

                <!-- Stage 3: REALTIME DRAWING ARENA -->
                <div id="stageDrawing" class="draw-stage">
                  <div class="draw-arena-wrap">
                    <header class="draw-arena-header">
                      <div class="draw-round-col">
                        <span class="draw-round-ratio"><span id="displayRoundNum">1</span>/<span id="displayRoundTotal">3</span></span>
                      </div>
                      <div class="draw-prompt-title">
                        <span id="displayPrompt">the last time we laughed really hard</span>
                      </div>
                      <div class="draw-timer-wrap">
                        <div class="draw-timer-box" id="displayTimer">2:00</div>
                      </div>
                    </header>

                    <div class="draw-canvases-grid view-split" id="canvasesContainer">
                      <div class="draw-pad-card" id="myPadCard">
                        <div class="draw-pad-badge pink" id="myPadBadge">${esc(p1)}</div>
                        <canvas id="myCanvas" class="draw-canvas"></canvas>
                        <div class="draw-poke-layer" id="myPokeLayer"></div>
                      </div>

                      <div class="draw-pad-card draw-pad-partner" id="partnerPadCard" title="Tap their pad to poke!">
                        <div class="draw-pad-badge blue" id="partnerPadBadge">${esc(p2)}</div>
                        <canvas id="partnerCanvas" class="draw-canvas"></canvas>
                        <div class="draw-poke-layer" id="partnerPokeLayer"></div>
                        <div class="partner-pad-tap-hint">Tap here to poke! 👉</div>
                      </div>
                    </div>

                    <div class="draw-toolbar-wrap">
                      <div class="draw-bottom-start-wrap" id="bottomStartWrap">
                        <button type="button" id="btnStartRoundTimer" class="draw-btn-start-bottom" title="Start round countdown">
                          <span>Start Drawing ▷</span>
                        </button>
                      </div>

                      <div class="draw-tools-row">
                        <div class="draw-palette" id="colorPalette">
                          <button type="button" class="draw-color-swatch" data-color="#f7789e" style="background-color: #f7789e;" title="Pink"></button>
                          <button type="button" class="draw-color-swatch selected" data-color="#5fa0ff" style="background-color: #5fa0ff;" title="Blue"></button>
                          <button type="button" class="draw-color-swatch" data-color="#18181b" style="background-color: #18181b;" title="Black"></button>
                          <button type="button" class="draw-color-swatch" data-color="#fca654" style="background-color: #fca654;" title="Orange"></button>
                          <button type="button" class="draw-color-swatch" data-color="#28c76f" style="background-color: #28c76f;" title="Green"></button>
                          <button type="button" class="draw-color-swatch" data-color="#9b5de5" style="background-color: #9b5de5;" title="Purple"></button>
                          <button type="button" class="draw-color-swatch" data-color="#ffd23f" style="background-color: #ffd23f;" title="Yellow"></button>
                          <button type="button" class="draw-color-swatch" data-color="#fd6161" style="background-color: #fd6161;" title="Red"></button>
                        </div>

                        <button type="button" id="btnToolEraser" class="draw-tool-icon-btn" title="Eraser">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path>
                            <path d="M22 21H7"></path>
                            <path d="m5 11 9 9"></path>
                          </svg>
                        </button>

                        <div class="draw-sizes" id="brushSizes">
                          <button type="button" class="draw-size-btn" data-size="2" title="Fine">
                            <span class="draw-size-dot" style="width: 2px; height: 2px;"></span>
                          </button>
                          <button type="button" class="draw-size-btn selected" data-size="5" title="Medium">
                            <span class="draw-size-dot" style="width: 5px; height: 5px;"></span>
                          </button>
                          <button type="button" class="draw-size-btn" data-size="9" title="Thick">
                            <span class="draw-size-dot" style="width: 9px; height: 9px;"></span>
                          </button>
                          <button type="button" class="draw-size-btn" data-size="15" title="Extra Thick">
                            <span class="draw-size-dot" style="width: 14px; height: 14px;"></span>
                          </button>
                        </div>

                        <div class="draw-history-btns">
                          <button type="button" id="btnToolUndo" class="draw-tool-icon-btn" title="Undo">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M3 7v6h6"></path>
                              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                            </svg>
                          </button>
                          <button type="button" id="btnToolRedo" class="draw-tool-icon-btn" title="Redo">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M21 7v6h-6"></path>
                              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
                            </svg>
                          </button>
                        </div>

                        <button type="button" id="btnClearCanvas" class="draw-btn-clear">Clear</button>
                      </div>

                      <div class="draw-poke-bar">
                        <span class="draw-poke-label">POKE →</span>
                        <div class="draw-poke-emojis" id="pokeButtons">
                          <button type="button" class="draw-poke-btn selected" data-emoji="👉" title="Poke">👉</button>
                          <button type="button" class="draw-poke-btn" data-emoji="💖" title="Heart">💖</button>
                          <button type="button" class="draw-poke-btn" data-emoji="😂" title="Laugh">😂</button>
                          <button type="button" class="draw-poke-btn" data-emoji="🌀" title="Dizzy">🌀</button>
                          <button type="button" class="draw-poke-btn" data-emoji="💥" title="Boom">💥</button>
                          <button type="button" class="draw-poke-btn" data-emoji="⭐" title="Star">⭐</button>
                        </div>
                      </div>

                      <div class="draw-poke-subtitle">
                        <span>draw! ✏️ — tap their pad to poke</span>
                      </div>
                    </div>

                    <div class="draw-exit-bottom-wrap">
                      <button type="button" id="btnExitDrawing" class="draw-btn-bottom-exit" title="Exit to Menu">✕ Exit to Menu</button>
                    </div>
                  </div>
                </div>

                <!-- Stage 4: ROUND REVIEW -->
                <div id="stageRoundReview" class="draw-stage">
                  <div class="draw-review-wrap">
                    <h2 class="draw-review-title">Round Complete!</h2>
                    <div class="draw-review-prompt" id="reviewPromptText">the last time we laughed really hard</div>

                    <div class="draw-review-grid">
                      <div class="draw-review-card">
                        <div class="draw-review-card-header">
                          <span class="draw-review-drawer-name" id="reviewMyName">${esc(p1)}</span>
                        </div>
                        <div class="draw-review-canvas-box">
                          <img id="reviewMyImg" alt="Your drawing" />
                        </div>
                      </div>

                      <div class="draw-review-card" id="reviewPartnerCard">
                        <div class="draw-review-card-header">
                          <span class="draw-review-drawer-name" id="reviewPartnerName">${esc(p2)}</span>
                        </div>
                        <div class="draw-review-canvas-box">
                          <img id="reviewPartnerImg" alt="Partner's drawing" />
                        </div>
                      </div>
                    </div>

                    <div class="draw-review-actions">
                      <button type="button" id="btnNextRound" class="draw-btn-start">
                        <span>Next Round ▷</span>
                      </button>
                      <button type="button" id="btnReviewExit" class="draw-btn-secondary" style="margin-left: 8px;">
                        <span>✕ Exit</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Stage 5: MATCH COMPLETE / KEEPSAKE RECAP -->
                <div id="stageMatchComplete" class="draw-stage">
                  <div class="draw-review-wrap">
                    <div class="draw-brand-badge"><span>🏆 Match Finished</span></div>
                    <h2 class="draw-review-title">Our Drawing Keepsake</h2>
                    <div class="draw-review-prompt">Look at all the masterpieces created!</div>

                    <div class="draw-recap-gallery" id="recapGallery">
                    </div>

                    <div class="draw-review-actions">
                      <button type="button" id="btnDownloadKeepsake" class="draw-btn-start">
                        <span>Save Artwork ▷</span>
                      </button>
                      <button type="button" id="btnPlayAgain" class="draw-btn-next">
                        <span>Play Again ▷</span>
                      </button>
                    </div>

                    <div class="draw-exit-bottom-wrap" style="text-align: center; margin-top: 14px;">
                      <button type="button" id="btnExitComplete" class="draw-btn-bottom-exit" title="Exit to Menu">✕ Exit to Menu</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Play Again Modal for Partner Confirmation -->
              <div id="modalPlayAgain" class="draw-modal-overlay hidden" role="dialog" aria-modal="true">
                <div class="draw-modal-card">
                  <div style="font-size: 38px;">🎨</div>
                  <h3 id="modalPlayAgainTitle" style="font-size: 20px; font-weight: 700; color: #18181b; margin: 0;">Play Again?</h3>
                  <p id="modalPlayAgainText" style="font-size: 15px; color: #52525b; margin: 0; line-height: 1.4;">
                    Your partner wants to play again! Do you accept?
                  </p>
                  <div id="modalPlayAgainPromptActions" class="draw-modal-actions">
                    <button type="button" id="btnAcceptPlayAgain" class="draw-btn-start">
                      <span>Accept 💕</span>
                    </button>
                    <button type="button" id="btnDeclinePlayAgain" class="draw-btn-secondary">
                      <span>Decline ✕</span>
                    </button>
                  </div>
                  <div id="modalPlayAgainWaiting" style="display: none; width: 100%;">
                    <button type="button" id="btnCancelPlayAgain" class="draw-btn-secondary" style="width: 100%;">
                      <span>Cancel Request</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Remote Partner Floating Cursor -->
              <div class="draw-remote-cursor pink" id="drawRemoteCursor" style="display:none;" aria-hidden="true">
                <div class="remote-cursor-pointer">
                  <svg class="remote-cursor-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2L9.5 21.5L13.5 13.5L21.5 9.5L2 2Z" fill="#ff2d55" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="remote-cursor-tag" id="remoteCursorTag">${esc(p2)}</div>
                <div class="remote-click-ripple" id="remoteClickRipple"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = renderTemplate;
  }
  if (typeof window !== "undefined") {
    window.WIDGET_TEMPLATES = window.WIDGET_TEMPLATES || {};
    window.WIDGET_TEMPLATES["draw"] = renderTemplate;
  }
})();
