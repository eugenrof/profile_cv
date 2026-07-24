/**
 * Navigation Options and Configurations
 */
const tabOrder = ['about', 'experience', 'portfolio', 'projects', 'skills', 'education', 'certifications'];
const mobileToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.getElementById('main-nav');

/**
 * Mobile Menu Toggle Handler
 */
if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        mobileToggle.classList.toggle('open');
    });
}

/**
 * Clean Smooth Navigation and Scrollspy System
 */
const sections = document.querySelectorAll('section.tab-content');
const navTabs = document.querySelectorAll('.tabs .tab');

// Smooth scrolling click logic
navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = tab.getAttribute('href').replace('#', '');
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            // Collapse mobile menu upon selection if expanded
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if (mobileToggle) mobileToggle.classList.remove('open');
            }

            // Smooth scroll with an offset to keep the sticky terminal frame clean
            const targetOffset = targetSection.getBoundingClientRect().top + window.scrollY - 140;
            window.scrollTo({
                top: targetOffset,
                behavior: 'smooth'
            });

            // Update URL cleanly without aggressive snapping
            history.pushState(null, null, `#${targetId}`);
        }
    });
});

// Scrollspy Logic: Highlights items dynamically depending on active window viewpoint
function scrollSpy() {
    let currentSectionId = 'about';
    const triggerOffset = 180; // Triggers active highlight a little before passing the section top boundary

    sections.forEach(section => {
        const sectionTop = section.offsetTop - triggerOffset;
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.getAttribute('id');
        }
    });

    navTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('href') === `#${currentSectionId}`) {
            tab.classList.add('active');
        }
    });
}

window.addEventListener('scroll', scrollSpy);

/**
 * Back to Top Button Logic
 */
const bttBtn = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        if (bttBtn) bttBtn.style.display = "block";
    } else {
        if (bttBtn) bttBtn.style.display = "none";
    }
});

if (bttBtn) {
    bttBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Theme Toggle Engine with LocalStorage Persistence
 * Updated for Checkbox and Slider Layout
 */
const toggleInput = document.getElementById("theme-toggle");

function updateThemeUI(isLight) {
    if (toggleInput) {
        toggleInput.checked = isLight;
    }
}

// Initial Sync
const savedTheme = localStorage.getItem("theme");
const isLightInitially = (savedTheme === "light");

if (isLightInitially) {
    document.body.classList.add("light");
} else {
    document.body.classList.remove("light");
}
updateThemeUI(isLightInitially);

// Event Listener for modern input switch change
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
 * Smooth Horizontal Scrollable Portfolio System with Dynamic Button States
 */
document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.querySelector('.carousel-viewport');
    const prevBtn = document.querySelector('.carousel-btn.prev-btn');
    const nextBtn = document.querySelector('.carousel-btn.next-btn');

    if (viewport && prevBtn && nextBtn) {
        function updateButtonStates() {
            const scrollLeft = viewport.scrollLeft;
            const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

            // Disable prev button if at the far left
            if (scrollLeft <= 2) {
                prevBtn.setAttribute('disabled', 'true');
                prevBtn.style.opacity = '0.3';
                prevBtn.style.cursor = 'not-allowed';
            } else {
                prevBtn.removeAttribute('disabled');
                prevBtn.style.opacity = '1';
                prevBtn.style.cursor = 'pointer';
            }

            // Disable next button if at the far right
            if (scrollLeft >= maxScrollLeft - 2) {
                nextBtn.setAttribute('disabled', 'true');
                nextBtn.style.opacity = '0.3';
                nextBtn.style.cursor = 'not-allowed';
            } else {
                nextBtn.removeAttribute('disabled');
                nextBtn.style.opacity = '1';
                nextBtn.style.cursor = 'pointer';
            }
        }

        // Attach click handlers for smooth scrolling
        prevBtn.addEventListener('click', () => {
            viewport.scrollBy({ left: -330, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            viewport.scrollBy({ left: 330, behavior: 'smooth' });
        });

        // Update states on scroll and window resize
        viewport.addEventListener('scroll', updateButtonStates);
        window.addEventListener('resize', updateButtonStates);

        // Initial check on load
        updateButtonStates();
    }
});

/**
 * Background Network Canvas Animation
 */
const canvas = document.getElementById("background-canvas");
if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor() { this.reset(); }
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
            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = document.body.classList.contains('light') ? 'rgba(58, 134, 255, 0.2)' : 'rgba(76, 201, 240, 0.4)';
            ctx.fill();
        }
    }
    const particles = Array.from({ length: 80 }, () => new Particle());

    function drawNetwork() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.move(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = document.body.classList.contains('light') ? 'rgba(58,134,255,' + (0.15 - dist / 400) + ')' : 'rgba(58,134,255,' + (0.3 - dist / 400) + ')';
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
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    if (hash) {
        const targetSection = document.getElementById(hash.replace('#', ''));
        if (targetSection) {
            setTimeout(() => {
                const targetOffset = targetSection.getBoundingClientRect().top + window.scrollY - 140;
                window.scrollTo({ top: targetOffset, behavior: 'smooth' });
            }, 100);
        }
    } else {
        window.scrollTo(0, 0);
    }
    scrollSpy();
});
