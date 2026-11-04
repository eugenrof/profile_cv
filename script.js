/**
 * Eugen Rof | QA Engineering Portfolio
 * Vanilla JavaScript, no dependencies.
 *
 *  1. Theme toggle
 *  2. Top bar height + scrollspy + contextual contact labels
 *  3. Back to top
 *  4. Contact form (Formspree)
 *  5. Interactive terminal
 *  6. Background network canvas
 */
(() => {
  "use strict";

  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------
   * 1. Theme
   * ------------------------------------------------------------------ */
  const themeBtn = $("#theme-toggle");
  let redrawNetwork = () => {};

  const getTheme = () =>
    root.getAttribute("data-theme") === "light" ? "light" : "dark";

  function syncThemeUI() {
    const light = getTheme() === "light";

    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        light ? "Switch to dark theme" : "Switch to light theme",
      );
    }

    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = light ? "#f5f7fa" : "#16181a";
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);

    try {
      localStorage.setItem("theme", theme);
    } catch (err) {
      /* storage can be blocked; the theme still applies for this visit */
    }

    syncThemeUI();
    redrawNetwork();
  }

  syncThemeUI();

  if (themeBtn) {
    themeBtn.addEventListener("click", () =>
      setTheme(getTheme() === "light" ? "dark" : "light"),
    );
  }

  /* ------------------------------------------------------------------
   * 2. Top bar, scrollspy, contextual contact labels
   * ------------------------------------------------------------------ */
  const topbar = $(".topbar");
  const nav = $("#main-nav");
  const navLinks = $$("a", nav);
  const spySections = navLinks
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter(Boolean);

  function syncTopbarHeight() {
    if (topbar) {
      root.style.setProperty("--topbar-h", `${topbar.offsetHeight}px`);
    }
  }

  syncTopbarHeight();

  if ("ResizeObserver" in window && topbar) {
    new ResizeObserver(syncTopbarHeight).observe(topbar);
  } else {
    window.addEventListener("resize", syncTopbarHeight);
  }

  /* mobile / tablet hamburger menu */
  const menuBtn = $("#menu-toggle");
  const menuQuery = window.matchMedia("(max-width: 1180px)");

  function setMenu(open) {
    if (!menuBtn || !nav) return;

    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    syncTopbarHeight();
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () =>
      setMenu(!nav.classList.contains("open")),
    );

    // Close first so the anchor jump uses the collapsed top bar height.
    navLinks.forEach((link) =>
      link.addEventListener("click", () => setMenu(false)),
    );

    document.addEventListener("click", (e) => {
      if (
        nav.classList.contains("open") &&
        !nav.contains(e.target) &&
        !menuBtn.contains(e.target)
      ) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });

    menuQuery.addEventListener("change", (e) => {
      if (!e.matches) setMenu(false);
    });
  }

  const contactLabels = {
    about: ["recruiter_name:", "recruiter_email:", "inquiry_background:"],
    experience: [
      "hiring_manager:",
      "company_email:",
      "role_or_contract_details:",
    ],
    portfolio: [
      "collaborator_name:",
      "contact_email:",
      "project_collaboration_idea:",
    ],
    skills: ["engineer_name:", "tech_lead_email:", "stack_requirements:"],
  };

  const defaultLabels = ["name:", "email:", "message / scope:"];

  function updateContactLabels(sectionId) {
    const [n, e, m] = contactLabels[sectionId] || defaultLabels;
    const targets = [
      ['label[for="name"] .label-text', n],
      ['label[for="email"] .label-text', e],
      ['label[for="message"] .label-text', m],
    ];

    targets.forEach(([selector, text]) => {
      const el = $(selector, $("#contact-form") || document);
      if (el && el.textContent !== text) el.textContent = text;
    });
  }

  let currentSpyId = null;

  function centerActiveNavLink(link) {
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;

    nav.scrollTo({
      left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  }

  function scrollSpy() {
    const line = (topbar ? topbar.offsetHeight : 72) + 140;
    let current = null;

    spySections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) current = section.id;
    });

    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    if (atBottom && spySections.length) {
      current = spySections[spySections.length - 1].id;
    }

    if (current === currentSpyId) return;
    currentSpyId = current;

    navLinks.forEach((link) => {
      const active = link.hash === `#${current}`;
      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "true");
        centerActiveNavLink(link);
      } else {
        link.removeAttribute("aria-current");
      }
    });

    updateContactLabels(current);
  }

  /* ------------------------------------------------------------------
   * 3. Back to top + single rAF-throttled scroll handler
   * ------------------------------------------------------------------ */
  const backToTop = $("#backToTop");

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    });
  }

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      scrollSpy();
      if (backToTop) {
        backToTop.classList.toggle("show", window.scrollY > 600);

        // Ride above the footer instead of covering its text.
        const footer = $(".footer");
        const overlap = footer
          ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top)
          : 0;

        backToTop.style.bottom = `${20 + overlap}px`;
      }
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  scrollSpy();
  onScroll();

  /* ------------------------------------------------------------------
   * 4. Contact form (Formspree)
   * ------------------------------------------------------------------ */
  const form = $("#contact-form");

  if (form) {
    const statusEl = $("#form-status");
    const submitBtn = $("#submit-btn");
    const submitText = $("#submit-btn-text");
    const fields = ["name", "email", "message"].map((id) =>
      document.getElementById(id),
    );

    const isValid = () =>
      fields.every((f) => f && f.value.trim().length > 0 && f.checkValidity());

    const syncSubmit = () => {
      submitBtn.disabled = !isValid();
    };

    fields.forEach((f) => f && f.addEventListener("input", syncSubmit));
    syncSubmit();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const originalText = submitText.textContent;
      submitBtn.disabled = true;
      submitText.textContent = "Sending...";
      statusEl.textContent = "";
      statusEl.className = "form-status";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          statusEl.textContent =
            "> message_sent: 200 OK. Thanks, I'll get back to you soon.";
          statusEl.classList.add("success");
          form.reset();
        } else {
          const data = await response.json().catch(() => null);
          const message =
            data && data.errors
              ? data.errors.map((err) => err.message).join(", ")
              : "Something went wrong. Please try again.";

          statusEl.textContent = `> error: ${message}`;
          statusEl.classList.add("error");
        }
      } catch (err) {
        statusEl.textContent =
          "> error: network_failure. Please try again or email me directly.";
        statusEl.classList.add("error");
      } finally {
        submitText.textContent = originalText;
        syncSubmit();
      }
    });
  }

  /* ------------------------------------------------------------------
   * 4b. Portfolio carousel
   *     Uses aria-disabled (not the disabled attribute) so a focused
   *     button never loses focus and makes iOS Safari jump.
   * ------------------------------------------------------------------ */
  function initCarousel() {
    const viewport = $(".carousel-viewport");
    const prevBtn = $(".carousel-btn.prev-btn");
    const nextBtn = $(".carousel-btn.next-btn");
    const counter = $("#carouselCounter");
    const slides = $$(".carousel-slide");
    if (!viewport || !prevBtn || !nextBtn || !counter || !slides.length) return;

    const pad = (n) => String(n).padStart(2, "0");

    function setDisabled(btn, disabled) {
      if (disabled) {
        btn.setAttribute("aria-disabled", "true");
        btn.tabIndex = -1;
      } else {
        btn.removeAttribute("aria-disabled");
        btn.tabIndex = 0;
      }
    }

    function update() {
      const left = viewport.scrollLeft;
      const max = viewport.scrollWidth - viewport.clientWidth;
      const atStart = left <= 2;
      const atEnd = left >= max - 2;

      setDisabled(prevBtn, atStart);
      setDisabled(nextBtn, atEnd);

      let index = 0;

      if (atEnd) {
        index = slides.length - 1;
      } else {
        let best = Infinity;

        slides.forEach((slide, i) => {
          const distance = Math.abs(
            slide.offsetLeft - viewport.offsetLeft - left,
          );

          if (distance < best) {
            best = distance;
            index = i;
          }
        });
      }

      counter.textContent = `[${pad(index + 1)} / ${pad(slides.length)}]`;
    }

    function flash(btn) {
      btn.classList.remove("tap-active");
      void btn.offsetWidth;
      btn.classList.add("tap-active");
      clearTimeout(btn._tapTimer);
      btn._tapTimer = setTimeout(() => btn.classList.remove("tap-active"), 450);
    }

    function step(direction) {
      const gap =
        parseFloat(getComputedStyle(slides[0].parentElement).columnGap) || 20;
      const amount = slides[0].offsetWidth + gap;

      viewport.scrollBy({
        left: direction * amount,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    }

    prevBtn.addEventListener("click", () => {
      step(-1);
      flash(prevBtn);
    });

    nextBtn.addEventListener("click", () => {
      step(1);
      flash(nextBtn);
    });

    viewport.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  initCarousel();

  /* ------------------------------------------------------------------
   * 5. Interactive terminal
   *    All content is read from the page itself, so the HTML stays the
   *    single source of truth.
   * ------------------------------------------------------------------ */
  function initTerminal() {
    const term = $("#terminal");
    const out = $("#term-body");
    const termForm = $("#term-form");
    const input = $("#term-cmd");
    if (!term || !out || !termForm || !input) return;

    const cmdHistory = [];
    let historyPos = 0;
    let skip = reduceMotion.matches;
    const pending = new Set();

    /* ---- timing helpers (the intro can be skipped by any interaction) ---- */
    const wait = (ms) =>
      skip
        ? Promise.resolve()
        : new Promise((resolve) => {
            const finish = () => {
              clearTimeout(timer);
              pending.delete(finish);
              resolve();
            };
            const timer = setTimeout(finish, ms);
            pending.add(finish);
          });

    function skipIntro() {
      if (skip) return;
      skip = true;
      [...pending].forEach((finish) => finish());
    }

    term.addEventListener("pointerdown", skipIntro);
    term.addEventListener("keydown", skipIntro);

    /* ---- output ---- */
    const toEnd = () => {
      out.scrollTop = out.scrollHeight;
    };

    /** parts: string | {text, cls?, href?} | array of those */
    function add(parts, cls = "") {
      const row = document.createElement("div");
      row.className = `t-line${cls ? ` ${cls}` : ""}`;

      (Array.isArray(parts) ? parts : [parts]).forEach((part) => {
        if (typeof part === "string") {
          row.append(document.createTextNode(part));
        } else if (part.href) {
          const a = document.createElement("a");
          a.href = part.href;
          a.textContent = part.text;

          if (!part.href.startsWith("#") && !part.href.startsWith("mailto:")) {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
          }

          row.append(a);
        } else {
          const span = document.createElement("span");
          span.className = part.cls || "";
          span.textContent = part.text;
          row.append(span);
        }
      });

      out.append(row);
      toEnd();
      return row;
    }

    const clean = (el) =>
      el ? el.textContent.replace(/\s+/g, " ").trim() : "";

    /* ---- data pulled from the page ---- */
    const getProjects = () =>
      $$(".project").map((el) => {
        const link = $("h3 a", el);

        return {
          name: link.childNodes[0].textContent.trim(),
          sub: clean($(".project-sub", el)),
          href: link.href,
        };
      });

    const sectionAlias = {
      top: "top",
      home: "top",
      about: "about",
      experience: "experience",
      projects: "portfolio",
      portfolio: "portfolio",
      industries: "skills",
      skills: "skills",
      education: "education",
      certs: "certifications",
      certifications: "certifications",
      contact: "contact",
    };

    function go(name) {
      const id = sectionAlias[String(name || "").toLowerCase()];
      const el = id && document.getElementById(id);
      if (!el) return false;

      if (id === "top") {
        window.scrollTo({
          top: 0,
          behavior: reduceMotion.matches ? "auto" : "smooth",
        });
      } else {
        el.scrollIntoView({
          behavior: reduceMotion.matches ? "auto" : "smooth",
          block: "start",
        });
      }

      return true;
    }

    /* ---- commands ---- */
    const commands = {
      help() {
        add("Available commands", "t-dim");

        [
          ["whoami", "who is this"],
          ["about", "short summary"],
          ["experience", "career timeline"],
          ["projects", "list my tools"],
          ["open <n>", "open project name"],
          ["skills", "list of skills"],
          ["certs", "certifications"],
          ["contact", "how to reach me"],
          ["goto <section>", "scroll to section"],
          ["npm test", "run portfolio checks"],
          ["theme [dark|light]", "switch theme"],
          ["clear", "clear the screen"],
        ].forEach(([name, desc]) =>
          add([{ text: `  ${name.padEnd(21)}`, cls: "t-key" }, desc]),
        );
      },

      whoami() {
        add("Eugen Rof");
        add("Senior QA Automation Engineer, PSM II Scrum Master");
        add("Cluj-Napoca, Romania", "t-dim");
      },

      about() {
        $$(".about-list li").forEach((li) => add(`> ${clean(li)}`));
      },

      experience() {
        $$(".job").forEach((job) => {
          add([{ text: clean($(".job-when", job)), cls: "t-dim" }]);
          add([
            { text: `  ${clean($("h3", job))}`, cls: "t-key" },
            ` @ ${clean($(".job-company", job))}`,
          ]);
        });
      },

      projects() {
        getProjects().forEach((p, i) =>
          add([
            { text: `${String(i + 1).padStart(2, "0")} `, cls: "t-dim" },
            { text: p.name.padEnd(30).slice(0, 30), cls: "t-key" },
            p.sub,
          ]),
        );
        add("Run `open <n>` to launch one.", "t-dim");
      },

      open(args) {
        const list = getProjects();

        if (!args.length) {
          add(
            "usage: open <number|name>. Run projects to see the list.",
            "t-err",
          );
          return;
        }

        const query = args.join(" ").toLowerCase();
        const match = /^\d+$/.test(query)
          ? list[Number(query) - 1]
          : list.find((p) => p.name.toLowerCase().includes(query));

        if (!match) {
          add(`no project matches "${args.join(" ")}"`, "t-err");
          return;
        }

        add(["opening ", { text: match.name, href: match.href }]);
        window.open(match.href, "_blank", "noopener,noreferrer");
      },

      skills() {
        $$(".skill-group").forEach((group) => {
          add([{ text: clean($(".sub-title", group)), cls: "t-dim" }]);

          $$(".skill-card", group).forEach((card) => {
            const items = $$(".chips li", card).map(clean);
            const langs = $$(".langs li", card).map(
              (li) =>
                `${clean($(".lang-name", li))} (${clean($(".lang-level", li))})`,
            );
            const text = items.length
              ? items.join(", ")
              : langs.length
                ? langs.join(", ")
                : clean($("p", card));

            add([{ text: `  ${clean($("h3", card))}`, cls: "t-key" }]);
            add(`    ${text}`);
          });
        });
      },

      education() {
        $$(".edu").forEach((el) => {
          add([
            { text: clean($(".edu-date", el)), cls: "t-dim" },
            `  ${clean($("h3", el))}`,
          ]);
          add(`  ${clean($(".edu-school", el))}`, "t-dim");
        });
      },

      certs() {
        $$(".cert li a").forEach((a) =>
          add([
            { text: "✓ ", cls: "t-ok" },
            { text: clean(a), href: a.href },
          ]),
        );
      },

      contact() {
        add([
          { text: "email     ", cls: "t-key" },
          { text: "eugenrof@gmail.com", href: "mailto:eugenrof@gmail.com" },
        ]);
        add([
          { text: "linkedin  ", cls: "t-key" },
          {
            text: "linkedin.com/in/eugen-rof",
            href: "https://www.linkedin.com/in/eugen-rof/",
          },
        ]);
        add([
          { text: "github    ", cls: "t-key" },
          { text: "github.com/eugenrof", href: "https://github.com/eugenrof" },
        ]);
        add("Run `goto contact` to jump to the form.", "t-dim");
      },

      cv() {
        add([
          "Opening ",
          { text: "CV_EugenRof.pdf", href: "images/CV_EugenRof.pdf" },
        ]);
      },

      goto(args) {
        if (!args.length) {
          add(`usage: goto <${Object.keys(sectionAlias).join("|")}>`, "t-err");
          return;
        }

        if (go(args[0])) {
          add(`navigating to ${args[0]}`, "t-ok");
        } else {
          add(`unknown section "${args[0]}"`, "t-err");
        }
      },

      ls() {
        add(
          [
            "about",
            "experience",
            "portfolio",
            "skills",
            "education",
            "certifications",
            "contact",
          ]
            .map((n) => `${n}/`)
            .join("  "),
          "t-key",
        );
      },

      theme(args) {
        const wanted = (args[0] || "").toLowerCase();
        const next =
          wanted === "light" || wanted === "dark"
            ? wanted
            : getTheme() === "light"
              ? "dark"
              : "light";

        setTheme(next);
        add(`theme set to ${next}`, "t-ok");
      },

      clear() {
        out.replaceChildren();
      },

      test() {
        const checks = [
          ["about.spec", "4 statements rendered"],
          ["experience.spec", `${$$(".job").length} roles in timeline`],
          ["portfolio.spec", `${getProjects().length - 1} projects linked`],
          ["a11y.spec", "keyboard and screen reader paths"],
          ["theme.spec", "dark and light"],
        ];

        checks.forEach(([file, note]) =>
          add([
            { text: " PASS ", cls: "t-pass" },
            ` ${file}  `,
            { text: note, cls: "t-dim" },
          ]),
        );
        add("Tests: 5 passed, 0 flaky, 0 skipped", "t-ok");
      },

      sudo(args) {
        if (args.join(" ").toLowerCase() === "hire eugen") {
          add("Permission granted. Taking you to the contact form...", "t-ok");
          go("contact");
        } else {
          add(
            "eugen is not in the sudoers file. This incident will be reported.",
            "t-err",
          );
        }
      },
    };

    const aliases = {
      projects: "projects",
      work: "experience",
      cert: "certs",
      certifications: "certs",
      "?": "help",
      pdf: "cv",
    };

    function run(raw) {
      const line = raw.trim();
      if (!line) return;

      add([{ text: "$ ", cls: "t-prompt" }, line], "t-cmd");

      const [first, ...args] = line.split(/\s+/);
      let key = first.toLowerCase();

      if (key === "npm" && (args[0] || "").toLowerCase() === "test") {
        key = "test";
      } else if (Object.hasOwn(aliases, key)) {
        key = aliases[key];
      }

      if (Object.hasOwn(commands, key)) {
        commands[key](args);
      } else {
        add(
          `command not found: ${first}. Type help to list commands.`,
          "t-err",
        );
      }
    }

    /* ---- input handling ---- */
    termForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = input.value;
      input.value = "";

      if (value.trim()) {
        cmdHistory.push(value);
        historyPos = cmdHistory.length;
      }

      run(value);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();

        if (historyPos > 0) {
          historyPos -= 1;
          input.value = cmdHistory[historyPos];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();

        if (historyPos < cmdHistory.length - 1) {
          historyPos += 1;
          input.value = cmdHistory[historyPos];
        } else {
          historyPos = cmdHistory.length;
          input.value = "";
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const typed = input.value.trim().toLowerCase();
        if (!typed || typed.includes(" ")) return;

        const matches = Object.keys(commands).filter((c) =>
          c.startsWith(typed),
        );
        if (matches.length === 1) input.value = `${matches[0]} `;
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        commands.clear();
      }
    });

    $$("[data-cmd]", term).forEach((btn) =>
      btn.addEventListener("click", () => run(btn.dataset.cmd)),
    );

    // On devices with a real pointer, clicking the screen focuses the prompt.
    // On touch devices we skip it so the keyboard doesn't pop up uninvited.
    if (window.matchMedia("(hover: hover)").matches) {
      out.addEventListener("click", () => {
        if (!String(window.getSelection()))
          input.focus({ preventScroll: true });
      });
    }

    /* ---- intro sequence ---- */
    async function typeCommand(text) {
      const row = add([{ text: "$ ", cls: "t-prompt" }], "t-cmd");
      const span = document.createElement("span");
      row.append(span);

      for (const ch of text) {
        span.textContent += ch;
        await wait(45 + Math.random() * 45);
      }

      await wait(260);
      commands[text]();
    }

    (async function intro() {
      out.setAttribute("aria-live", "off");

      await wait(750);
      await typeCommand("whoami");
      await wait(500);
      await typeCommand("help");
      await wait(150);
      add("");
      add("Type a command or tap a shortcut below.", "t-dim");

      out.setAttribute("aria-live", "polite");
    })();
  }

  initTerminal();

  /* ------------------------------------------------------------------
   * 6. Background network canvas
   * ------------------------------------------------------------------ */
  function initNetwork() {
    const canvas = $("#background-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particles = [];
    let rafId = 0;

    const makeParticle = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.2 + Math.random() * 1.8,
    });

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(90, Math.max(28, (w * h) / 20000)));
      particles = Array.from({ length: count }, makeParticle);
    }

    function step() {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      });
    }

    function draw() {
      const light = getTheme() === "light";
      const rgb = light ? "179,134,0" : "229,184,11";
      const dotAlpha = light ? 0.28 : 0.4;
      const lineAlpha = light ? 0.16 : 0.25;
      const reach = 130;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < reach) {
            ctx.strokeStyle = `rgba(${rgb},${lineAlpha * (1 - dist / reach)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(${rgb},${dotAlpha})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      step();
      draw();
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(rafId);

      if (reduceMotion.matches) {
        draw();
      } else {
        rafId = requestAnimationFrame(loop);
      }
    }

    resize();
    start();
    redrawNetwork = () => {
      if (reduceMotion.matches) draw();
    };

    let lastW = w;
    let lastH = h;
    let resizeTimer = 0;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Mobile browsers fire resize when the address bar collapses;
        // ignore small height changes to avoid a visual reset.
        if (
          window.innerWidth !== lastW ||
          Math.abs(window.innerHeight - lastH) > 150
        ) {
          lastW = window.innerWidth;
          lastH = window.innerHeight;
          resize();
          start();
        }
      }, 150);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        start();
      }
    });
  }

  initNetwork();
})();
