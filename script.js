"use strict";

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const currentYear = document.querySelector("#current-year");
const revealElements = document.querySelectorAll(".reveal");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopQuery = window.matchMedia("(min-width: 901px)");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

function getFocusableElements(container) {
  if (!container) return [];

  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => {
    return !element.hasAttribute("hidden") && element.getClientRects().length > 0;
  });
}

function isMenuOpen() {
  return Boolean(navigation?.classList.contains("is-open"));
}

function openMenu() {
  if (!menuButton || !navigation) return;

  navigation.classList.add("is-open");
  document.body.classList.add("menu-open");
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Close navigation menu");

  const firstFocusableElement = getFocusableElements(navigation)[0];
  window.requestAnimationFrame(() => firstFocusableElement?.focus());
}

function closeMenu({ returnFocus = false } = {}) {
  if (!menuButton || !navigation) return;

  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");

  if (returnFocus) {
    menuButton.focus();
  }
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navigation.addEventListener("click", (event) => {
    const clickedLink = event.target.closest("a");
    if (clickedLink && !desktopQuery.matches) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!isMenuOpen()) return;
    if (navigation.contains(event.target) || menuButton.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (!isMenuOpen()) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ returnFocus: true });
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = [menuButton, ...getFocusableElements(navigation)];
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  const handleDesktopChange = (event) => {
    if (event.matches) {
      closeMenu();
    }
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleDesktopChange);
  } else {
    desktopQuery.addListener(handleDesktopChange);
  }
}

let headerTicking = false;

function updateHeaderState() {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
  headerTicking = false;
}

if (siteHeader) {
  updateHeaderState();

  window.addEventListener(
    "scroll",
    () => {
      if (headerTicking) return;
      headerTicking = true;
      window.requestAnimationFrame(updateHeaderState);
    },
    { passive: true }
  );
}

function showAllRevealElements() {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
  showAllRevealElements();
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  const handleReducedMotionChange = (event) => {
    if (!event.matches) return;
    revealObserver.disconnect();
    showAllRevealElements();
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
  } else {
    reducedMotionQuery.addListener(handleReducedMotionChange);
  }
}

if (document.body.dataset.page === "home" && "IntersectionObserver" in window) {
  const navigationLinks = Array.from(
    document.querySelectorAll('.site-nav a[href^="#"]:not(.nav-cta)')
  );

  const sectionLinks = navigationLinks
    .map((link) => {
      const selector = link.getAttribute("href");
      const section = selector ? document.querySelector(selector) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (sectionLinks.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        sectionLinks.forEach(({ link, section }) => {
          const isCurrent = section === visibleEntry.target;
          link.classList.toggle("is-active", isCurrent);

          if (isCurrent) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      {
        rootMargin: "-30% 0px -58% 0px",
        threshold: [0.05, 0.25, 0.5]
      }
    );

    sectionLinks.forEach(({ section }) => sectionObserver.observe(section));
  }
}
