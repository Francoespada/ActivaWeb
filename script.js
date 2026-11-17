(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.getElementById("header");
  var menuToggle = document.getElementById("menuToggle");
  var navMenu = document.getElementById("navMenu");
  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---------- Menú ---------- */
  function setMenu(open) {
    menuToggle.classList.toggle("active", open);
    navMenu.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    body.classList.toggle("menu-open", open);
  }
  menuToggle.addEventListener("click", function () {
    setMenu(!navMenu.classList.contains("open"));
  });
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navMenu.classList.contains("open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  /* ---------- Header al scrollear ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle("scrolled", window.scrollY > 25);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Revelado escalonado ----------
     Cada [data-reveal] recibe --d según su orden dentro del [data-stagger] más cercano. */
  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var items = Array.prototype.filter.call(group.querySelectorAll("[data-reveal]"), function (el) {
      return el.parentElement.closest("[data-stagger]") === group && el.getAttribute("data-reveal") !== "media";
    });
    items.forEach(function (el, i) {
      el.style.setProperty("--d", Math.min(i, 6) * 90 + "ms");
    });
  });
  /* la cortina de la foto arranca apenas después que su tarjeta */
  document.querySelectorAll('[data-reveal="media"]').forEach(function (el) {
    var card = el.parentElement.closest("[data-reveal]");
    var d = card ? card.style.getPropertyValue("--d") : "";
    el.style.setProperty("--d", "calc(" + (d || "0ms") + " + 80ms)");
  });

  function show(el) { el.classList.add("is-in"); }

  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    reveals.forEach(show);
  } else {
    /* La cortina ("media") recorta su propia caja con clip-path, así que el observer
       mira al contenedor y no al elemento recortado. */
    var targets = new Map();
    reveals.forEach(function (el) {
      var t = el.getAttribute("data-reveal") === "media" ? el.parentElement : el;
      if (!targets.has(t)) targets.set(t, []);
      targets.get(t).push(el);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        targets.get(entry.target).forEach(show);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (_, t) { io.observe(t); });
  }

  /* ---------- Contadores ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = Number(el.dataset.count);
        var suffix = el.dataset.suffix || "";
        var start = performance.now();
        var duration = 1100;
        function tick(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        el.textContent = "0" + suffix;
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.7 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- Luz que sigue al puntero (solo mouse, sin reduced motion) ---------- */
  var glow = document.querySelector(".cursor-glow");
  if (glow && finePointer.matches && !reduceMotion.matches) {
    var gx = 0, gy = 0, raf = 0;
    window.addEventListener("pointermove", function (e) {
      gx = e.clientX; gy = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        glow.style.transform = "translate3d(" + (gx - 160) + "px," + (gy - 160) + "px,0)";
        glow.classList.add("on");
        raf = 0;
      });
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", function () {
      glow.classList.remove("on");
    });

    /* brillo dentro de cada tarjeta */
    document.querySelectorAll(".project-card, .service-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    });
  }

  /* ---------- Año ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  root.classList.add("js-ready");
})();
