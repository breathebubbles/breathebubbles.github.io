// Breath Bubbles Animation + Simple Interactions
// Canvas particle system focusing on smooth, low-GPU bubble motion and subtle breathing rhythm.

class BreathBubbles {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.options = Object.assign({
      bubbleCount: 42,
      baseHue: 190,
      hueRange: 40,
      minRadius: 14,
      maxRadius: 64,
      floatSpeed: [0.12, 0.55], // px per frame baseline
      wobbleStrength: 0.55,
      breathingPeriod: 6400, // ms
      connectionDistance: 148,
      interactiveForce: 0.12,
      parallax: 0.06,
    }, options);

    this.bubbles = [];
    this.t0 = performance.now();
    this.mouse = { x: 0, y: 0, active: false };

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.bind();
    this.resize();
    this.init();
    requestAnimationFrame(() => this.frame());
  }

  bind() {
    window.addEventListener('pointermove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * this.dpr;
      this.mouse.y = (e.clientY - rect.top) * this.dpr;
      this.mouse.active = true;
    });
    window.addEventListener('pointerleave', () => this.mouse.active = false);
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.t0 = performance.now();
    });
  }

  resize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
  }

  rand(min, max) { return Math.random() * (max - min) + min; }

  init() {
    this.bubbles.length = 0;
    for (let i = 0; i < this.options.bubbleCount; i++) {
      this.bubbles.push(this.makeBubble());
    }
  }

  makeBubble() {
    const r = this.rand(this.options.minRadius, this.options.maxRadius);
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      r,
      baseR: r,
      hue: this.options.baseHue + this.rand(-this.options.hueRange/2, this.options.hueRange/2),
      vy: -this.rand(this.options.floatSpeed[0], this.options.floatSpeed[1]),
      vx: this.rand(-0.15, 0.15),
      wobbleSeed: Math.random() * 1000,
    };
  }

  frame() {
    const now = performance.now();
    const t = now - this.t0;
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    const breath = (Math.sin((t/this.options.breathingPeriod) * Math.PI * 2) + 1)/2; // 0..1

    // Update & draw
    for (const b of this.bubbles) {
      // breathing scale
      const scale = 0.82 + breath * 0.36; // 0.82..1.18
      b.r = b.baseR * scale;

      // movement
      b.y += b.vy * (0.6 + breath * 0.8);
      b.x += b.vx + Math.sin((t + b.wobbleSeed) * 0.0018) * this.options.wobbleStrength;

      // wrap to bottom when leaving top
      if (b.y + b.r < 0) {
        b.y = this.canvas.height + b.r * 2;
        b.x = Math.random() * this.canvas.width;
      }
      if (b.x - b.r > this.canvas.width) b.x = -b.r;
      else if (b.x + b.r < 0) b.x = this.canvas.width + b.r;

      // interaction
      if (this.mouse.active) {
        const dx = b.x - this.mouse.x;
        const dy = b.y - this.mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 * this.dpr) {
          const force = (1 - dist / (180 * this.dpr)) * this.options.interactiveForce;
          b.x += dx * force;
          b.y += dy * force;
        }
      }
    }

    // Draw connections first (subtle)
    this.ctx.lineWidth = 1 * this.dpr;
    for (let i=0; i < this.bubbles.length; i++) {
      const b1 = this.bubbles[i];
      for (let j=i+1; j < this.bubbles.length; j++) {
        const b2 = this.bubbles[j];
        const dx = b1.x - b2.x;
        const dy = b1.y - b2.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.options.connectionDistance * this.dpr) {
          const alpha = 1 - dist / (this.options.connectionDistance * this.dpr);
          this.ctx.strokeStyle = `hsla(${(b1.hue + b2.hue)/2}, 80%, 62%, ${alpha * 0.12})`;
          this.ctx.beginPath();
          this.ctx.moveTo(b1.x, b1.y);
          this.ctx.lineTo(b2.x, b2.y);
          this.ctx.stroke();
        }
      }
    }

    // Draw bubbles
    for (const b of this.bubbles) {
      const grd = this.ctx.createRadialGradient(b.x - b.r*0.4, b.y - b.r*0.5, b.r*0.1, b.x, b.y, b.r);
      grd.addColorStop(0, `hsla(${b.hue}, 95%, 78%, 0.85)`);
      grd.addColorStop(0.55, `hsla(${b.hue+10}, 85%, 62%, 0.45)`);
      grd.addColorStop(1, `hsla(${b.hue}, 90%, 40%, 0.10)`);
      this.ctx.fillStyle = grd;

      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      this.ctx.fill();

      // highlight ring
      this.ctx.strokeStyle = `hsla(${b.hue}, 95%, 82%, 0.35)`;
      this.ctx.lineWidth = 1.2 * this.dpr;
      this.ctx.stroke();
    }

    requestAnimationFrame(() => this.frame());
  }
}

function initBreathBubbles() {
  const canvas = document.getElementById('breathBubblesCanvas');
  if (!canvas) return;
  new BreathBubbles(canvas);
}

// DOM Ready
if (document.readyState !== 'loading') initBreathBubbles();
else document.addEventListener('DOMContentLoaded', initBreathBubbles);
