/* ============================================
   💖 For Jiji — Interactive Scripts
   Floating hearts, scroll reveals, video gallery & lightbox
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initFloatingHearts();
  initScrollReveal();
  initVideoGallery();
  initLightbox();
});

/* ============================================
   FLOATING HEARTS (Canvas)
   ============================================ */
function initFloatingHearts() {
  const canvas = document.getElementById('hearts-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const hearts = [];
  const heartEmojis = ['💖', '💕', '💗', '🩷', '✨', '💫', '🌸'];
  const MAX_HEARTS = 25;

  class Heart {
    constructor() {
      this.reset();
      // Start at random Y for initial distribution
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + 20;
      this.size = Math.random() * 16 + 10;
      this.speedY = Math.random() * 0.6 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.15;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 1;
      this.emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      this.wobbleAmplitude = Math.random() * 30 + 10;
      this.wobbleSpeed = Math.random() * 0.02 + 0.005;
      this.wobbleOffset = Math.random() * Math.PI * 2;
      this.time = 0;
    }

    update() {
      this.time += 1;
      this.y -= this.speedY;
      this.x += Math.sin(this.time * this.wobbleSpeed + this.wobbleOffset) * 0.3;
      this.rotation += this.rotationSpeed;

      if (this.y < -30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, 0, 0);
      ctx.restore();
    }
  }

  // Create initial hearts
  for (let i = 0; i < MAX_HEARTS; i++) {
    hearts.push(new Heart());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    hearts.forEach(heart => {
      heart.update();
      heart.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ============================================
   SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve — keep it revealed
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  revealElements.forEach(el => observer.observe(el));
}

/* ============================================
   VIDEO GALLERY
   ============================================ */
const videoFiles = [
  'VID-20260723-WA0133.mp4',
  'VID-20260723-WA0140.mp4',
  'VID-20260821-WA0062.mp4',
  'VID-20260821-WA0063.mp4',
  'VID-20260821-WA0064.mp4',
  'VID-20260821-WA0065.mp4',
  'VID-20260821-WA0066.mp4',
  'VID-20260821-WA0067.mp4',
  'VID-20260821-WA0068.mp4',
  'VID-20260821-WA0069.mp4',
  'VID-20260821-WA0070.mp4',
  'VID-20260821-WA0071.mp4',
  'VID-20260821-WA0072.mp4',
];

function initVideoGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  videoFiles.forEach((file, index) => {
    const card = document.createElement('div');
    card.className = `video-card reveal reveal-delay-${(index % 4) + 1}`;
    card.dataset.index = index;
    card.dataset.src = file;

    card.innerHTML = `
      <video preload="metadata" muted playsinline>
        <source src="${file}" type="video/mp4">
      </video>
      <div class="video-overlay">
        <div class="play-btn"></div>
      </div>
      <span class="video-number">moment ${String(index + 1).padStart(2, '0')}</span>
    `;

    // Hover preview: play a bit of the video on hover
    const videoEl = card.querySelector('video');

    card.addEventListener('mouseenter', () => {
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      videoEl.pause();
      videoEl.currentTime = 0;
    });

    card.addEventListener('click', () => {
      openLightbox(index);
    });

    grid.appendChild(card);
  });

  // Re-observe new reveal elements
  initScrollReveal();
}

/* ============================================
   LIGHTBOX
   ============================================ */
let currentVideoIndex = 0;

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!lightbox) return;

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => navigateLightbox(-1));
  nextBtn.addEventListener('click', () => navigateLightbox(1));

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        navigateLightbox(-1);
        break;
      case 'ArrowRight':
        navigateLightbox(1);
        break;
    }
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  const video = document.getElementById('lightbox-video');

  currentVideoIndex = index;
  video.src = videoFiles[index];
  video.load();

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Auto-play after a tiny delay for smooth animation
  setTimeout(() => {
    video.play().catch(() => {});
  }, 400);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const video = document.getElementById('lightbox-video');

  video.pause();
  video.src = '';
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  const video = document.getElementById('lightbox-video');
  video.pause();

  currentVideoIndex += direction;

  // Wrap around
  if (currentVideoIndex < 0) currentVideoIndex = videoFiles.length - 1;
  if (currentVideoIndex >= videoFiles.length) currentVideoIndex = 0;

  video.src = videoFiles[currentVideoIndex];
  video.load();
  video.play().catch(() => {});
}
