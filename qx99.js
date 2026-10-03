/**
 * ALPHA TRADER — Browser Console Script
 * Login:
 * Name: ALPHA TRADER
 * Password: alpha99
 */

(function () {
  if (window.__ALPHA_TRADER_ACTIVE__) {
    console.warn("ALPHA TRADER already running.");
    return;
  }

  const PW_STORAGE_KEY = "alpha_trader_saved_password";

  function getSavedPassword() {
    try {
      return (
        localStorage.getItem(PW_STORAGE_KEY) ||
        sessionStorage.getItem(PW_STORAGE_KEY) ||
        ""
      );
    } catch {
      return "";
    }
  }

  function rememberPassword(pw) {
    try {
      localStorage.setItem(PW_STORAGE_KEY, pw);
    } catch {
      try {
        sessionStorage.setItem(PW_STORAGE_KEY, pw);
      } catch {
        /* ignore */
      }
    }
  }

  function showPasswordGate(onSuccess) {
    if (document.getElementById("alpha-trader-login-overlay")) return;

    const loginStyle = document.createElement("style");
    loginStyle.id = "alpha-trader-login-style";

    loginStyle.textContent = `
      #alpha-trader-login-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.72);
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      }

      #alpha-trader-login-box {
        width: min(320px, calc(100vw - 32px));
        padding: 22px 20px 18px;
        border-radius: 14px;
        background: linear-gradient(
          160deg,
          #0d1f14 0%,
          #0a0f0c 100%
        );
        border: 1px solid rgba(0, 255, 102, 0.4);
        box-shadow: 0 0 50px rgba(0, 255, 102, 0.2);
      }

      #alpha-trader-login-box h3 {
        margin: 0 0 6px;
        text-align: center;
        color: #00ff66;
        font-size: 18px;
        letter-spacing: 0.08em;
      }

      #alpha-trader-login-box p {
        margin: 0 0 14px;
        text-align: center;
        font-size: 12px;
        color: #9fd4ad;
      }

      #alpha-trader-login-input {
        box-sizing: border-box;
        width: 100%;
        padding: 11px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0, 255, 102, 0.35);
        background: rgba(0, 0, 0, 0.4);
        color: #fff;
        font-size: 15px;
        outline: none;
      }

      #alpha-trader-login-input:focus {
        border-color: #00ff66;
        box-shadow: 0 0 0 2px rgba(0, 255, 102, 0.2);
      }

      #alpha-trader-login-btn {
        width: 100%;
        margin-top: 12px;
        padding: 12px;
        border: none;
        border-radius: 8px;
        background: #00ff66;
        color: #052210;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
      }

      #alpha-trader-login-btn:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      #alpha-trader-login-err {
        min-height: 18px;
        margin-top: 8px;
        text-align: center;
        font-size: 12px;
        color: #ff6b6b;
        font-weight: 600;
      }
    `;

    document.head.appendChild(loginStyle);

    const overlay = document.createElement("div");
    overlay.id = "alpha-trader-login-overlay";

    overlay.innerHTML = `
      <div id="alpha-trader-login-box">
        <h3>ALPHA TRADER</h3>
        <p>Enter password to continue</p>

        <input
          id="alpha-trader-login-input"
          type="password"
          autocomplete="current-password"
        />

        <button
          type="button"
          id="alpha-trader-login-btn"
        >
          Enter
        </button>

        <p id="alpha-trader-login-err"></p>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector(
      "#alpha-trader-login-input"
    );

    const errEl = overlay.querySelector(
      "#alpha-trader-login-err"
    );

    const btn = overlay.querySelector(
      "#alpha-trader-login-btn"
    );

    input.value = getSavedPassword();

    async function tryLogin() {
      const pw = String(input.value || "");

      if (!pw) {
        errEl.textContent = "Enter password";
        return;
      }

      errEl.textContent = "Checking...";
      btn.disabled = true;

      try {
        /*
         * ALPHA TRADER password
         */
        const valid = pw === "alpha99";

        if (valid) {
          rememberPassword(pw);

          overlay.remove();
          loginStyle.remove();

          onSuccess();
          return;
        }

        errEl.textContent = "Wrong password.";
        input.focus();
        input.select();

      } catch {
        errEl.textContent = "Error. Try again.";
      } finally {
        btn.disabled = false;
      }
    }

    btn.addEventListener("click", tryLogin);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryLogin();
      }
    });

    setTimeout(() => input.focus(), 50);

    if (input.value) {
      setTimeout(() => input.select(), 60);
    }
  }

  function initAlphaTrader() {
    window.__ALPHA_TRADER_ACTIVE__ = true;

    const LABEL = "ALPHA TRADER";
    const STORAGE_KEY = "alpha_trader_settings_v1";

    const TAP_REQUIRED = 3;
    const TAP_SETTLE_MS = 380;
    const TAP_SEQUENCE_MS = 650;

    const defaults = {
      delaySec: 10,
      afterTradeScanSec: 0,
      direction: "random"
    };

    function parseStored(raw) {
      if (!raw) return null;

      const s = JSON.parse(raw);

      const delaySec = Math.max(
        1,
        Math.min(
          120,
          Number(s.delaySec) || defaults.delaySec
        )
      );

      const afterTradeScanSec = Math.max(
        0,
        Math.min(
          300,
          Math.round(
            Number(s.afterTradeScanSec) || 0
          )
        )
      );

      const direction =
        ["up", "down", "random"].includes(s.direction)
          ? s.direction
          : defaults.direction;

      return {
        delaySec,
        afterTradeScanSec,
        direction
      };
    }

    function loadSettings() {
      const sources = [
        () => localStorage.getItem(STORAGE_KEY),
        () => sessionStorage.getItem(STORAGE_KEY),
        () => {
          const b =
            window.__ALPHA_TRADER_SETTINGS_BACKUP__;

          return b
            ? JSON.stringify(b)
            : null;
        }
      ];

      for (const get of sources) {
        try {
          const parsed = parseStored(get());

          if (parsed) return parsed;
        } catch {
          /* try next */
        }
      }

      return {
        ...defaults
      };
    }

    function saveSettings(s) {
      const json = JSON.stringify(s);

      window.__ALPHA_TRADER_SETTINGS_BACKUP__ = {
        ...s
      };

      let ok = false;

      try {
        localStorage.setItem(
          STORAGE_KEY,
          json
        );

        ok = true;
      } catch {
        /* blocked */
      }

      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          json
        );

        ok = true;
      } catch {
        /* blocked */
      }

      return ok;
    }

    let settings = loadSettings();

    console.log(
      "ALPHA TRADER initialized."
    );

    console.log(
      "Login: ALPHA TRADER"
    );

    console.log(
      "Settings loaded:",
      settings
    );

    // Continue with the UI/trading controls...
  }

  initAlphaTrader();

})();
    const style = document.createElement("style");

    style.textContent = `
      #alpha-trader-widget {
        position: fixed;
        z-index: 2147483646;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: grab;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        filter: drop-shadow(
          0 2px 8px rgba(0,0,0,0.45)
        );
        transition: filter 0.25s ease;
      }

      #alpha-trader-widget.alpha-glow {
        filter:
          drop-shadow(0 0 12px #00ff66)
          drop-shadow(0 0 28px #00ff66)
          drop-shadow(
            0 0 48px rgba(0,255,102,0.55)
          );
      }

      #alpha-trader-widget:active {
        cursor: grabbing;
      }

      #alpha-trader-logo {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        overflow: hidden;
        background: rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        border: 2px solid rgba(0,255,102,0.4);
      }

      #alpha-trader-logo span {
        font-family: system-ui,
          -apple-system,
          Segoe UI,
          Roboto,
          sans-serif;
        font-size: 12px;
        font-weight: 800;
        color: #00ff66;
        text-align: center;
        line-height: 1.1;
      }

      #alpha-trader-label {
        font-family: system-ui,
          -apple-system,
          Segoe UI,
          Roboto,
          sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #fff;
        text-shadow:
          0 1px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        text-align: center;
      }

      #alpha-trader-widget.alpha-glow
      #alpha-trader-label {
        color: #b8ffd4;
        text-shadow:
          0 0 8px #00ff66,
          0 0 18px #00ff66,
          0 0 32px rgba(0,255,102,0.8);
      }

      #alpha-trader-scan-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483645;
        pointer-events: none;
        overflow: hidden;
        display: none;
      }

      #alpha-trader-scan-overlay.scan-on {
        display: block;
      }

      #alpha-trader-scan-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 5px;

        background: linear-gradient(
          180deg,
          #3ad67f 0%,
          #22c464 16%,
          #14ad56 40%,
          #009e4a 58%,
          #008a40 82%,
          rgba(0,110,48,0.55) 100%
        );

        box-shadow:
          0 -88px 130px rgba(0,220,115,1),
          0 -68px 100px rgba(0,200,100,1),
          0 -50px 78px rgba(0,185,92,0.98),
          0 -34px 58px rgba(0,170,85,0.96),
          0 -22px 40px rgba(0,155,78,0.94),
          0 -12px 26px rgba(0,140,72,0.9),
          0 -6px 14px rgba(0,125,65,0.88),
          0 0 28px rgba(0,150,75,0.85),
          0 0 55px rgba(0,130,65,0.55);

        top: -8%;
        animation:
          alpha-trader-scan-move
          1.45s linear infinite;
      }

      @keyframes alpha-trader-scan-move {
        0% {
          top: -8%;
        }

        100% {
          top: 108%;
        }
      }

      #alpha-trader-panel {
        position: fixed;
        z-index: 2147483647;
        left: 50%;
        top: 50%;
        transform:
          translate(-50%, -50%);
        opacity: 0;
        pointer-events: none;

        width: min(
          300px,
          calc(100vw - 32px)
        );

        padding: 18px 16px 14px;

        border-radius: 14px;

        background:
          linear-gradient(
            160deg,
            #0d1f14 0%,
            #0a0f0c 100%
          );

        border:
          1px solid rgba(
            0,255,102,0.35
          );

        box-shadow:
          0 0 40px
            rgba(0,255,102,0.25),
          0 12px 40px
            rgba(0,0,0,0.55);

        font-family:
          system-ui,
          -apple-system,
          Segoe UI,
          Roboto,
          sans-serif;

        color: #e8ffe8;
      }

      #alpha-trader-panel.panel-open {
        opacity: 1;
        pointer-events: auto;
      }

      #alpha-trader-panel h3 {
        margin: 0 0 14px;
        font-size: 16px;
        font-weight: 700;
        text-align: center;
        color: #00ff66;
        letter-spacing: 0.06em;
      }

      #alpha-trader-panel .row {
        margin-bottom: 14px;
      }

      #alpha-trader-panel label {
        display: block;
        font-size: 12px;
        color: #9fd4ad;
        margin-bottom: 6px;
      }

      #alpha-trader-panel .subhint {
        margin: -2px 0 6px;
        font-size: 10px;
        color: #6a9a78;
        line-height: 1.3;
      }

      #alpha-trader-panel input {
        box-sizing: border-box;
        display: block;
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;

        border:
          1px solid
          rgba(0,255,102,0.3);

        background:
          rgba(0,0,0,0.35);

        color: #fff;
        font-size: 15px;
        outline: none;

        -webkit-appearance: none;
        appearance: none;
      }

      #alpha-trader-panel input:focus {
        border-color: #00ff66;

        box-shadow:
          0 0 0 2px
          rgba(0,255,102,0.2);
      }

      #alpha-trader-panel input::-webkit-outer-spin-button,
      #alpha-trader-panel input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      #alpha-trader-panel .save-btn {
        display: block;
        width: 100%;
        margin-top: 4px;
        padding: 12px 14px;

        border: none;
        border-radius: 8px;

        background: #00ff66;
        color: #052210;

        font-weight: 700;
        font-size: 14px;
        font-family: inherit;

        cursor: pointer;
      }

      #alpha-trader-panel .save-btn:active {
        background: #00e65c;
      }

      #alpha-trader-dir-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      #alpha-trader-dir-group button {
        padding: 11px 12px;
        border-radius: 8px;

        border:
          1px solid
          rgba(0,255,102,0.25);

        background:
          rgba(0,0,0,0.3);

        color: #dfffe8;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;

        transition:
          background 0.15s,
          border-color 0.15s,
          box-shadow 0.15s;
      }

      #alpha-trader-dir-group
      button.active {
        background:
          rgba(0,255,102,0.18);

        border-color: #00ff66;

        box-shadow:
          0 0 16px
          rgba(0,255,102,0.35);

        color: #00ff66;
      }

      #alpha-trader-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483646;

        background:
          rgba(0,0,0,0.5);

        opacity: 0;
        pointer-events: none;
      }

      #alpha-trader-backdrop.open {
        opacity: 1;
        pointer-events: auto;
      }

      #alpha-trader-save-status {
        min-height: 18px;
        margin: 8px 0 0;
        font-size: 12px;
        text-align: center;
        color: #00ff66;
        font-weight: 600;
      }

      #alpha-trader-panel-hint {
        margin: 10px 0 0;
        font-size: 11px;
        text-align: center;
        color: #6a9a78;
        line-height: 1.35;
      }

      #alpha-trader-panel button,
      #alpha-trader-panel input {
        touch-action: manipulation;
      }
    `;

    document.head.appendChild(style);


    /* Scan overlay */

    const scanOverlay =
      document.createElement("div");

    scanOverlay.id =
      "alpha-trader-scan-overlay";

    scanOverlay.innerHTML =
      '<div id="alpha-trader-scan-line"></div>';

    document.body.appendChild(
      scanOverlay
    );


    /* Backdrop */

    const backdrop =
      document.createElement("div");

    backdrop.id =
      "alpha-trader-backdrop";

    document.body.appendChild(
      backdrop
    );


    /* Settings panel */

    const panel =
      document.createElement("div");

    panel.id =
      "alpha-trader-panel";

    panel.innerHTML = `
      <h3>ALPHA TRADER SETTINGS</h3>

      <div class="row">
        <label>
          Scan delay (seconds)
        </label>

        <input
          id="alpha-trader-delay"
          type="number"
          min="1"
          max="120"
          step="1"
        />
      </div>

      <div class="row">
        <label>
          After trade scan (seconds)
        </label>

        <p class="subhint">
          0 = stop only when you tap
          the icon
        </p>

        <input
          id="alpha-trader-after"
          type="number"
          min="0"
          max="300"
          step="1"
        />
      </div>

      <div class="row">
        <label>
          Trade direction
        </label>

        <div id="alpha-trader-dir-group">

          <button
            type="button"
            data-dir="up"
          >
            Up
          </button>

          <button
            type="button"
            data-dir="down"
          >
            Down
          </button>

          <button
            type="button"
            data-dir="random"
          >
            Random
          </button>

        </div>
      </div>

      <button
        type="button"
        id="alpha-trader-save"
        class="save-btn"
      >
        Save
      </button>

      <p id="alpha-trader-save-status"></p>

      <p id="alpha-trader-panel-hint">
        3 taps on icon to open ·
        tap outside to close
      </p>
    `;

    document.body.appendChild(
      panel
    );


    const delayInput =
      panel.querySelector(
        "#alpha-trader-delay"
      );

    const afterTradeInput =
      panel.querySelector(
        "#alpha-trader-after"
      );

    const saveStatus =
      panel.querySelector(
        "#alpha-trader-save-status"
      );

    const dirButtons =
      panel.querySelectorAll(
        "#alpha-trader-dir-group button"
      );


    let saveStatusTimer = null;

    let pendingDirection =
      settings.direction;


    function syncDirectionUI(dir) {
      dirButtons.forEach((btn) => {
        btn.classList.toggle(
          "active",
          btn.dataset.dir === dir
        );
      });
    }


    function syncPanelUI() {
      delayInput.value =
        String(settings.delaySec);

      afterTradeInput.value =
        String(
          settings.afterTradeScanSec
        );

      pendingDirection =
        settings.direction;

      syncDirectionUI(
        pendingDirection
      );
    }


    function openPanel() {
      syncPanelUI();

      backdrop.classList.add(
        "open"
      );

      panel.classList.add(
        "panel-open"
      );
    }


    function closePanel() {
      backdrop.classList.remove(
        "open"
      );

      panel.classList.remove(
        "panel-open"
      );

      saveStatus.textContent = "";
    }


    function showSaveStatus(
      msg,
      isError
    ) {
      saveStatus.textContent = msg;

      saveStatus.style.color =
        isError
          ? "#ff6b6b"
          : "#00ff66";

      if (saveStatusTimer) {
        clearTimeout(
          saveStatusTimer
        );
      }

      saveStatusTimer =
        setTimeout(() => {
          saveStatus.textContent = "";
        }, 2500);
    }


    function parseDelayInput() {
      const n = Number(
        String(
          delayInput.value
        ).trim()
      );

      if (
        !Number.isFinite(n) ||
        n < 1
      ) {
        return defaults.delaySec;
      }

      return Math.max(
        1,
        Math.min(
          120,
          Math.round(n)
        )
      );
    }


    function parseAfterTradeInput() {
      const n = Number(
        String(
          afterTradeInput.value
        ).trim()
      );

      if (
        !Number.isFinite(n) ||
        n < 0
      ) {
        return defaults.afterTradeScanSec;
      }

      return Math.max(
        0,
        Math.min(
          300,
          Math.round(n)
        )
      );
    }


    function applyAllSettings() {
      settings.delaySec =
        parseDelayInput();

      settings.afterTradeScanSec =
        parseAfterTradeInput();

      settings.direction =
        pendingDirection;

      delayInput.value =
        String(settings.delaySec);

      afterTradeInput.value =
        String(
          settings.afterTradeScanSec
        );

      const stored =
        saveSettings(settings);

      syncPanelUI();

      closePanel();

      console.log(
        "ALPHA TRADER settings saved | delay:",
        settings.delaySec + "s",
        "| after-trade:",
        settings.afterTradeScanSec === 0
          ? "manual"
          : settings.afterTradeScanSec + "s",
        "| dir:",
        settings.direction,
        stored
          ? ""
          : "(storage blocked)"
      );
    }


    function bindPanelAction(
      el,
      handler
    ) {
      let lock = false;

      const run = (e) => {
        if (e.cancelable) {
          e.preventDefault();
        }

        e.stopPropagation();

        if (lock) return;

        lock = true;

        setTimeout(() => {
          lock = false;
        }, 300);

        handler();
      };

      el.addEventListener(
        "pointerup",
        run
      );

      el.addEventListener(
        "click",
        run
      );
    }


    bindPanelAction(
      panel.querySelector(
        "#alpha-trader-save"
      ),
      applyAllSettings
    );


    function onSettingsEnter(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        applyAllSettings();
      }
    }


    delayInput.addEventListener(
      "keydown",
      onSettingsEnter
    );

    afterTradeInput.addEventListener(
      "keydown",
      onSettingsEnter
    );


    dirButtons.forEach((btn) => {
      bindPanelAction(
        btn,
        () => {
          pendingDirection =
            btn.dataset.dir;

          syncDirectionUI(
            pendingDirection
          );
        }
      );
    });


    bindPanelAction(
      backdrop,
      closePanel
    );


    /* Floating ALPHA TRADER icon */

    const widget =
      document.createElement("div");

    widget.id =
      "alpha-trader-widget";

    widget.innerHTML = `
      <div id="alpha-trader-logo">
        <span>
          ALPHA<br>
          TRADER
        </span>
      </div>

      <span id="alpha-trader-label">
        ALPHA TRADER
      </span>
    `;

    document.body.appendChild(
      widget
    );


    let unlocked = false;
    let scanActive = false;

    let tradeTimer = null;
    let afterTradeTimer = null;

    let tapCount = 0;
    let tapSettleTimer = null;
    let lastTapAt = 0;


    function getTradeButtons() {
      const root =
        document.getElementById(
          "trade-button"
        );

      if (!root) {
        return {
          up: null,
          down: null
        };
      }

      return {
        up:
          root.querySelector(
            "button.JQZcs"
          ),

        down:
          root.querySelector(
            "button.twQq3"
          )
      };
    }


    function pickTradeButton() {
      const {
        up,
        down
      } = getTradeButtons();

      if (!up && !down) {
        return null;
      }

      if (
        settings.direction === "up"
      ) {
        return up || null;
      }

      if (
        settings.direction === "down"
      ) {
        return down || null;
      }

      const pool = [
        up,
        down
      ].filter(Boolean);

      return pool[
        Math.floor(
          Math.random() *
          pool.length
        )
      ];
    }
  /* ——— DEMO SIGNAL ENGINE ——— */

  function generateDemoDirection() {
    if (settings.direction === "up") {
      return "UP";
    }

    if (settings.direction === "down") {
      return "DOWN";
    }

    return Math.random() >= 0.5
      ? "UP"
      : "DOWN";
  }


  function showDemoSignal(side) {
    widget.classList.add("alpha-glow");

    const label =
      widget.querySelector("#alpha-trader-label");

    if (label) {
      label.textContent =
        "DEMO • " + side;
    }

    console.log(
      "ALPHA TRADER DEMO:",
      side,
      "| mode:",
      settings.direction
    );

    setTimeout(() => {
      if (!scanActive && label) {
        label.textContent = "ALPHA TRADER";
      }
    }, 3000);
  }


  function clearAfterTradeTimer() {
    if (afterTradeTimer) {
      clearTimeout(afterTradeTimer);
      afterTradeTimer = null;
    }
  }


  function scheduleAfterTradeScanStop() {
    clearAfterTradeTimer();

    if (
      !settings.afterTradeScanSec ||
      settings.afterTradeScanSec <= 0
    ) {
      return;
    }

    const ms =
      settings.afterTradeScanSec * 1000;

    afterTradeTimer =
      setTimeout(() => {
        afterTradeTimer = null;

        if (scanActive) {
          stopScanSession();

          console.log(
            "ALPHA TRADER: demo scan auto-stopped after " +
            settings.afterTradeScanSec +
            "s"
          );
        }
      }, ms);
  }


  function stopScanSession() {
    widget.classList.remove(
      "alpha-glow"
    );

    scanOverlay.classList.remove(
      "scan-on"
    );

    scanActive = false;

    if (tradeTimer) {
      clearTimeout(tradeTimer);
      tradeTimer = null;
    }

    clearAfterTradeTimer();

    const label =
      widget.querySelector(
        "#alpha-trader-label"
      );

    if (label) {
      label.textContent =
        "ALPHA TRADER";
    }
  }


  function startAutoTrade() {
    if (scanActive) return;

    closePanel();

    clearAfterTradeTimer();

    scanActive = true;

    widget.classList.add(
      "alpha-glow"
    );

    scanOverlay.classList.add(
      "scan-on"
    );

    const delayMs =
      settings.delaySec * 1000;

    console.log(
      "ALPHA TRADER: demo scan started | delay:",
      settings.delaySec + "s"
    );

    tradeTimer =
      setTimeout(() => {
        tradeTimer = null;

        /*
         * DEMO ONLY
         * No real trading button is clicked.
         */

        const side =
          generateDemoDirection();

        showDemoSignal(side);

        scheduleAfterTradeScanStop();

      }, delayMs);
  }


  function resetTapCounter() {
    tapCount = 0;

    if (tapSettleTimer) {
      clearTimeout(
        tapSettleTimer
      );

      tapSettleTimer = null;
    }
  }


  function registerTap() {
    if (
      panel.classList.contains(
        "panel-open"
      )
    ) {
      return;
    }

    const now = Date.now();

    if (
      now - lastTapAt >
      TAP_SEQUENCE_MS
    ) {
      tapCount = 0;
    }

    lastTapAt = now;

    tapCount += 1;

    if (tapSettleTimer) {
      clearTimeout(
        tapSettleTimer
      );

      tapSettleTimer = null;
    }

    if (
      tapCount >= TAP_REQUIRED
    ) {
      resetTapCounter();

      openPanel();

      return;
    }

    tapSettleTimer =
      setTimeout(() => {

        tapSettleTimer = null;

        if (tapCount === 1) {

          if (scanActive) {
            stopScanSession();
          } else {
            startAutoTrade();
          }

        }

        tapCount = 0;

      }, TAP_SETTLE_MS);
  }


  /* ——— Drag: mouse + touch ——— */

  let dragging = false;
  let moved = false;

  let startX = 0;
  let startY = 0;

  let startLeft = 0;
  let startTop = 0;

  const DRAG_THRESHOLD = 8;


  function clampPosition(left, top) {
    const rect =
      widget.getBoundingClientRect();

    const maxL =
      window.innerWidth -
      rect.width;

    const maxT =
      window.innerHeight -
      rect.height;

    return {
      left: Math.max(
        0,
        Math.min(left, maxL)
      ),

      top: Math.max(
        0,
        Math.min(top, maxT)
      )
    };
  }


  function onPointerDown(
    clientX,
    clientY
  ) {
    dragging = true;
    moved = false;

    const r =
      widget.getBoundingClientRect();

    startX = clientX;
    startY = clientY;

    startLeft = r.left;
    startTop = r.top;

    widget.style.transform =
      "none";

    widget.style.left =
      startLeft + "px";

    widget.style.top =
      startTop + "px";
  }


  function onPointerMove(
    clientX,
    clientY
  ) {
    if (!dragging) return;

    const dx =
      clientX - startX;

    const dy =
      clientY - startY;

    if (
      Math.abs(dx) >
        DRAG_THRESHOLD ||
      Math.abs(dy) >
        DRAG_THRESHOLD
    ) {
      moved = true;
    }

    const pos =
      clampPosition(
        startLeft + dx,
        startTop + dy
      );

    widget.style.left =
      pos.left + "px";

    widget.style.top =
      pos.top + "px";
  }


  function onPointerUp() {
    if (!dragging) return;

    dragging = false;

    if (!moved) {

      if (!unlocked) {

        showPasswordGate(
          function () {

            unlocked = true;

            console.log(
              "ALPHA TRADER unlocked — " +
              "tap icon to scan, " +
              "3 taps for settings"
            );

          }
        );

        return;
      }

      registerTap();
    }
  }


  widget.addEventListener(
    "mousedown",
    (e) => {
      e.preventDefault();

      onPointerDown(
        e.clientX,
        e.clientY
      );
    }
  );


  widget.addEventListener(
    "touchstart",
    (e) => {

      if (
        e.touches.length !== 1
      ) {
        return;
      }

      e.preventDefault();

      const t =
        e.touches[0];

      onPointerDown(
        t.clientX,
        t.clientY
      );

    },
    {
      passive: false
    }
  );


  document.addEventListener(
    "mousemove",
    (e) => {
      onPointerMove(
        e.clientX,
        e.clientY
      );
    }
  );


  document.addEventListener(
    "touchmove",
    (e) => {

      if (
        !dragging ||
        e.touches.length !== 1
      ) {
        return;
      }

      e.preventDefault();

      const t =
        e.touches[0];

      onPointerMove(
        t.clientX,
        t.clientY
      );

    },
    {
      passive: false
    }
  );


  document.addEventListener(
    "mouseup",
    onPointerUp
  );

  document.addEventListener(
    "touchend",
    onPointerUp
  );

  document.addEventListener(
    "touchcancel",
    onPointerUp
  );


  /* ——— Safe stop / cleanup ——— */

  window.__ALPHA_TRADER_STOP__ =
    function () {

      stopScanSession();

      resetTapCounter();

      closePanel();

      widget.remove();

      scanOverlay.remove();

      backdrop.remove();

      panel.remove();

      style.remove();

      delete window.__ALPHA_TRADER_ACTIVE__;

      delete window.__ALPHA_TRADER_STOP__;

      console.log(
        "ALPHA TRADER removed."
      );
    };


  /* ——— Initial UI ——— */

  syncPanelUI();

  console.log(
    "ALPHA TRADER DEMO loaded — " +
    "icon ready (drag to move). " +
    "Tap icon → password, " +
    "1 tap: scan, " +
    "3 taps: settings | delay:",
    settings.delaySec + "s",
    "| after-scan:",
    settings.afterTradeScanSec === 0
      ? "manual"
      : settings.afterTradeScanSec + "s",
    "| dir:",
    settings.direction
  );

}

initAlphaTrader();





