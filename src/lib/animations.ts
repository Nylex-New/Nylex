import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const applyScrollReveal = (
  selectorOrElements: string | NodeListOf<Element> | Element[],
) => {
  gsap.registerPlugin(ScrollTrigger);

  let elements: Element[] = [];
  if (typeof selectorOrElements === "string") {
    elements = Array.from(document.querySelectorAll(selectorOrElements));
  } else {
    elements = Array.from(selectorOrElements);
  }

  if (!elements.length) return;

  elements.forEach((item) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
        end: "bottom 50%",
        scrub: true,
      },
    });

    tl.fromTo(
      item,
      { opacity: 0.4, filter: "blur(3px)", scale: 0.98 },
      { opacity: 1, filter: "blur(0px)", scale: 1, duration: 1 },
    ).to(item, { opacity: 1, filter: "blur(0px)", duration: 1 });
  });
};

export const applyWorkCardAnimations = (
  selectorOrElements: string | NodeListOf<Element> | Element[],
) => {
  gsap.registerPlugin(ScrollTrigger);

  let wrappers: Element[] = [];
  if (typeof selectorOrElements === "string") {
    wrappers = Array.from(document.querySelectorAll(selectorOrElements));
  } else {
    wrappers = Array.from(selectorOrElements);
  }

  if (!wrappers.length) return;

  wrappers.forEach((wrapper, index) => {
    const card = wrapper.querySelector(".work-card");

    // Card inertia - only on desktop
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop && card) {
      gsap.fromTo(
        card,
        { y: 120 },
        {
          y: -120,
          ease: "power1.inOut",
          delay: 0.1,
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.2, // 100ms delay
          },
        },
      );
    }

    // Image parallax (faster translation)
    const img = card?.querySelector(".work-img");
    if (img) {
      gsap.fromTo(
        img,
        { yPercent: 8 },
        {
          yPercent: -8,
          ease: "none",
          delay: 0.15,
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5, // 100ms delay
          },
        },
      );

      let clipStart = "inset(1% 5% 0% 15%)";
      if (index % 5 === 0 || index % 5 === 3)
        clipStart = "inset(10% 10% 0% 0%)";
      else if (index % 5 === 1 || index % 5 === 4)
        clipStart = "inset(10% 0% 0% 30%)";

      const imgZone = card?.querySelector(".work-img-zone");
      if (imgZone)
        gsap.fromTo(
          imgZone,
          { clipPath: clipStart },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: wrapper,
              start: "top 44%",
            },
          },
        );
    }
  });
};
