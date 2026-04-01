// === LOGO → FLOATING CAMERA ===
const logo = document.getElementById('heroLogo');
const video = document.getElementById('camVideo');
const btnTry = document.getElementById('btnTry');

let isDragging = false;
let hasMoved = false;
let dragOffset = { x: 0, y: 0 };
let startPos = { x: 0, y: 0 };
let cameraActive = false;
let cameraStream = null;

// Insert a spacer element after the logo to prevent layout shift
const spacer = document.createElement('div');
spacer.className = 'hero-logo-spacer';
logo.parentNode.insertBefore(spacer, logo.nextSibling);

// === DRAG HANDLING (only when floating) ===
logo.addEventListener('pointerdown', (e) => {
  if (!logo.classList.contains('floating')) return;
  isDragging = true;
  hasMoved = false;
  logo.setPointerCapture(e.pointerId);
  dragOffset.x = e.clientX - logo.getBoundingClientRect().left;
  dragOffset.y = e.clientY - logo.getBoundingClientRect().top;
  startPos.x = e.clientX;
  startPos.y = e.clientY;
  logo.style.transition = 'none';
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - startPos.x;
  const dy = e.clientY - startPos.y;
  if (!hasMoved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
  hasMoved = true;
  const x = e.clientX - dragOffset.x;
  const y = e.clientY - dragOffset.y;
  logo.style.left = x + 'px';
  logo.style.top = y + 'px';
  logo.style.right = 'auto';
});

window.addEventListener('pointerup', () => {
  if (!isDragging) return;
  isDragging = false;
  logo.style.transition = '';
});

// === CLICK: ACTIVATE / DEACTIVATE ===
logo.addEventListener('click', () => {
  if (hasMoved) return;
  toggleCamera();
});

btnTry.addEventListener('click', toggleCamera);

async function toggleCamera() {
  if (cameraActive) {
    deactivateCamera();
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    btnTry.textContent = 'Needs HTTPS';
    btnTry.style.opacity = '0.5';
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } }
    });

    // Capture where the logo is right now
    const rect = logo.getBoundingClientRect();

    // Calculate target position (what .floating CSS will give us)
    const targetSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cam-size')) || 160;
    const targetTop = window.innerWidth <= 500 ? 14 : (window.innerWidth <= 900 ? 20 : 60);
    const targetRight = window.innerWidth <= 500 ? 14 : (window.innerWidth <= 900 ? 20 : 40);
    const targetLeft = window.innerWidth - targetRight - targetSize;

    // Show the spacer so layout doesn't jump
    spacer.style.display = 'block';

    // Pin logo at its current visual position as fixed
    logo.style.transition = 'none';
    logo.style.position = 'fixed';
    logo.style.left = rect.left + 'px';
    logo.style.top = rect.top + 'px';
    logo.style.right = 'auto';
    logo.style.width = rect.width + 'px';
    logo.style.height = rect.height + 'px';
    logo.style.margin = '0';
    logo.style.zIndex = '10000';

    // Force layout so the browser registers the starting position
    logo.offsetHeight;

    // Start the video feed
    video.srcObject = cameraStream;
    video.classList.add('active');

    // Now animate to target position
    logo.style.transition = 'left 0.5s cubic-bezier(0.4,0,0.2,1), top 0.5s cubic-bezier(0.4,0,0.2,1), width 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)';
    logo.style.left = targetLeft + 'px';
    logo.style.top = targetTop + 'px';
    logo.style.width = targetSize + 'px';
    logo.style.height = targetSize + 'px';
    logo.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6), 0 0 0 3px #C63F40';

    // After the animation finishes, switch to the .floating class
    setTimeout(() => {
      logo.classList.add('floating');
      logo.style.transition = '';
      logo.style.position = '';
      logo.style.left = '';
      logo.style.top = '';
      logo.style.right = '';
      logo.style.width = '';
      logo.style.height = '';
      logo.style.margin = '';
      logo.style.boxShadow = '';
    }, 520);

    btnTry.textContent = 'Deactivate camera';
    btnTry.classList.add('active');
    cameraActive = true;
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      btnTry.textContent = 'Camera denied';
    } else if (err.name === 'NotFoundError') {
      btnTry.textContent = 'No camera found';
    } else {
      btnTry.textContent = 'Camera error';
    }
    btnTry.style.opacity = '0.5';
  }
}

function deactivateCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  video.srcObject = null;
  video.classList.remove('active');

  // Get current floating position
  const currentRect = logo.getBoundingClientRect();
  const spacerRect = spacer.getBoundingClientRect();

  // Remove .floating class and pin at current spot
  logo.classList.remove('floating');
  logo.style.transition = 'none';
  logo.style.position = 'fixed';
  logo.style.left = currentRect.left + 'px';
  logo.style.top = currentRect.top + 'px';
  logo.style.right = 'auto';
  logo.style.width = currentRect.width + 'px';
  logo.style.height = currentRect.height + 'px';
  logo.style.margin = '0';
  logo.style.zIndex = '10000';

  // Force layout
  logo.offsetHeight;

  // Animate back to hero position
  logo.style.transition = 'left 0.5s cubic-bezier(0.4,0,0.2,1), top 0.5s cubic-bezier(0.4,0,0.2,1), width 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)';
  logo.style.left = spacerRect.left + 'px';
  logo.style.top = spacerRect.top + 'px';
  logo.style.width = '72px';
  logo.style.height = '72px';
  logo.style.boxShadow = 'none';

  setTimeout(() => {
    logo.style.position = '';
    logo.style.left = '';
    logo.style.top = '';
    logo.style.right = '';
    logo.style.width = '';
    logo.style.height = '';
    logo.style.margin = '';
    logo.style.zIndex = '';
    logo.style.transition = '';
    logo.style.boxShadow = '';
    spacer.style.display = 'none';
  }, 520);

  btnTry.textContent = 'Activate camera';
  btnTry.classList.remove('active');
  btnTry.style.opacity = '';
  cameraActive = false;
}

// === REVIEWS INFINITE SCROLL ===
const reviewsTrack = document.querySelector('.reviews-track');
if (reviewsTrack) {
  const cards = reviewsTrack.innerHTML;
  reviewsTrack.innerHTML = cards + cards;
}

// === SCROLL REVEAL ===
const revealSections = document.querySelectorAll(
  '.what-section, .features-section, .usecases-section, .try-section, .bottom-cta'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealSections.forEach(section => observer.observe(section));

// === SUBTLE MOUSE PARALLAX ON HERO ===
const hero = document.querySelector('.hero');
const heroTitle = document.querySelector('.hero-title');

hero.addEventListener('mousemove', (e) => {
  const rect = hero.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  heroTitle.style.transform = `translate(${x * 8}px, ${y * 4}px)`;
});

hero.addEventListener('mouseleave', () => {
  heroTitle.style.transform = '';
  heroTitle.style.transition = 'transform 0.5s ease';
  setTimeout(() => { heroTitle.style.transition = ''; }, 500);
});
