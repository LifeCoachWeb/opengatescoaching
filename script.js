const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const year = document.querySelector("#current-year");
const revealElements = document.querySelectorAll(".reveal");
const accordionTriggers = document.querySelectorAll(".accordion-trigger");
const navigationLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const desktopMenuQuery = window.matchMedia("(min-width: 901px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let menuReturnTarget = null;

if (year) {
  year.textContent = String(new Date().getFullYear());
}

function isMenuOpen() {
  return Boolean(navigation?.classList.contains("is-open"));
}

function openMenu() {
  if (!menuButton || !navigation) return;

  menuReturnTarget = document.activeElement;
  navigation.classList.add("is-open");
  document.body.classList.add("menu-open");
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Close navigation menu");

  const firstLink = navigation.querySelector("a");
  firstLink?.focus();
}

function closeMenu({ returnFocus = false } = {}) {
  if (!menuButton || !navigation) return;

  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");

  if (returnFocus && menuReturnTarget instanceof HTMLElement) {
    menuReturnTarget.focus();
  }
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    if (isMenuOpen()) {
      closeMenu({ returnFocus: true });
    } else {
      openMenu();
    }
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("click", (event) => {
    if (!isMenuOpen()) return;
    if (!(event.target instanceof Node)) return;
    if (navigation.contains(event.target) || menuButton.contains(event.target)) return;

    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen()) {
      closeMenu({ returnFocus: true });
    }
  });

  desktopMenuQuery.addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
}

function updateHeaderState() {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

function showAllRevealElements() {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
  showAllRevealElements();
} else {
  const revealObserver = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -45px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

function getAccordionPanel(trigger) {
  const panelId = trigger.getAttribute("aria-controls");
  return panelId ? document.getElementById(panelId) : null;
}

function closeAccordionItem(trigger) {
  const panel = getAccordionPanel(trigger);
  trigger.setAttribute("aria-expanded", "false");

  if (panel) {
    panel.hidden = true;
  }
}

function openAccordionItem(trigger) {
  const panel = getAccordionPanel(trigger);
  trigger.setAttribute("aria-expanded", "true");

  if (panel) {
    panel.hidden = false;
  }
}

accordionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const willOpen = trigger.getAttribute("aria-expanded") !== "true";

    accordionTriggers.forEach((otherTrigger) => {
      if (otherTrigger !== trigger) {
        closeAccordionItem(otherTrigger);
      }
    });

    if (willOpen) {
      openAccordionItem(trigger);
    } else {
      closeAccordionItem(trigger);
    }
  });
});

if ("IntersectionObserver" in window && navigationLinks.length) {
  const sectionLinkMap = new Map();

  navigationLinks.forEach((link) => {
    const targetId = link.getAttribute("href");
    const section = targetId ? document.querySelector(targetId) : null;

    if (section) {
      sectionLinkMap.set(section, link);
    }
  });

  const navigationObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) return;

      navigationLinks.forEach((link) => {
        link.classList.remove("is-active");
        link.removeAttribute("aria-current");
      });

      const activeLink = sectionLinkMap.get(visibleEntries[0].target);
      activeLink?.classList.add("is-active");
      activeLink?.setAttribute("aria-current", "location");
    },
    {
      rootMargin: "-28% 0px -60% 0px",
      threshold: [0.05, 0.2, 0.5]
    }
  );

  sectionLinkMap.forEach((link, section) => {
    navigationObserver.observe(section);
  });
}
