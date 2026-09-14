/**
 * Navigation Options and Configurations
 */
const tabOrder = [
  "about",
  "experience",
  "portfolio",
  "industries",
  "skills",
  "education",
  "certifications",
];

const mobileToggle = document.getElementById("mobile-menu-toggle");
const mainNav = document.getElementById("main-nav");

/**
 * Mobile Menu Toggle Handler
 */
if (mobileToggle && mainNav) {
  mobileToggle.addEventListener("click", () => {
    mainNav.classList.toggle("active");
    mobileToggle.classList.toggle("open");
  });
}

/**
 * Clean Smooth Navigation and Scrollspy System
 */
const sections = document.querySelectorAll("section.tab-content");
const navTabs = document.querySelectorAll(".tabs .tab");

navTabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();

    const targetId = tab.getAttribute("href").replace("#", "");
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      if (mainNav && mainNav.classList.contains("active")) {
        mainNav.classList.remove("active");

        if (mobileToggle) {
          mobileToggle.classList.remove("open");
        }
      }

      const targetOffset =
        targetSection.getBoundingClientRect().top + window.scrollY - 140;

      window.scrollTo({
        top: targetOffset,
        behavior: "smooth",
      });

      history.pushState(null, null, `#${targetId}`);
    }
  });
});

/**
 * Smooth Scroll for External Contact Anchor Icon/Button
 */
const contactScrollBtn = document.querySelector('a[href="#contact"]:not(.tab)');

if (contactScrollBtn) {
  contactScrollBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const targetSection = document.getElementById("contact");

    if (targetSection) {
      const targetOffset =
        targetSection.getBoundingClientRect().top + window.scrollY - 140;

      window.scrollTo({
        top: targetOffset,
        behavior: "smooth",
      });

      history.pushState(null, null, "#contact");
    }
  });
}

/**
 * Dynamic Contact Form Label Updater
 */
function updateContactLabels(sectionId) {
  const nameLabel = document.querySelector(
    '#contact-form label[for="name"] .label-text',
  );

  const emailLabel = document.querySelector(
    '#contact-form label[for="email"] .label-text',
  );

  const messageLabel = document.querySelector(
    '#contact-form label[for="message"] .label-text',
  );

  if (!nameLabel || !emailLabel || !messageLabel) return;

  let nameText = "name:";
  let emailText = "email:";
  let messageText = "message / scope:";

  switch (sectionId) {
    case "about":
      nameText = "recruiter_name:";
      emailText = "recruiter_email:";
      messageText = "inquiry_background:";
      break;

    case "experience":
      nameText = "hiring_manager:";
      emailText = "company_email:";
      messageText = "role_or_contract_details:";
      break;

    case "portfolio":
    case "industries":
      nameText = "collaborator_name:";
      emailText = "contact_email:";
      messageText = "project_collaboration_idea:";
      break;

    case "skills":
      nameText = "engineer_name:";
      emailText = "tech_lead_email:";
      messageText = "stack_requirements:";
      break;

    case "education":
    case "certifications":
      nameText = "name:";
      emailText = "email:";
      messageText = "message / scope:";
      break;

    default:
      nameText = "name:";
      emailText = "email:";
      messageText = "message / scope:";
  }

  nameLabel.textContent = nameText;
  emailLabel.textContent = emailText;
  messageLabel.textContent = messageText;
}

/**
 * Scrollspy Logic
 */
function scrollSpy() {
  if (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 5
  ) {
    navTabs.forEach((tab) => tab.classList.remove("active"));

    const lastTab = document.querySelector(
      '.tabs .tab[href="#certifications"]',
    );

    if (lastTab) {
      lastTab.classList.add("active");
    }

    updateContactLabels("certifications");
    return;
  }

  let currentSectionId = "about";
  const triggerOffset = 180;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - triggerOffset;

    if (window.scrollY >= sectionTop) {
      currentSectionId = section.getAttribute("id");
    }
  });

  navTabs.forEach((tab) => {
    tab.classList.remove("active");

    if (tab.getAttribute("href") === `#${currentSectionId}`) {
      tab.classList.add("active");
    }
  });

  updateContactLabels(currentSectionId);
}

/**
 * Back to Top Button Logic
 */
const bttBtn = document.getElementById("backToTop");

function toggleBackToTop() {
  if (!bttBtn) return;

  if (window.scrollY > 300) {
    bttBtn.classList.add("show");
  } else {
    bttBtn.classList.remove("show");
  }
}

/**
 * Combined, rAF-throttled scroll handler
 */
let scrollTicking = false;

