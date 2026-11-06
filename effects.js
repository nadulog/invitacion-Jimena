(function () {
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Intro + música ---------- */
  var intro = document.querySelector(".intro");
  var audio = document.getElementById("backgroundMusic");
  var toggle = document.querySelector(".audio-toggle");
  var wantsMusic = false;

  function setPlaying(playing) {
    toggle.classList.toggle("is-playing", playing);
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
  }

  function play() {
    audio.volume = 0.85;
    var p = audio.play();
    if (p && p.then) p.then(function () { setPlaying(true); }, function () { setPlaying(false); });
    else setPlaying(true);
  }

  function enter(withMusic) {
    if (intro.classList.contains("is-leaving")) return;
    wantsMusic = withMusic;
    if (withMusic) play(); // dentro del click: los celulares lo permiten
    window.scrollTo(0, 0);
    intro.classList.add("is-leaving");
    setTimeout(function () { document.body.classList.remove("intro-open"); }, 350);
    setTimeout(function () { intro.classList.add("is-gone"); }, 1000);
  }

  intro.querySelector("[data-enter-with-music]").addEventListener("click", function () { enter(true); });
  intro.querySelector("[data-enter-without-music]").addEventListener("click", function () { enter(false); });

  toggle.addEventListener("click", function () {
    if (audio.paused) { wantsMusic = true; play(); }
    else { wantsMusic = false; audio.pause(); setPlaying(false); }
  });

  // pausar al salir de la pestaña / bloquear el celular, retomar al volver
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (!audio.paused) { audio.pause(); setPlaying(false); } }
    else if (wantsMusic) { play(); }
  });

  /* ---------- Lluvia ---------- */
  var canvas = document.querySelector(".rain");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var drops = [], w = 0, h = 0, dpr = 1, running = true, last = 0;

    function makeDrop(randomY) {
      return {
        x: Math.random() * (w + 60) - 30,
        y: randomY ? Math.random() * h : -20 - Math.random() * 80,
        len: 10 + Math.random() * 18,
        speed: 520 + Math.random() * 420,   // px por segundo
        alpha: 0.08 + Math.random() * 0.16,
        red: Math.random() < 0.18
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(140, Math.round(w * h / 7000));
      drops = [];
      for (var i = 0; i < count; i++) drops.push(makeDrop(true));
    }

    var WIND = 0.12; // leve inclinación
    function frame(t) {
      if (!running) return;
      var dt = Math.min((t - last) / 1000 || 0, 0.05);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        d.y += d.speed * dt;
        d.x += d.speed * WIND * dt;
        if (d.y - d.len > h || d.x > w + 30) { drops[i] = makeDrop(false); continue; }
        ctx.strokeStyle = d.red ? "rgba(255,60,60," + (d.alpha + 0.12) + ")" : "rgba(235,225,215," + d.alpha + ")";
        ctx.lineWidth = d.red ? 1.2 : 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * WIND, d.y - d.len);
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) { last = performance.now(); requestAnimationFrame(frame); }
    });
    requestAnimationFrame(function (t) { last = t; frame(t); });
  }

  /* ---------- Cuenta regresiva: parpadeo al cambiar ---------- */
  if (!reduceMotion && "MutationObserver" in window) {
    document.querySelectorAll(".countdown strong").forEach(function (el) {
      new MutationObserver(function () {
        el.classList.remove("flick");
        void el.offsetWidth; // reinicia la animación
        el.classList.add("flick");
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* ---------- Galería: líneas que se dibujan al scrollear ---------- */
  var gallery = document.querySelector(".gallery");
  if (gallery && !reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-draw");
    var track = gallery.querySelector(".gallery__track");
    var ticking = false;

    function updateTrack() {
      ticking = false;
      var r = track.getBoundingClientRect();
      var vh = window.innerHeight;
      // la línea llega hasta el 80% de la pantalla
      var p = (vh * 0.8 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      track.style.setProperty("--draw", p.toFixed(4));
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateTrack); }
    }, { passive: true });
    window.addEventListener("resize", updateTrack);
    updateTrack();

    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-drawn"); ro.unobserve(e.target); }
      });
    }, { threshold: 1, rootMargin: "0px 0px -12% 0px" });
    gallery.querySelectorAll(".gallery__rule").forEach(function (el) { ro.observe(el); });
  }
})();
