(function () {
  // 8 de enero de 2027, 21:30 hora de Argentina
  var EVENT_DATE = new Date("2027-01-08T21:30:00-03:00").getTime();
  var els = {};
  ["days", "hours", "minutes", "seconds"].forEach(function (unit) {
    els[unit] = document.querySelector('[data-unit="' + unit + '"]');
  });

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    var diff = Math.max(0, EVENT_DATE - Date.now());
    var s = Math.floor(diff / 1000);
    els.days.textContent = Math.floor(s / 86400);
    els.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    els.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    els.seconds.textContent = pad(s % 60);
  }

  tick();
  setInterval(tick, 1000);
})();

// Galería: aparición al scrollear + lightbox con flechas y swipe
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  var sources = items.map(function (item) { return item.querySelector("img").getAttribute("src"); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (item, i) {
      item.style.transitionDelay = (i % 2) * 0.12 + "s";
      io.observe(item);
    });
  } else {
    items.forEach(function (item) { item.classList.add("is-visible"); });
  }

  var box = document.querySelector(".lightbox");
  var img = box.querySelector(".lightbox__img");
  var counter = box.querySelector(".lightbox__counter");
  var current = 0;

  function pad(n) { return String(n).padStart(2, "0"); }
  function show(i) {
    current = (i + sources.length) % sources.length;
    img.src = sources[current];
    counter.textContent = pad(current + 1) + " / " + pad(sources.length);
  }

  items.forEach(function (item, i) {
    item.addEventListener("click", function () { show(i); box.showModal(); });
  });
  box.querySelector("[data-prev]").addEventListener("click", function () { show(current - 1); });
  box.querySelector("[data-next]").addEventListener("click", function () { show(current + 1); });
  box.querySelector("[data-close-lightbox]").addEventListener("click", function () { box.close(); });
  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  var startX = null;
  box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();

(function () {
  var modal = document.querySelector(".location-modal");
  var status = modal.querySelector(".location-modal__status");
  var MAPS_URL = modal.querySelector(".location-modal__actions a").href;

  document.querySelector("[data-open-location]").addEventListener("click", function () {
    status.textContent = "";
    modal.showModal();
  });
  modal.querySelector("[data-close-location]").addEventListener("click", function () { modal.close(); });
  modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });

  modal.querySelector("[data-copy-location]").addEventListener("click", function () {
    var text = "Club Atlético Independiente Unión Cultural – " + MAPS_URL;
    var done = function () { status.textContent = "¡Ubicación copiada!"; };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (_e) { status.textContent = "No se pudo copiar"; }
      ta.remove();
    }
  });
})();
