/**
 * Tab and Navigation Configuration
 */
const tabOrder = ['about', 'experience', 'projects', 'skills', 'education', 'certifications'];

/**
 * Tab Switching Logic
 */
function resetAccordions() {
    document.querySelectorAll(".accordion").forEach(acc => {
        acc.classList.remove("active");
        const panel = acc.nextElementSibling;
        if (panel) panel.style.maxHeight = null;
    });
}

function updateNavButtons(currentIndex) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === tabOrder.length - 1;
    }
}

function navigateTab(direction) {
    const activeTabButton = document.querySelector('.tab.active');
    // Fallback to 'about' if no active tab is found
    const currentId = activeTabButton ? activeTabButton.getAttribute('data-tab') : 'about';
    let currentIndex = tabOrder.indexOf(currentId);
    
    let nextIndex = currentIndex + direction;
    
    if (nextIndex >= 0 && nextIndex < tabOrder.length) {
        const nextTabId = tabOrder[nextIndex];
        const nextTabButton = document.querySelector(`[data-tab="${nextTabId}"]`);
        openTab(nextTabId, nextTabButton);
        
        // Scroll smoothly to the top of the terminal container
        document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
    }
}

function openTab(id, el) {
    const main = document.getElementById('terminal-window');
    main.style.opacity = '0';
    main.style.transform = 'translateY(10px)'; 
    
    resetAccordions(); 
    
    setTimeout(() => {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        
        const targetSection = document.getElementById(id);
        if (targetSection) targetSection.classList.add('active');
        
        // If el is not provided (e.g., called via pagination), find the button
        const btn = el || document.querySelector(`[data-tab="${id}"]`);
        if (btn) btn.classList.add('active');
        
        // Update pagination buttons state
        updateNavButtons(tabOrder.indexOf(id));
        
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)'; 
    }, 200);
}

/**
 * Back to Top Button Logic
 */
const bttBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        bttBtn.style.display = "block";
    } else {
        bttBtn.style.display = "none";
    }
});

if (bttBtn) {
    bttBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Accordion Logic
 */
document.querySelectorAll(".accordion").forEach(acc => {
    acc.addEventListener("click", () => {
        acc.classList.toggle("active");
        const panel = acc.nextElementSibling;
        panel.style.maxHeight = panel.style.maxHeight ? null : panel.scrollHeight + "px";
    });
});

/**
 * Theme Toggle
 */
const toggle = document.getElementById("theme-toggle");
if (toggle) {
    toggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        toggle.textContent = document.body.classList.contains("light") ? "☾ Dark Theme" : "☀︎ Light Theme";
    });
}

/**
 * Background Network Animation
 */
const canvas = document.getElementById("background-canvas");
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
        if(this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = document.body.classList.contains('light') ? 'rgba(58, 134, 255, 0.2)' : 'rgba(76, 201, 240, 0.4)';
        ctx.fill();
    }
}

const particles = Array.from({length: 80}, () => new Particle());

function drawNetwork() {
    ctx.clearRect(0,0,width,height);
    particles.forEach(p => { p.move(); p.draw(); });
    for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 120){
                ctx.beginPath();
                ctx.strokeStyle = document.body.classList.contains('light') ? 'rgba(58,134,255,'+ (0.15 - dist/400) +')' : 'rgba(58,134,255,'+ (0.3 - dist/400) +')';
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

// Initialize the navigation buttons state on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavButtons(0); // Start at 'about' (index 0)
});
