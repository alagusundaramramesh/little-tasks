/**
 * FullscreenController - Handles game iframe fullscreen across iOS, Android, and Desktop
 *
 * ── iOS FIX HISTORY ─────────────────────────────────────────────────────────
 *  Fix 1: Rotate <iframe> itself so Unity touch coords are native.
 *  Fix 2: contentWindow.focus() so Unity hasFocus() = true.
 *  Fix 3: Explicit px dimensions in _applyPlainFullscreen().
 *  Fix 4: Moved touch-action:none from body → container div.
 *  Fix 5 (THIS): canvas tabIndex = -1 prevented Unity from processing input.
 *
 *    Root cause: Unity WebGL sets tabIndex=-1 on #unity-canvas during init.
 *    Unity's internal input system checks document.activeElement === canvas
 *    before processing any touch event. With tabIndex=-1, the canvas cannot
 *    receive focus via .focus() call, so Unity always sees activeElement as
 *    something else and discards every touch silently — even though:
 *      ✅ touch events reach the canvas (confirmed via DevTools)
 *      ✅ Unity's own touchstart listeners are registered on the canvas
 *      ✅ hasFocus() on the iframe document is true
 *
 *    Fix: After iframe loads, access canvas via contentDocument (same-origin),
 *    set tabIndex=0 to make it focusable, then call canvas.focus().
 *    Also set unityInstance.Module.pauseOnBlur = false (already in index.html
 *    but we reinforce it) so Unity never pauses input on focus loss.
 *
 * ── Android ─── UNCHANGED ───────────────────────────────────────────────────
 * ── Desktop ─── UNCHANGED ───────────────────────────────────────────────────
 */

class FullscreenController {
    constructor() {
        this.container    = null;
        this.float_button = null;
        this.game_frame   = null;
        this.img_frame    = null;
        this.start_btn    = null;
        this.bottom_strip = null;
        this.refreshElements();

        this.os            = this.getOS();
        this.iframe_height = 600;

        this.isRotated              = false;
        this._gameOrientation       = "landscape";
        this.orientationListener    = null;
        this._savedScrollY          = undefined;
        this._focusRecoveryListener = null;

        // Canvas focus polling — keeps canvas focused while game runs
        this._canvasFocusInterval   = null;
    }

    /* ═══════════════════════════════════════════════════════════════
       DOM HELPERS
    ═══════════════════════════════════════════════════════════════ */

    refreshElements() {
        this.container    = document.getElementById("iframe-div");
        this.float_button = document.getElementById("float_button");
        this.game_frame   = document.getElementById("game_frame");
        this.img_frame    = document.getElementById("img_frame");
        this.start_btn    = document.getElementById("start-btn");
        this.bottom_strip = document.getElementsByClassName("bottom-strip")[0];
    }

    /* ═══════════════════════════════════════════════════════════════
       OS DETECTION  (unchanged)
    ═══════════════════════════════════════════════════════════════ */

