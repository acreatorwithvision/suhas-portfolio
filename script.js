const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const canvas = document.getElementById("signalCanvas");
const ctx = canvas.getContext("2d");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0;
let height = 0;
let nodes = [];
let animationFrame = null;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createNodes();
}

function createNodes() {
  const count = Math.max(26, Math.min(74, Math.floor(width / 18)));
  nodes = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    radius: index % 7 === 0 ? 2.2 : 1.35,
    tone: index % 5
  }));
}

function drawTelemetry() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];

    if (!prefersReducedMotion) {
      a.x += a.vx;
      a.y += a.vy;
    }

    if (a.x < -20) a.x = width + 20;
    if (a.x > width + 20) a.x = -20;
    if (a.y < -20) a.y = height + 20;
    if (a.y > height + 20) a.y = -20;

    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = width < 700 ? 92 : 132;

      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;
        ctx.strokeStyle = `rgba(82, 214, 199, ${opacity * 0.18})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    const colors = [
      "rgba(82, 214, 199, 0.72)",
      "rgba(111, 182, 255, 0.58)",
      "rgba(246, 182, 91, 0.58)",
      "rgba(255, 124, 158, 0.48)",
      "rgba(237, 243, 248, 0.42)"
    ];

    ctx.fillStyle = colors[a.tone];
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!prefersReducedMotion) {
    animationFrame = window.requestAnimationFrame(drawTelemetry);
  }
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach(item => observer.observe(item));
window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", () => {
  window.cancelAnimationFrame(animationFrame);
  resizeCanvas();
  drawTelemetry();
});

resizeCanvas();
drawTelemetry();
updateHeader();
