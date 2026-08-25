/* Caroline Parreiras — Estética Avançada
 * Interações da landing page (sem dependências, sem build).
 * ---------------------------------------------------------
 * Camada de rastreamento: envia os eventos para dataLayer (GTM),
 * gtag (GA4) e fbq (Meta Pixel) quando esses scripts estiverem presentes.
 */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------- rastreamento ----------------------- */
  function track(event, payload) {
    payload = payload || {};
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: event }, payload));
      if (typeof window.gtag === "function") window.gtag("event", event, payload);
      if (event === "whatsapp_click" && typeof window.fbq === "function")
        window.fbq("track", "Contact", payload);
    } catch (e) {
      /* rastreamento nunca deve quebrar a página */
    }
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[data-track="whatsapp"]');
    if (link) track("whatsapp_click", { canal: "whatsapp" });
  });

  /* ------------------------ header fixo ----------------------- */
  var header = document.querySelector("[data-header]");
  var scrolledOn = ["border-border/70", "bg-background/90", "backdrop-blur-md"];
  var scrolledOff = ["border-transparent", "bg-background/40", "backdrop-blur-sm"];
  function onScrollHeader() {
    if (!header) return;
    var s = window.scrollY > 24;
    scrolledOn.forEach(function (c) {
      header.classList.toggle(c, s);
    });
    scrolledOff.forEach(function (c) {
      header.classList.toggle(c, !s);
    });
  }

  /* ------------------------ menu mobile ----------------------- */
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");
  if (menuToggle && menu) {
    var iconMenu = menuToggle.innerHTML;
    var iconClose =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x size-5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
    var setMenu = function (open) {
      menu.hidden = !open;
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      menuToggle.innerHTML = open ? iconClose : iconMenu;
    };
    setMenu(false);
    menuToggle.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setMenu(false);
      });
    });
  }

  /* ------------------- barra fixa de WhatsApp ------------------ */
  var sticky = document.querySelectorAll("[data-sticky]");
  function onScrollSticky() {
    var show = window.scrollY > 620;
    sticky.forEach(function (el) {
      el.classList.toggle("translate-y-full", !show);
      el.classList.toggle("translate-y-0", show);
    });
  }

  window.addEventListener(
    "scroll",
    function () {
      onScrollHeader();
      onScrollSticky();
    },
    { passive: true },
  );
  onScrollHeader();
  onScrollSticky();

  /* ------------------ reveal ao rolar a página ----------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.setAttribute("data-visible", "true");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  }

  /* -------------- carrossel de antes e depois ------------------ */
  var adImg = document.querySelector("[data-ad-img]");
  var adPrev = document.querySelector("[data-ad-prev]");
  var adNext = document.querySelector("[data-ad-next]");
  var adCount = document.querySelector("[data-ad-count]");
  var slides = (window.__LP__ && window.__LP__.antesDepois) || [];
  var index = 0;
  function renderSlide() {
    if (!adImg || !slides.length) return;
    adImg.src = slides[index];
    adImg.alt =
      "Antes e depois de tratamento estético — registro " + (index + 1) + " de " + slides.length;
    if (adCount) adCount.textContent = index + 1 + " / " + slides.length;
  }
  function go(dir) {
    index = (index + dir + slides.length) % slides.length;
    renderSlide();
  }
  if (adPrev) adPrev.addEventListener("click", function () { go(-1); });
  if (adNext) adNext.addEventListener("click", function () { go(1); });
  if (adImg && slides.length) {
    renderSlide();
    // navegação por teclado quando o carrossel está em foco
    adImg.parentElement.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    });
  }

  /* -------------------------- FAQ ----------------------------- */
  var faqButtons = document.querySelectorAll("[data-faq-btn]");
  function closeFaq(btn) {
    btn.setAttribute("aria-expanded", "false");
    var panel = btn.parentElement.querySelector("[data-faq-panel]");
    if (panel) {
      panel.classList.remove("grid-rows-[1fr]", "pb-6", "opacity-100");
      panel.classList.add("grid-rows-[0fr]", "opacity-0");
    }
    var underline = btn.querySelector("span span");
    if (underline) {
      underline.classList.remove("scale-x-100");
      underline.classList.add("scale-x-0", "group-hover:scale-x-100", "group-focus-visible:scale-x-100");
    }
    var svg = btn.querySelector("svg");
    if (svg) {
      svg.classList.remove("rotate-45");
      svg.classList.add("faq-pulse");
    }
  }
  faqButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      faqButtons.forEach(closeFaq);
      if (isOpen) return;
      btn.setAttribute("aria-expanded", "true");
      var panel = btn.parentElement.querySelector("[data-faq-panel]");
      if (panel) {
        panel.classList.remove("grid-rows-[0fr]", "opacity-0");
        panel.classList.add("grid-rows-[1fr]", "pb-6", "opacity-100");
      }
      var underline = btn.querySelector("span span");
      if (underline) {
        underline.classList.remove("scale-x-0", "group-hover:scale-x-100", "group-focus-visible:scale-x-100");
        underline.classList.add("scale-x-100");
      }
      var svg = btn.querySelector("svg");
      if (svg) {
        svg.classList.remove("faq-pulse");
        svg.classList.add("rotate-45");
      }
    });
  });

  /* -------------------- modal de vídeo ------------------------ */
  var modal = document.getElementById("video-modal");
  var lastFocus = null;

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  function openModal(data) {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.className =
      "fixed inset-0 z-[70] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", data.title);
    modal.innerHTML =
      '<div tabindex="-1" class="relative w-full max-w-md outline-none">' +
      '<button type="button" data-close aria-label="Fechar vídeo" class="absolute -top-14 right-0 grid size-12 place-items-center rounded-full border border-ink-foreground/30 text-ink-foreground transition-colors hover:bg-ink-foreground/10">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>' +
      "</button>" +
      '<video src="' + data.src + '" poster="' + data.poster + '" controls autoplay playsinline preload="metadata" class="max-h-[80vh] w-full rounded-2xl bg-ink shadow-lift"></video>' +
      '<p class="mt-4 text-center text-sm text-ink-foreground/80">' + data.caption + "</p>" +
      "</div>";
    document.body.style.overflow = "hidden";
    modal.querySelector("[tabindex]").focus();
    modal.querySelector("[data-close]").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    track("video_open", { video_id: data.id });
  }

  document.querySelectorAll("[data-video-src]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal({
        src: btn.getAttribute("data-video-src"),
        poster: btn.getAttribute("data-video-poster"),
        title: btn.getAttribute("data-video-title"),
        caption: btn.getAttribute("data-video-caption"),
        id: btn.getAttribute("data-video-id"),
      });
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
  });
})();