function onScroll() {
  if (!scrollTicking) {
    scrollTicking = true;

    requestAnimationFrame(() => {
      scrollSpy();
      toggleBackToTop();
      scrollTicking = false;
    });
  }
}

window.addEventListener("scroll", onScroll, {
  passive: true,
});

toggleBackToTop();

if (bttBtn) {
  bttBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/**
 * Theme Toggle Engine
 */
const toggleInput = document.getElementById("theme-toggle");

function updateThemeUI(isLight) {
  if (toggleInput) {
    toggleInput.checked = isLight;
  }
}

const savedTheme = localStorage.getItem("theme");
const isLightInitially = savedTheme === "light";

if (isLightInitially) {
  document.body.classList.add("light");
} else {
  document.body.classList.remove("light");
}

updateThemeUI(isLightInitially);

if (toggleInput) {
  toggleInput.addEventListener("change", (e) => {
    const isNowLight = e.target.checked;

    if (isNowLight) {
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  });
}

/**
 * Smooth Horizontal Scrollable Portfolio System
 *
 * IMPORTANT:
 * The counter treats the actual right edge of the carousel
 * as the final slide. This prevents situations where the last
 * card is fully visible but the counter still reports 07 / 09.
 *
 * NOTE ON FOCUS FIX:
 * We no longer set the real `disabled` attribute on the nav
 * buttons. Toggling `disabled` on a focused element forces the
 * browser to immediately strip focus and scroll the next
 * focusable ancestor into view — on iOS Safari this produces a
 * visible, jarring jump right when a button reaches its edge
 * state (start or end of the carousel). Using `aria-disabled`
 * plus `pointer-events: none` gives the same "can't interact
 * with this" behavior and keeps it accessible, without the
 * browser forcibly yanking focus.
 */
document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.querySelector(".carousel-viewport");
  const prevBtn = document.querySelector(".carousel-btn.prev-btn");
  const nextBtn = document.querySelector(".carousel-btn.next-btn");
  const counter = document.getElementById("carouselCounter");
  const slides = document.querySelectorAll(".carousel-slide");

  if (viewport && prevBtn && nextBtn && counter && slides.length) {
    function updateCarousel() {
      const scrollLeft = viewport.scrollLeft;
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

      /**
       * Previous button
       */
      if (scrollLeft <= 2) {
        prevBtn.setAttribute("aria-disabled", "true");
        prevBtn.style.pointerEvents = "none";
        prevBtn.style.visibility = "hidden";
        prevBtn.style.opacity = "0";
        prevBtn.style.cursor = "not-allowed";
        prevBtn.blur();
      } else {
        prevBtn.removeAttribute("aria-disabled");
        prevBtn.style.pointerEvents = "auto";
        prevBtn.style.visibility = "visible";
        prevBtn.style.opacity = "1";
        prevBtn.style.cursor = "pointer";
      }

      /**
       * Next button
       */
      if (scrollLeft >= maxScrollLeft - 2) {
        nextBtn.setAttribute("aria-disabled", "true");
        nextBtn.style.pointerEvents = "none";
        nextBtn.style.visibility = "hidden";
        nextBtn.style.opacity = "0";
        nextBtn.style.cursor = "not-allowed";
        nextBtn.blur();
      } else {
        nextBtn.removeAttribute("aria-disabled");
        nextBtn.style.pointerEvents = "auto";
        nextBtn.style.visibility = "visible";
        nextBtn.style.opacity = "1";
        nextBtn.style.cursor = "pointer";
      }

      /**
       * Determine active slide.
       *
       * At the absolute right edge, force the final slide.
       * This is the important fix.
       */
      let currentIndex = 0;

      if (scrollLeft >= maxScrollLeft - 2) {
        currentIndex = slides.length - 1;
      } else {
        let smallestDistance = Infinity;

        slides.forEach((slide, index) => {
          const distance = Math.abs(slide.offsetLeft - scrollLeft);

          if (distance < smallestDistance) {
            smallestDistance = distance;
            currentIndex = index;
          }
        });
      }

      /**
       * Update counter
       */
      counter.textContent = `[${String(currentIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}]`;
    }

    /**
     * Brief yellow "tap" flash that clears itself after a
     * short delay, regardless of how long the button was pressed.
     */
    function flashTapActive(btn) {
      btn.classList.remove("tap-active");

      // Force reflow so the removed class re-triggers cleanly
      // if the button is tapped again quickly.
      void btn.offsetWidth;

      btn.classList.add("tap-active");

      clearTimeout(btn._tapTimeout);

      btn._tapTimeout = setTimeout(() => {
        btn.classList.remove("tap-active");
      }, 500);
    }

    /**
     * Previous button
     */
    prevBtn.addEventListener("click", () => {
      viewport.scrollBy({
        left: -330,
        behavior: "smooth",
      });

      flashTapActive(prevBtn);
      prevBtn.blur();
    });

    /**
     * Next button
     */
    nextBtn.addEventListener("click", () => {
      viewport.scrollBy({
        left: 330,
        behavior: "smooth",
      });

      flashTapActive(nextBtn);
      nextBtn.blur();
    });

    /**
     * Update counter/buttons while scrolling
     */
    viewport.addEventListener("scroll", updateCarousel);

    window.addEventListener("resize", updateCarousel);

    /**
     * Initial state
     */
    updateCarousel();
  }
});

