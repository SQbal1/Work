/* --------------------------------------------------------------------------
   Ride X — motion layer (Claude Code)

   Higher-order choreography on top of the base CSS/IntersectionObserver
   system in script.js. Everything here is progressive enhancement:

     - If GSAP fails to load (CDN blocked, offline) the site keeps every
       existing animation and loses only the scroll-linked extras.
     - Reduced-motion visitors get none of it.
     - Each init bails when its section isn't on the current page, so this
       single file is safe to include site-wide.

   Structure: initHeaderBehavior (vanilla, always) → initAnimations (GSAP).
   -------------------------------------------------------------------------- */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     Header: settle bookkeeping + compact-viewport auto-hide.
     `has-settled` releases the entrance animation's fill-mode so the
     transform can transition again; below 900px the bar then slides away on
     downward scroll and returns on the first upward wheel/drag — extra
     reading room on phones without a layout jump.
     ------------------------------------------------------------------------ */
  function initHeaderBehavior() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    window.setTimeout(() => header.classList.add("has-settled"), 700);

    const compact = window.matchMedia("(max-width: 900px)");
    let lastY = window.scrollY;
    let ticking = false;

    const HIDE_AFTER = 160; // px scrolled before hiding is allowed
    const DELTA = 6; // ignore sub-pixel scroll jitter

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const goingDown = y > lastY + DELTA;
      const goingUp = y < lastY - DELTA;

      if (!compact.matches || header.classList.contains("menu-open")) {
        header.classList.remove("is-hidden");
      } else if (goingDown && y > HIDE_AFTER) {
        header.classList.add("is-hidden");
      } else if (goingUp || y <= HIDE_AFTER) {
        header.classList.remove("is-hidden");
      }

      if (goingDown || goingUp) lastY = y;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );

    // Leaving compact mode must never strand a hidden header.
    compact.addEventListener?.("change", () => {
      if (!compact.matches) header.classList.remove("is-hidden");
    });
  }

  /* ------------------------------------------------------------------------
     GSAP scroll choreography.
     ------------------------------------------------------------------------ */
  function initAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();

    /* How-it-works: the connector line draws with scroll progress and each
       step's numeral "arrives" as the line reaches it — the process reads as
       a journey rather than four cards that happen to be in a row. */
    const timeline = document.querySelector(".timeline-list");
    if (timeline) {
      const steps = Array.from(timeline.querySelectorAll("article"));
      timeline.classList.add("gsap-scrub");
      timeline.style.setProperty("--line-p", "0");

      gsap.to(timeline, {
        "--line-p": "1",
        ease: "none",
        scrollTrigger: {
          trigger: timeline,
          start: "top 76%",
          end: "bottom 58%",
          scrub: 0.6,
          onUpdate(self) {
            steps.forEach((step, index) => {
              step.classList.toggle(
                "is-reached",
                self.progress >= (index + 0.55) / steps.length
              );
            });
          }
        }
      });
    }

    /* Why-section route spine: the vertical navy→red line beside the promise
       cards draws with scroll progress, so the three assurances read as stops
       being reached on a route. Desktop only — the spine CSS itself only
       renders ≥981px; without GSAP the CSS default keeps it fully drawn. */
    mm.add("(min-width: 981px)", () => {
      const whyList = document.querySelector(".why-list");
      if (!whyList) return;

      whyList.classList.add("gsap-spine");
      whyList.style.setProperty("--why-p", "0");

      gsap.to(whyList, {
        "--why-p": "1",
        ease: "none",
        scrollTrigger: {
          trigger: whyList,
          start: "top 78%",
          end: "bottom 62%",
          scrub: 0.6
        }
      });

      return () => {
        whyList.classList.remove("gsap-spine");
        whyList.style.removeProperty("--why-p");
      };
    });

    /* Vehicle showcase: copy and photo stage drift on opposing axes while
       the band crosses the viewport — quiet depth, desktop only. */
    mm.add("(min-width: 1021px)", () => {
      const showcase = document.querySelector(".vehicle-showcase");
      if (!showcase) return;

      const drift = (target, from, to) =>
        gsap.fromTo(
          target,
          { y: from },
          {
            y: to,
            ease: "none",
            scrollTrigger: {
              trigger: showcase,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8
            }
          }
        );

      drift(".vehicle-stage", 28, -28);
      drift(".vehicle-copy", 12, -12);
    });

    /* About hero: the photograph eases downward slightly slower than the
       scroll, the classic settled-parallax of premium marketing pages.
       The image's CSS entrance animation (fill-mode: both) would pin the
       transform over GSAP's inline style, so the parallax takes over only
       after the entrance finishes — its keyframes end at the identity
       transform, making the handoff invisible. */
    const aboutHeroBg = document.querySelector(".about-hero-bg");
    if (aboutHeroBg) {
      const attachParallax = () => {
        aboutHeroBg.style.animation = "none";
        gsap.to(aboutHeroBg, {
          y: 64,
          ease: "none",
          scrollTrigger: {
            trigger: aboutHeroBg.closest(".about-hero") || aboutHeroBg,
            start: "top top",
            end: "bottom top",
            scrub: 0.7
          }
        });
      };

      let attached = false;
      const once = () => {
        if (attached) return;
        attached = true;
        attachParallax();
      };
      aboutHeroBg.addEventListener("animationend", once, { once: true });
      window.setTimeout(once, 2200); // fallback if the event never fires
    }

    /* Magnetic CTAs: primary buttons lean a few pixels toward the cursor and
       spring home on leave. Uses the `translate` CSS property (via vars) so
       the existing transform-based hover lift and press states compose. */
    mm.add("(min-width: 1021px) and (hover: hover) and (pointer: fine)", () => {
      const PULL = 0.16;
      const MAX = 5;
      const clamp = gsap.utils.clamp(-MAX, MAX);
      const buttons = document.querySelectorAll(
        ".hero-actions .button, .vehicle-actions .button, .cta-panel .button, .final-quote-cta .button, .service-detail-main .button, .submit-button"
      );

      const handlers = [];
      buttons.forEach((button) => {
        button.style.setProperty("--mag-x", "0px");
        button.style.setProperty("--mag-y", "0px");

        const move = (event) => {
          const rect = button.getBoundingClientRect();
          const x = clamp((event.clientX - rect.left - rect.width / 2) * PULL);
          const y = clamp((event.clientY - rect.top - rect.height / 2) * PULL);
          gsap.to(button, {
            "--mag-x": `${x}px`,
            "--mag-y": `${y}px`,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto"
          });
        };

        const reset = () =>
          gsap.to(button, {
            "--mag-x": "0px",
            "--mag-y": "0px",
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto"
          });

        button.addEventListener("pointermove", move, { passive: true });
        button.addEventListener("pointerleave", reset, { passive: true });
        handlers.push({ button, move, reset });
      });

      return () => {
        handlers.forEach(({ button, move, reset }) => {
          button.removeEventListener("pointermove", move);
          button.removeEventListener("pointerleave", reset);
          reset();
        });
      };
    });

    /* The language toggle swaps every string and flips direction, which
       changes layout heights — recompute trigger positions afterwards. */
    new MutationObserver(() => {
      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
  }

  initHeaderBehavior();
  if (!reduceMotion) initAnimations();
})();
