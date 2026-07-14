
// Mainly we write for HTML-WEBGL load inside the iframe,
//consist of the 3 div's iframe-div, floatbutton,game_frame.
// using Native js & jquery using.
/*
/***************************************\
*                                       *
*  outside container => #iframe-div.  *
*  inside iframe-div => #float_button.    *
*  next iframe-div => #game_frame.         *
*                                       *
\***************************************/

// names are given properly as i mentioned in the class file that will be work properly.
// fullscreen_manager css
/* 
.fullscreen_manager {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100dvh !important;
    height: 90vh !important;
    z-index: 9999 !important;
    background: #000 !important;
    overflow: hidden !important;
}; 
*/

// float_button_visibility css
/* 
    float_button_visibility
{
    display: flex !important;
    visibility: visible !important;
    z-index: 9999 !important;
    pointer-events: auto !important; 
    opacity: 1 !important; 
}
*/

/* landscape ios 
{
    container.style.transform = 'rotate(90deg)';
    container.style.width = '100vh';
    container.style.height = '100vw';
    container.style.transformOrigin = 'center center';
}
*/

class FullscreenController {
    constructor() {
        this.container = document.getElementById("iframe-div");
        this.float_button = document.getElementById("float_button");
        this.game_frame = document.getElementById("game_frame");
        this.ios = this.getOS();
        this.iframe_height = 600;
        // this.func_int();
    }
    onOrientationChange() {
        const angle = window.orientation || screen.orientation?.angle || 0;
        // alert(angle);
        if (angle === 90 || angle === -90) {
            console.log('Landscape mode');
            this.resetRotation();
            // this.isoLandscapeScreen();
        } else {
            console.log('Portrait mode');
            // alert("rotate else change rotate degree")
            // this.isoLandscapeScreen(rotate = 0);
            // this.isoLandscapeScreen();
            this.resetRotation();
            this.isoLandscapeScreen();

        }
    }
    test_func() {
        alert("Hello World");
    }
    func_int() {
        if (this.ios === "iOS" || this.ios === "iOS Tablet") {
            if (window.matchMedia("(orientation: portrait)").matches) {
                alert("Change into Landscape Mode."); // else try to manually change  css landscape..
                this.isoLandscapeScreen();

            } else {
                this.game_frame.style.display = "block";
                this.container.style.display = "block";
                // Full screen change function for ios.
                this.container.classList.add('fullscreen_manager');
                this.float_button.style.display = "block";
                this.float_button.classList.add('float_button_visibility');
                this.lockBodyScroll(true);
                setTimeout(() => window.scrollTo(0, 1), 300); // delay 1px down from & scroll to top.
            }
        } else if (this.ios === "Android" || this.ios === "Android Tablet") {
            // Enter Fullscreen with lock orientation.
            this.EnterFullscreen();
        } else if (this.ios === "Unknown") {
            // This is DESKTOP, DEFAULT INSIDE IFRAME GAME WILL BE RUN.
            this.EnterFullscreen();
        }
    }
    EnterFullscreen = () => {
        this.float_button.style.display = "none";
        this.float_button.classList.add('float_button_visibility');
        let iframe = this.container;
        try {
            if (iframe && window.innerWidth < 1100) {
                if (iframe.requestFullscreen) {

                    iframe.requestFullscreen().then(() => {
                        //    $('#preview').css('visibility', 'hidden');
                        $(this.game_frame).attr('width', '100%')
                        $(this.game_frame).attr("width", "100%");
                        $(this.game_frame).attr("height", "100%");
                        $(this.game_frame).css('visibility', 'visible');
                        $(this.float_button).css('visibility', 'visible');
                        this.lockOrientation();
                    });
                }
                else if (iframe.mozRequestFullScreen) { // Firefox
                    iframe.mozRequestFullScreen().then(() => {
                        //    $('#preview').css('visibility', 'hidden');
                        $(this.game_frame).attr("width", "100%");
                        $(this.game_frame).attr("height", "100%");
                        $(this.game_frame).css('visibility', 'visible');
                        $(this.float_button).css('visibility', 'visible');
                        this.lockOrientation();
                    });
                } else if (iframe.webkitRequestFullscreen) { // Chrome, Safari, Opera
                    iframe.webkitRequestFullscreen().then(() => {
                        //  $('#preview').css('visibility', 'hidden');
                        $(this.game_frame).attr("width", "100%");
                        $(this.game_frame).attr("height", "100%");
                        $(this.game_frame).css('visibility', 'visible');
                        $(this.float_button).css('visibility', 'visible');
                        this.lockOrientation();
                    });
                } else if (iframe.msRequestFullscreen) { // IE/Edge
                    iframe.msRequestFullscreen().then(() => {
                        //   $('#preview').css('visibility', 'hidden');
                        $(this.game_frame).attr("width", "100%");
                        $(this.game_frame).attr("height", "100%");
                        $(this.game_frame).css('visibility', 'visible');
                        $(this.float_button).css('visibility', 'visible');
                        this.lockOrientation();
                    });
                } else if (iframe.webkitEnterFullscreen) { // iOS Safari
                    iframe.webkitEnterFullscreen().then(() => {
                        $(this.game_frame).attr("width", "100%");
                        $(this.game_frame).attr("height", "100%");
                        $(this.game_frame).css('visibility', 'visible');
                        $(this.float_button).css('visibility', 'visible');
                        this.lockOrientation();
                    });
                }
            }
            else {
                // if desktop and pc inside iframe it will play, suppose it will need to full screen manuall click through it full screen.
                var GameFrame = this.game_frame;
                $(GameFrame).width("100%");
                $(GameFrame).height("100%");
                GameFrame.contentWindow.focus();
                // Focus IFRAME DIV.
                if (document.activeElement === GameFrame) {
                    console.log("✅ Iframe focused successfully after fullscreen");
                } else {
                    console.log("❌ Focus failed, will retry...");
                    GameFrame.contentWindow.focus(); // retry once
                }
                // MAKE FULL SCREEN IN PC
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                } else if (iframe.webkitRequestFullscreen) { // Safari
                    iframe.webkitRequestFullscreen();
                } else if (iframe.msRequestFullscreen) { // IE11
                    iframe.msRequestFullscreen();
                }
                this.lockOrientation();
            }
        } catch (error) {
            console.warn("Fullscreen request failed:", error);
        }

    };
    lockOrientation = () => {
        /* eslint-disable no-restricted-globals */
        // setIsMobileres(game_url[id.id].screen)
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape-primary').catch(err => {
                console.error('Failed to lock orientation:', err);
                // alert(err)
                if (screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(e => {
                        console.warn('Landscape lock also failed:', e);
                    });
                }
            });
        } else if (screen.lockOrientation) {
            // Older API
            screen.lockOrientation('landscape-primary') || screen.lockOrientation('landscape');
        }
        /* eslint-disable no-restricted-globals */
    };
    // IOS-LOCK SCROLL BODY
    lockBodyScroll(lock) {
        if (lock) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    }
    getOS() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // iPad detection (works for iPadOS 13+ where iPad reports as Mac)
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        if (/android/i.test(userAgent)) {
            // Check if it's Android Tablet
            if (!/mobile/i.test(userAgent)) {
                return "Android Tablet";
            }
            return "Android";
        }

        if (isIOS) {
            if (/iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
                return "iOS Tablet";
            }
            return "iOS";
        }

        return "Unknown";
    }

    ExitFullscreen() {
        this.lockBodyScroll(false);
        this.float_button.classList.remove('float_button_visibility');
        var get_platform = this.getOS();
        if (get_platform === "iOS" || get_platform === "iOS Tablet") {
            // BOTTOM STRIP HANDLE IN RENDERING FILE.
            this.container.style.display = "none";
            // Enable img,playnow.
            this.game_frame.src = "about:blank";

        } else if (get_platform === "Android" || get_platform === "Android Tablet") {
            // BOTTOM STRIP NONE _ IN MOBILE
            this.container.style.display = "none";
            // Enable img,playnow.
            this.game_frame.src = "about:blank";

        } else if (get_platform === "Unknown") {
            // BOTTOM STRIP BLOCk _ IN PC
            // While Exit height & width set als0 focus div
            $(this.game_frame).width("100%");
            $(this.game_frame).height(this.iframe_height);
        }
        //FLOAT BUTTON HIDDEN;
        this.float_button.style.display = "none";
        // Focus IFRAME DIV.
        var GameFrame = this.game_frame;
        GameFrame.contentWindow.focus();

        if (document.activeElement === GameFrame) {
            console.log("✅ Iframe focused successfully after fullscreen");
        } else {
            console.log("❌ Focus failed, will retry...");
            GameFrame.contentWindow.focus(); // retry once
        }

        if (document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                window.top.document.msExitFullscreen();
            }
        }
    }
    //IOS FALLBACK CSS LANDSCAPE
    isoLandscapeScreen() {
        // Wait for iOS to finish updating viewport size.
        //Float button VIsible.
        // alert("Enter into isoLandscapeScreen Rotation")

        setTimeout(() => {
            // this.container.style.transform = 'rotate(90deg)';
            // this.container.style.width = '100vw;
            // this.container.style.height = '100vh';
            // this.container.style.transformOrigin = 'center center';
            this.float_button.style.display ="block";
            this.float_button.classList.add('float_button_visibility');

            
            this.container.style.setProperty('transform', 'rotate(90deg)', 'important');
            this.container.style.setProperty('transform-origin', 'center center', 'important');
            this.container.style.setProperty('width', window.innerHeight + 'px', 'important');
            this.container.style.setProperty('height', window.innerWidth + 'px', 'important'); +
            // Optional: center it manually after rotation
            this.container.style.setProperty('position', 'absolute', 'important');
            this.container.style.setProperty('top', '50%', 'important');
            this.container.style.setProperty('left', '50%', 'important');
            this.container.style.setProperty('translate', '-50% -50%', 'important');
        }, 300);
    }
    resetRotation() {
        // alert("Enter into Reset Rotation")
        setTimeout(() => {
            this.container.style.removeProperty('transform');
            this.container.style.removeProperty('transform-origin');
            this.container.style.removeProperty('width');
            this.container.style.removeProperty('height');
            this.container.style.removeProperty('top');
            this.container.style.removeProperty('left');
            this.container.style.removeProperty('translate');
            // Optionally hide game or show rotate message
            this.float_button.style.display = 'none';
        }, 300);
    }
}
window.FullscreenController = FullscreenController;