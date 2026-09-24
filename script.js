(function(){
  "use strict";

  // Intro sequence: the ice-cream video plays once; once it ends on the "Sütliman" frame,
  // the text area becomes a button that enters the site.
  (function initIntro(){
    var intro = document.getElementById("intro");
    if (!intro) return;

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem("sutlimanIntroSeen") === "1"; } catch (e) {}

    if (reduceMotion || alreadySeen) {
      return; // overlay stays display:none (base CSS); site is immediately usable
    }

    var video = document.getElementById("introVideo");
    var enterBtn = document.getElementById("introEnter");
    var skipBtn = document.getElementById("introSkip");
    var ready = false;
    var finished = false;
    var safetyTimer = null;

    document.body.classList.add("intro-lock");
    intro.classList.add("is-active");
    intro.setAttribute("aria-hidden", "false");

    function markSeen() {
      try { sessionStorage.setItem("sutlimanIntroSeen", "1"); } catch (e) {}
    }

    function endIntro() {
      if (finished) return;
      finished = true;
      clearTimeout(safetyTimer);
      document.body.classList.remove("intro-lock");
      intro.setAttribute("aria-hidden", "true");
      intro.classList.add("is-leaving");
      markSeen();
      window.setTimeout(function () {
        intro.classList.remove("is-active", "is-leaving", "is-ready");
        intro.setAttribute("hidden", "");
      }, 350);
    }

    function reveal() {
      if (ready) return;
      ready = true;
      // If we got here without the clip finishing naturally (blocked/failed autoplay),
      // jump straight to its last frame so the visible frame matches the now-active button.
      try {
        if (!video.ended && isFinite(video.duration) && video.duration > 0) {
          video.currentTime = video.duration;
        }
      } catch (e) {}
      intro.classList.add("is-ready");
      enterBtn.focus();
    }

    video.addEventListener("ended", reveal);
    video.addEventListener("error", reveal);
    // Safety net: never leave a visitor stuck if the video stalls or autoplay is blocked.
    // The clip itself runs ~10s, so this only fires for a genuinely broken/blocked playback.
    safetyTimer = window.setTimeout(reveal, 13000);

    var playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(reveal);

    enterBtn.addEventListener("click", endIntro);
    skipBtn.addEventListener("click", endIntro);
  })();

  // Mobile nav toggle
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeNav();
    });
    window.addEventListener("scroll", closeNav, { passive: true });
  }

  // Menu tabs
  var tabs = document.querySelectorAll(".tab-btn");
  var panels = { "tab-sutlu": document.getElementById("panel-sutlu"), "tab-waffle": document.getElementById("panel-waffle") };
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      Object.keys(panels).forEach(function (id) {
        if (panels[id]) panels[id].hidden = id !== tab.id;
      });
    });
  });

  // Scroll reveal
  var revealTargets = document.querySelectorAll(".story-grid, .review-grid, .konum-grid, .menu-tabs");
  revealTargets.forEach(function (el) { el.setAttribute("data-reveal", ""); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