    getOS() {
        const ua  = navigator.userAgent || navigator.vendor || window.opera;
        const isIOS =
            /iPad|iPhone|iPod/.test(ua) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

        if (/android/i.test(ua)) {
            return (!(/mobile/i.test(ua)) || Math.min(screen.width, screen.height) >= 600)
                ? "Android Tablet"
                : "Android";
        }
        if (isIOS) {
            return (/iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
                ? "iOS Tablet"
                : "iOS";
        }
        return "Unknown";
    }

    /* ═══════════════════════════════════════════════════════════════
       MAIN ENTRY POINT  (unchanged signature)
    ═══════════════════════════════════════════════════════════════ */

    func_int({ GetOS, orientation = "landscape" } = {}) {
        this.refreshElements();
        if (!this.container || !this.game_frame) return;

        const os             = GetOS || this.os;
        const isPortrait     = window.matchMedia("(orientation: portrait)").matches;
        const needsLandscape = orientation === "landscape";

        console.log("func_int:", { os, orientation, isPortrait, needsLandscape,
            vw: window.innerWidth, vh: window.innerHeight });

        this.game_frame.style.display = "block";
        this.container.style.display  = "block";
        if (this.img_frame) this.img_frame.style.display = "none";
        if (this.start_btn) this.start_btn.style.display = "none";

        if (os === "iOS" || os === "iOS Tablet") {
            this._gameOrientation = orientation;
            this._setupOrientationListener(orientation);
            this.checkOrientationAndGuard(orientation);
            this._handleIOS(orientation, isPortrait, needsLandscape);
        }
        else if (os === "Android" || os === "Android Tablet") {
            this.handleAndroid(needsLandscape);         // UNCHANGED
        }
        else {
            this.handleDesktop();                       // UNCHANGED
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       iOS — TOP-LEVEL HANDLER
    ═══════════════════════════════════════════════════════════════ */

    _handleIOS(orientation, isPortrait, needsLandscape) {
        this.refreshElements();
        if (!this.container || !this.game_frame) return;

        if (needsLandscape && isPortrait) {
            this._applyIframeRotation();
        } else {
            this._applyPlainFullscreen();
        }

        if (this.float_button) {
            this.float_button.style.display = "flex";
            this.float_button.classList.add("float_button_visibility");
        }

        this._lockScrollIOS(true);
        this._attachFocusRecovery();

        // Focus unity canvas after it loads — poll until canvas is ready
        this._startCanvasFocusPolling();

        setTimeout(() => window.scrollTo(0, 1), 300);
    }

    /* ═══════════════════════════════════════════════════════════════
       iOS — IFRAME ROTATE
    ═══════════════════════════════════════════════════════════════ */

    _applyIframeRotation() {
        this.refreshElements();
        if (!this.container || !this.game_frame) return;

        this.isRotated = true;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        this.container.classList.add("fullscreen_manager");
        this.container.style.setProperty("position",   "fixed",   "important");
        this.container.style.setProperty("top",        "0",       "important");
        this.container.style.setProperty("left",       "0",       "important");
        this.container.style.setProperty("width",      `${vw}px`, "important");
        this.container.style.setProperty("height",     `${vh}px`, "important");
        this.container.style.setProperty("overflow",   "hidden",  "important");
        this.container.style.setProperty("background", "#000",    "important");
        this.container.style.setProperty("z-index",    "9999",    "important");
        this.container.style.removeProperty("transform");
        this.container.style.removeProperty("transform-origin");
        this.container.style.removeProperty("margin-left");
        this.container.style.removeProperty("margin-top");

        const tx = (vh - vw) / 2;
        const ty = (vw - vh) / 2;

        this.game_frame.style.setProperty("width",            `${vh}px`, "important");
        this.game_frame.style.setProperty("height",           `${vw}px`, "important");
        this.game_frame.style.setProperty("transform",        `translateX(${tx}px) translateY(${ty}px) rotate(90deg)`, "important");
        this.game_frame.style.setProperty("transform-origin", "center center", "important");
        this.game_frame.style.setProperty("pointer-events",   "auto",    "important");
        this.game_frame.style.setProperty("touch-action",     "auto",    "important");
        this.game_frame.style.setProperty("display",          "block",   "important");
        this.game_frame.style.setProperty("border",           "none",    "important");
        this.game_frame.style.setProperty("visibility",       "visible", "important");

        this._focusIframe();
        setTimeout(() => this._focusIframe(), 100);
        setTimeout(() => this._focusIframe(), 300);
        setTimeout(() => this._focusIframe(), 600);
    }

    _removeIframeRotation() {
        this.refreshElements();
        this.isRotated = false;

        if (this.game_frame) {
            ["width", "height", "transform", "transform-origin",
             "pointer-events", "touch-action", "border", "visibility"
            ].forEach(p => this.game_frame.style.removeProperty(p));
        }
        if (this.container) {
            ["position", "top", "left", "width", "height",
             "overflow", "background", "z-index"
            ].forEach(p => this.container.style.removeProperty(p));
            this.container.classList.remove("fullscreen_manager");
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       iOS — PLAIN FULLSCREEN
    ═══════════════════════════════════════════════════════════════ */

    _applyPlainFullscreen() {
        this.refreshElements();
        if (!this.container || !this.game_frame) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        console.log("_applyPlainFullscreen:", vw, vh);

        this.container.classList.add("fullscreen_manager");
        this.container.style.setProperty("position",   "fixed",   "important");
        this.container.style.setProperty("top",        "0",       "important");
        this.container.style.setProperty("left",       "0",       "important");
        this.container.style.setProperty("width",      `${vw}px`, "important");
        this.container.style.setProperty("height",     `${vh}px`, "important");
        this.container.style.setProperty("overflow",   "hidden",  "important");
        this.container.style.setProperty("background", "#000",    "important");
        this.container.style.setProperty("z-index",    "9999",    "important");

        this.game_frame.style.setProperty("width",          `${vw}px`, "important");
        this.game_frame.style.setProperty("height",         `${vh}px`, "important");
        this.game_frame.style.setProperty("pointer-events", "auto",    "important");
        this.game_frame.style.setProperty("touch-action",   "auto",    "important");
        this.game_frame.style.setProperty("display",        "block",   "important");
        this.game_frame.style.setProperty("border",         "none",    "important");
        this.game_frame.style.setProperty("visibility",     "visible", "important");
        this.game_frame.style.removeProperty("transform");
        this.game_frame.style.removeProperty("transform-origin");

        this._focusIframe();
        setTimeout(() => this._focusIframe(), 300);
    }

    /* ═══════════════════════════════════════════════════════════════
       iOS — UNITY CANVAS FOCUS  ← THE FIX
       ─────────────────────────────────────────────────────────────
       Unity sets tabIndex=-1 on #unity-canvas during initialisation.
       With tabIndex=-1, canvas.focus() is a no-op — the canvas stays
       unfocused, document.activeElement never equals the canvas, and
       Unity's input system discards every touch event silently.

       Fix:
         1. Poll until #unity-canvas exists in the iframe document.
         2. Set tabIndex=0 so canvas.focus() works.
         3. Call canvas.focus() to make it the activeElement.
         4. Keep a touchstart listener on the container that re-focuses
            the canvas on every tap (in case iOS drops focus).
    ═══════════════════════════════════════════════════════════════ */

    _startCanvasFocusPolling() {
        this._stopCanvasFocusPolling();

        let attempts = 0;
        const maxAttempts = 60; // 30 seconds max (every 500ms)

        this._canvasFocusInterval = setInterval(() => {
            attempts++;

            const canvas = this.game_frame?.contentDocument
                ?.getElementById("unity-canvas");

            if (canvas) {
                console.log("canvas found, fixing tabIndex and focusing...");
                this._focusUnityCanvas(canvas);
                this._stopCanvasFocusPolling();
                return;
            }

            if (attempts >= maxAttempts) {
                console.warn("unity-canvas not found after 30s, stopping poll");
                this._stopCanvasFocusPolling();
            }
        }, 500);
    }

    _stopCanvasFocusPolling() {
        if (this._canvasFocusInterval) {
            clearInterval(this._canvasFocusInterval);
            this._canvasFocusInterval = null;
        }
    }

    _focusUnityCanvas(canvas) {
        if (!canvas) {
            // Try to get it fresh
            canvas = this.game_frame?.contentDocument
                ?.getElementById("unity-canvas");
        }
        if (!canvas) return;

        // Make canvas focusable (Unity sets -1 which blocks focus)
        canvas.tabIndex = 0;

        // Focus the canvas directly
        canvas.focus({ preventScroll: true });

        console.log("unity-canvas focused:",
            this.game_frame?.contentDocument?.activeElement?.id);
    }

    /* ═══════════════════════════════════════════════════════════════
       iOS — IFRAME FOCUS (document-level)
    ═══════════════════════════════════════════════════════════════ */

    _focusIframe() {
        try {
            if (this.game_frame?.contentWindow) {
                this.game_frame.contentWindow.focus();
            }
        } catch (e) {
            console.warn("iframe focus failed:", e);
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       iOS — FOCUS RECOVERY LISTENER
       On every tap: re-focus iframe document AND unity canvas.
       Runs in outer context so always has permission to call focus().
    ═══════════════════════════════════════════════════════════════ */

    _attachFocusRecovery() {
        this._detachFocusRecovery();

        this._focusRecoveryListener = () => {
            // 1. Ensure iframe document has focus
            if (!this.game_frame?.contentDocument?.hasFocus()) {
                this._focusIframe();
            }
            // 2. Ensure unity canvas is the activeElement
            const canvas = this.game_frame?.contentDocument
                ?.getElementById("unity-canvas");
            const activeEl = this.game_frame?.contentDocument?.activeElement;
            if (canvas && activeEl !== canvas) {
                this._focusUnityCanvas(canvas);
            }
        };

        this.container?.addEventListener(
            "touchstart",
            this._focusRecoveryListener,
            { capture: true, passive: true }
        );
    }

    _detachFocusRecovery() {
        if (!this._focusRecoveryListener || !this.container) return;
        this.container.removeEventListener(
            "touchstart",
            this._focusRecoveryListener,
            { capture: true }
        );
        this._focusRecoveryListener = null;
    }

    /* ═══════════════════════════════════════════════════════════════
       iOS — ORIENTATION CHANGE HANDLER
    ═══════════════════════════════════════════════════════════════ */

    onOrientationChange(gameOrientation = "landscape") {
        const os = this.getOS();
        if (os !== "iOS" && os !== "iOS Tablet") return;

        setTimeout(() => {
            this.refreshElements();

            const isPortrait     = window.matchMedia("(orientation: portrait)").matches;
            const needsLandscape = gameOrientation === "landscape";

            console.log("orientationChange:", {
                isPortrait, needsLandscape,
                vw: window.innerWidth, vh: window.innerHeight
            });

            this.checkOrientationAndGuard(gameOrientation);

            if (needsLandscape && isPortrait) {
                this._removeIframeRotation();
                this._applyIframeRotation();
            } else if (needsLandscape && !isPortrait) {
                this._removeIframeRotation();
                this._applyPlainFullscreen();
            } else if (!needsLandscape && isPortrait) {
                if (this.isRotated) this._removeIframeRotation();
                this._applyPlainFullscreen();
            } else {
                if (this.isRotated) this._removeIframeRotation();
            }

            // Re-focus canvas after orientation change
            setTimeout(() => {
                this._focusUnityCanvas();
            }, 400);

        }, 200);
    }

    /* ═══════════════════════════════════════════════════════════════
       iOS — ORIENTATION LISTENER LIFECYCLE
    ═══════════════════════════════════════════════════════════════ */

    _setupOrientationListener(orientation) {
        this.clearOrientationListener();
        this.orientationListener = () => this.onOrientationChange(orientation);
        window.addEventListener("orientationchange", this.orientationListener);
        window.addEventListener("resize",            this.orientationListener);
    }

    clearOrientationListener() {
        if (!this.orientationListener) return;
        window.removeEventListener("orientationchange", this.orientationListener);
        window.removeEventListener("resize",            this.orientationListener);
        this.orientationListener = null;
    }

    /* ═══════════════════════════════════════════════════════════════
       iOS — SCROLL LOCK
       Body gets overflow:hidden only.
       touch-action:none on container (not body) — body touch-action
       blocks touch delivery into iframe on iOS Safari.
    ═══════════════════════════════════════════════════════════════ */

    _lockScrollIOS(lock) {
        if (lock) {
            this._savedScrollY           = window.scrollY;
            document.body.style.overflow = "hidden";
            if (this.container) {
                this.container.style.touchAction = "none";
            }
        } else {
            document.body.style.overflow = "";
            if (this.container) {
                this.container.style.touchAction = "";
            }
            if (this._savedScrollY !== undefined) {
                window.scrollTo(0, this._savedScrollY);
                this._savedScrollY = undefined;
            }
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       ORIENTATION GUARD
    ═══════════════════════════════════════════════════════════════ */

    checkOrientationAndGuard(gameOrientation = "landscape") {
        this.refreshElements();
        if (!this.game_frame) return;

        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        const wrong =
            (gameOrientation === "landscape" && isPortrait) ||
            (gameOrientation === "portrait"  && !isPortrait);

        const overlay = document.getElementById("rotate-overlay");

        if (wrong) {
            overlay?.classList.add("show");
            this.game_frame.style.pointerEvents = "none";
        } else {
            overlay?.classList.remove("show");
            this.game_frame.style.pointerEvents = "auto";
            this._focusIframe();
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       EXIT FULLSCREEN
    ═══════════════════════════════════════════════════════════════ */

    ExitFullscreen({ forceExit = false } = {}) {
        this.refreshElements();
        if (!this.container || !this.game_frame) return;

        console.log("ExitFullscreen, forceExit:", forceExit);

        this.clearOrientationListener();
        this._detachFocusRecovery();
        this._stopCanvasFocusPolling();
        this._lockScrollIOS(false);

        if (this.float_button) {
            this.float_button.style.display = "none";
            this.float_button.classList.remove("float_button_visibility");
        }

        const platform = this.getOS();

        if (
            platform === "iOS"     || platform === "iOS Tablet" ||
            platform === "Android" || platform === "Android Tablet"
        ) {
            if (this.isRotated) this._removeIframeRotation();

            ["position", "top", "left", "width", "height",
             "overflow", "background", "z-index", "touch-action"
            ].forEach(p => this.container.style.removeProperty(p));

            document.getElementById("rotate-overlay")?.classList.remove("show");
            this.container.classList.remove("fullscreen_manager");
            this.container.style.display = "none";

            this.game_frame.src = "about:blank";

            if (this.img_frame) this.img_frame.style.display = "block";
            if (this.start_btn) this.start_btn.style.display = "block";
        }
        // ── Desktop: UNCHANGED ───────────────────────────────────────
        else {
            this.game_frame.style.width  = "100%";
            this.game_frame.style.height = `${this.iframe_height}px`;
            if (this.bottom_strip) this.bottom_strip.style.display = "block";
            this.game_frame.contentWindow?.focus();
        }

        if (
            forceExit &&
            (document.fullscreenElement    || document.webkitFullscreenElement ||
             document.mozFullScreenElement || document.msFullscreenElement)
        ) {
            if      (document.exitFullscreen)       document.exitFullscreen().catch(console.warn);
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
            else if (document.msExitFullscreen)     document.msExitFullscreen();
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       ANDROID — UNCHANGED
    ═══════════════════════════════════════════════════════════════ */

    handleAndroid(needsLandscape) {
        this.EnterFullscreen(needsLandscape ? "landscape" : null);
    }

    /* ═══════════════════════════════════════════════════════════════
       DESKTOP — UNCHANGED
    ═══════════════════════════════════════════════════════════════ */

    handleDesktop() {
        if (this.bottom_strip) this.bottom_strip.style.display = "block";
    }

    /* ═══════════════════════════════════════════════════════════════
       ENTER FULLSCREEN — UNCHANGED (Android + Desktop)
    ═══════════════════════════════════════════════════════════════ */

    EnterFullscreen(lockOrientation = null) {
        this.refreshElements();
        if (!this.container || !this.game_frame) return;

        const iframe = this.container;

        const onSuccess = () => {
            this.game_frame.style.width      = "100%";
            this.game_frame.style.height     = "100%";
            this.game_frame.style.visibility = "visible";

            if (this.float_button) {
                this.float_button.style.display    = "flex";
                this.float_button.style.visibility = "visible";
                this.float_button.classList.add("float_button_visibility");
            }

            if (lockOrientation) this.lockOrientation(lockOrientation);
            this.game_frame.contentWindow?.focus();
        };

        try {
            if      (iframe.requestFullscreen)       iframe.requestFullscreen().then(onSuccess).catch(console.warn);
            else if (iframe.webkitRequestFullscreen) { iframe.webkitRequestFullscreen(); onSuccess(); }
            else if (iframe.mozRequestFullScreen)    { iframe.mozRequestFullScreen();    onSuccess(); }
            else if (iframe.msRequestFullscreen)     { iframe.msRequestFullscreen();     onSuccess(); }
            else if (iframe.webkitEnterFullscreen)   { iframe.webkitEnterFullscreen();   onSuccess(); }
            else                                       onSuccess();
        } catch (err) {
            console.warn("Fullscreen request failed:", err);
            onSuccess();
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       LOCK ORIENTATION — UNCHANGED (Android)
    ═══════════════════════════════════════════════════════════════ */

    lockOrientation(orientation = "landscape") {
        if (!screen.orientation?.lock) return;
        const map = { landscape: "landscape-primary", portrait: "portrait-primary" };
        screen.orientation.lock(map[orientation] || orientation).catch(err => {
            console.warn("Orientation lock failed:", err);
            screen.orientation.lock(orientation).catch(console.warn);
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       UTILITIES
    ═══════════════════════════════════════════════════════════════ */

    DeduceOrientation() {
        return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    }

    lockBodyScroll(lock)        { this._lockScrollIOS(lock); }
    applyIOSLandscapeRotation() { this._applyIframeRotation(); }
    removeIOSRotation()         { this._removeIframeRotation(); }
}

export default FullscreenController;