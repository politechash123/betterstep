/* BetterStep — UI behaviour: header, mobile nav, FAQ accordion, small widgets */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: scrolled state ---------- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  if (header && toggle) {
    var setOpen = function (open) {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-open"));
    });

    header.querySelectorAll(".site-nav a").forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (header.classList.contains("is-open") && !header.contains(e.target)) setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) setOpen(false);
    });
  }

  /* ---------- FAQ accordion (Figma: smart-animate 300ms ease-in-out, one open at a time) ---------- */
  var faq = document.querySelector("[data-faq]");
  if (faq) {
    var DURATION = reduceMotion ? 0 : 300;

    var openItem = function (item) {
      var btn = item.querySelector(".faq__q");
      var panel = item.querySelector(".faq__a");
      panel.hidden = false;
      var target = panel.scrollHeight;
      panel.style.height = "0px";
      // force reflow so the transition starts from 0
      panel.getBoundingClientRect();
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      panel.style.height = target + "px";
      window.setTimeout(function () {
        if (item.classList.contains("is-open")) panel.style.height = "";
      }, DURATION);
    };

    var closeItem = function (item) {
      var btn = item.querySelector(".faq__q");
      var panel = item.querySelector(".faq__a");
      panel.style.height = panel.scrollHeight + "px";
      panel.getBoundingClientRect();
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      panel.style.height = "0px";
      window.setTimeout(function () {
        if (!item.classList.contains("is-open")) {
          panel.hidden = true;
          panel.style.height = "";
        }
      }, DURATION);
    };

    faq.querySelectorAll(".faq__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq__item");
        var isOpen = item.classList.contains("is-open");
        faq.querySelectorAll(".faq__item.is-open").forEach(function (other) {
          if (other !== item) closeItem(other);
        });
        if (isOpen) closeItem(item); else openItem(item);
      });
    });
  }

  /* ---------- NFT stack: tap / keyboard toggles the hover state ---------- */
  document.querySelectorAll("[data-nft-stack]").forEach(function (stack) {
    var isTouch = window.matchMedia("(hover: none)").matches;
    stack.addEventListener("click", function (e) {
      if (e.target.closest("button, a")) return;
      if (isTouch) stack.classList.toggle("is-active");
    });
    stack.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target === stack) {
        e.preventDefault();
        stack.classList.toggle("is-active");
      }
    });
    stack.addEventListener("blur", function () { stack.classList.remove("is-active"); });
  });

  /* ---------- Auction countdown ("Ends in") ---------- */
  document.querySelectorAll("[data-countdown]").forEach(function (el) {
    var remaining = parseInt(el.getAttribute("data-countdown"), 10) || 0;
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var render = function () {
      var h = Math.floor(remaining / 3600);
      var m = Math.floor((remaining % 3600) / 60);
      var s = remaining % 60;
      el.textContent = pad(h) + ":" + pad(m) + ":" + pad(s);
    };
    render();
    window.setInterval(function () {
      remaining = remaining > 0 ? remaining - 1 : 9872; // loop back for the demo
      render();
    }, 1000);
  });

  /* ---------- Follow button ---------- */
  document.querySelectorAll("[data-follow]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? "Following" : "Follow";
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