/**
 * Contact Form Submission via Formspree
 */
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");
const submitBtnText = document.getElementById("submit-btn-text");

const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const messageField = document.getElementById("message");

function updateSubmitState() {
  if (!submitBtn || !nameField || !emailField || !messageField) {
    return;
  }

  const nameOk = nameField.value.trim().length > 0 && nameField.checkValidity();

  const emailOk =
    emailField.value.trim().length > 0 && emailField.checkValidity();

  const hasMessage = messageField.value.trim().length > 0;

  submitBtn.disabled = !(nameOk && emailOk && hasMessage);
}

if (nameField && emailField && messageField) {
  [nameField, emailField, messageField].forEach((field) => {
    field.addEventListener("input", updateSubmitState);
  });

  updateSubmitState();
}

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const originalText = submitBtnText.textContent;

    submitBtn.disabled = true;
    submitBtnText.textContent = "Sending...";

    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        formStatus.textContent =
          "> message_sent: 200 OK ✓ Thanks — I'll get back to you soon.";

        formStatus.classList.add("success");

        contactForm.reset();
      } else {
        const data = await response.json().catch(() => null);

        const errMsg =
          data && data.errors
            ? data.errors.map((err) => err.message).join(", ")
            : "Something went wrong.";

        formStatus.textContent = `> error: ${errMsg}`;

        formStatus.classList.add("error");
      }
    } catch (err) {
      formStatus.textContent =
        "> error: network_failure — please try again or email me directly.";

      formStatus.classList.add("error");
    } finally {
      submitBtnText.textContent = originalText;

      updateSubmitState();
    }
  });
}

/**
 * Background Network Canvas Animation
 */
const canvas = document.getElementById("background-canvas");

if (canvas) {
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);

  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;

    height = canvas.height = window.innerHeight;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;

      this.y = Math.random() * height;

      this.vx = (Math.random() - 0.5) * 0.5;

      this.vy = (Math.random() - 0.5) * 0.5;

      this.radius = 2 + Math.random() * 2;
    }

    move() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();

      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

      // Updated to use mustard/gold theme colors instead of blue
      ctx.fillStyle = document.body.classList.contains("light")
        ? "rgba(179, 134, 0, 0.25)"
        : "rgba(229, 184, 11, 0.4)";

      ctx.fill();
    }
  }

  const particles = Array.from({ length: 80 }, () => new Particle());

  function drawNetwork() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.move();
      p.draw();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;

        const dy = particles[i].y - particles[j].y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();

          // Updated connecting lines to match the mustard accent cleanly
          ctx.strokeStyle = document.body.classList.contains("light")
            ? "rgba(179,134,0," + (0.15 - dist / 400) + ")"
            : "rgba(229,184,11," + (0.25 - dist / 500) + ")";

          ctx.lineWidth = 1;

          ctx.moveTo(particles[i].x, particles[i].y);

          ctx.lineTo(particles[j].x, particles[j].y);

          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawNetwork);
  }

  drawNetwork();
}

/**
 * Handle Initial Load and Clean Navigation Jumps
 */
document.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash;

  if (hash) {
    const targetSection = document.getElementById(hash.replace("#", ""));

    if (targetSection) {
      setTimeout(() => {
        const targetOffset =
          targetSection.getBoundingClientRect().top + window.scrollY - 140;

        window.scrollTo({
          top: targetOffset,
          behavior: "smooth",
        });
      }, 100);
    }
  } else {
    window.scrollTo(0, 0);
  }

  scrollSpy();
});

/**
 * Close Mobile Menu When Clicking Outside
 */
document.addEventListener("click", (event) => {
  const menu = document.querySelector(".tabs");

  const toggle = document.querySelector(".mobile-menu-toggle");

  if (
    menu &&
    toggle &&
    menu.classList.contains("active") &&
    !menu.contains(event.target) &&
    !toggle.contains(event.target)
  ) {
    menu.classList.remove("active");
  }
});
