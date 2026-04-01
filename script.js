async function loadPartial(targetId, file) {
  const mount = document.getElementById(targetId);
  if (!mount) return null;

  try {
    const response = await fetch(file);
    mount.innerHTML = await response.text();
    return mount;
  } catch (error) {
    console.error(`Error loading ${file}:`, error);
    return null;
  }
}

function setupNavigation(headerMount) {
  if (!headerMount) return;

  const toggle = headerMount.querySelector(".nav-toggle");
  const nav = headerMount.querySelector("#site-nav");
  const links = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
    document.body.classList.remove("nav-open");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open", !expanded);
      document.body.classList.toggle("nav-open", !expanded);
    });
  }

  const setActiveLink = () => {
    const currentHash = window.location.hash || "#home";
    let activeId = currentHash;

    if (!window.location.hash) {
      const offset = 96;
      for (const section of sections) {
        if (window.scrollY + offset >= section.offsetTop) {
          activeId = `#${section.id}`;
        }
      }
    }

    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === activeId);
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      window.requestAnimationFrame(() => {
        setActiveLink();
        closeMenu();
      });
    });
  });

  window.addEventListener("hashchange", setActiveLink);
  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();
}

function setupFooter(footerMount) {
  if (!footerMount) return;
  const year = footerMount.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
}

function setupReleaseSlider() {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".release-slide"));
  const arrows = Array.from(slider.querySelectorAll("[data-slider-direction]"));
  const dots = Array.from(document.querySelectorAll("[data-slider-dot]"));
  if (!slides.length) return;

  let currentIndex = 0;
  let timerId;

  const render = (nextIndex) => {
    currentIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === currentIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });
  };

  const restartAutoPlay = () => {
    window.clearInterval(timerId);
    timerId = window.setInterval(() => {
      render(currentIndex + 1);
    }, 5000);
  };

  arrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
      render(currentIndex + Number(arrow.dataset.sliderDirection || 0));
      restartAutoPlay();
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      render(Number(dot.dataset.sliderDot || 0));
      restartAutoPlay();
    });
  });

  slider.addEventListener("mouseenter", () => window.clearInterval(timerId));
  slider.addEventListener("mouseleave", restartAutoPlay);
  slider.addEventListener("focusin", () => window.clearInterval(timerId));
  slider.addEventListener("focusout", restartAutoPlay);

  render(0);
  restartAutoPlay();
}

document.addEventListener("DOMContentLoaded", async () => {
  const [headerMount, footerMount] = await Promise.all([
    loadPartial("site-header", "header.html"),
    loadPartial("site-footer", "footer.html"),
  ]);

  setupNavigation(headerMount);
  setupFooter(footerMount);
  setupReleaseSlider();
});
