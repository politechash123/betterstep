/* BetterStep — animations: scroll reveals, counters, NFT rarity cycle, Play Store glow trail */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sequential delays for the flow diagram and token lists ---------- */
  document.querySelectorAll("[data-flow]").forEach(function (flow) {
    var step = 0;
    Array.prototype.forEach.call(flow.children, function (child) {
      // nodes and lines advance the sequence; notes appear just after the line above/below them
      var isNote = child.hasAttribute("data-flow-note");
      child.style.setProperty("--seq", (isNote ? step * 160 + 120 : step * 160) + "ms");
      if (!isNote) step += 1;
    });
  });

  document.querySelectorAll("[data-stagger]").forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (li, i) {
      li.style.setProperty("--seq", i * 70 + "ms");
    });
  });

  /* ---------- Number count-up ---------- */
  var formatNumber = function (value, decimals) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  var countUp = function (el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    if (reduceMotion) {
      el.textContent = prefix + formatNumber(target, decimals);
      return;
    }
    var duration = 1800;
    var start = null;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var done = false;
    var finish = function () {
      done = true;
      el.textContent = prefix + formatNumber(target, decimals);
    };
    var frame = function (now) {
      if (done) return;
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      if (p >= 1) { finish(); return; }
      el.textContent = prefix + formatNumber(target * ease(p), decimals);
      window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
    // Safety net: always land on the exact value even if frames are throttled
    window.setTimeout(finish, duration + 200);
  };

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    "[data-reveal], [data-steps], [data-orbs], [data-flow], [data-stagger]"
  );

  var reveal = function (el) {
    el.classList.add("is-visible");
    el.querySelectorAll("[data-count]").forEach(countUp);
  };

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach(reveal);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Shoe NFT rarity cycle (Figma: after 0.8s → smart-animate 1200ms ease-out) ---------- */
  var RARITIES = [
    { name: "Common", price: "0.08 ETH", color: "var(--red)" },
    { name: "Uncommon", price: "0.1 ETH", color: "var(--yellow)" },
    { name: "Rare", price: "0.15 ETH", color: "var(--sky)" },
    { name: "Legendary", price: "0.66 ETH", color: "var(--green)" }
  ];

  document.querySelectorAll("[data-rarity-cycle]").forEach(function (card) {
    if (reduceMotion) return;
    var nameEl = card.querySelector("[data-rarity-name]");
    var priceEl = card.querySelector("[data-rarity-price]");
    var index = 0;
    var timer = null;
    var HOLD = 800 + 1200; // 0.8s delay + 1.2s transition per state

    var advance = function () {
      index = (index + 1) % RARITIES.length;
      var r = RARITIES[index];
      card.style.setProperty("--rarity", r.color);
      [nameEl, priceEl].forEach(function (el) { el.classList.add("is-out"); });
      window.setTimeout(function () {
        nameEl.textContent = r.name;
        priceEl.textContent = r.price;
        [nameEl, priceEl].forEach(function (el) { el.classList.remove("is-out"); });
      }, 600);
    };

    var start = function () { if (!timer) timer = window.setInterval(advance, HOLD); };
    var stop = function () { window.clearInterval(timer); timer = null; };

    // Only run while the card is on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0.3 }).observe(card);
    } else {
      start();
    }

    // Pause while the user is reading / hovering
    card.addEventListener("mouseenter", stop);
    card.addEventListener("mouseleave", start);
    card.addEventListener("focusin", stop);
    card.addEventListener("focusout", start);
  });

  /* ---------- Play Store glow trail (Figma: 12×4 dots light up on hover, 100ms ease-out) ---------- */
  document.querySelectorAll("[data-dot-trail]").forEach(function (grid) {
    var COLS = 12;
    var ROWS = 4;
    var dots = [];
    for (var i = 0; i < COLS * ROWS; i++) {
      var dot = document.createElement("i");
      grid.appendChild(dot);
      dots.push(dot);
    }
    if (reduceMotion) return;

    var host = grid.parentElement;
    var lastIndex = -1;
    host.addEventListener("pointermove", function (e) {
      var rect = host.getBoundingClientRect();
      var col = Math.min(COLS - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * COLS)));
      var row = Math.min(ROWS - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * ROWS)));
      var idx = row * COLS + col;
      if (idx === lastIndex) return;
      lastIndex = idx;
      var d = dots[idx];
      d.classList.add("is-lit");
      window.setTimeout(function () { d.classList.remove("is-lit"); }, 140);
    });
    host.addEventListener("pointerleave", function () { lastIndex = -1; });
  });
})();
