const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const year = document.querySelector("#current-year");
const revealElements = document.querySelectorAll(".reveal");
const accordionTriggers = document.querySelectorAll(".accordion-trigger");
const navigationLinks = document.querySelectorAll('.site-nav a[href^="#"]:not(.nav-cta)');

if (year) {
  year.textContent = new Date().getFullYear();
}

function closeMenu() {
  if (!menuButton || !navigation) return;

  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");

    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!navigation.classList.contains("is-open")) return;
    if (navigation.contains(event.target) || menuButton.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
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

if ("IntersectionObserver" in window) {
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
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

function closeAccordionItem(trigger) {
  const panelId = trigger.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;

  trigger.setAttribute("aria-expanded", "false");
  if (panel) panel.hidden = true;
}

function openAccordionItem(trigger) {
  const panelId = trigger.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;

  trigger.setAttribute("aria-expanded", "true");
  if (panel) panel.hidden = false;
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
  const sectionMap = new Map();

  navigationLinks.forEach((link) => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;

    if (target) {
      sectionMap.set(target, link);
    }
  });

  const navigationObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) return;

      navigationLinks.forEach((link) => link.classList.remove("is-active"));
      sectionMap.get(visibleEntries[0].target)?.classList.add("is-active");
    },
    {
      rootMargin: "-28% 0px -60% 0px",
      threshold: [0.05, 0.2, 0.5]
    }
  );

  sectionMap.forEach((link, section) => {
    navigationObserver.observe(section);
  });
}
