// === FLOATING CAMERA (draggable) ===
const cam = document.getElementById('floatingCam');
const video = document.getElementById('camVideo');
const placeholder = document.getElementById('camPlaceholder');
const btnTry = document.getElementById('btnTry');

let isDragging = false;
let hasMoved = false;
let dragOffset = { x: 0, y: 0 };
let startPos = { x: 0, y: 0 };

cam.addEventListener('pointerdown', (e) => {
  isDragging = true;
  hasMoved = false;
  cam.setPointerCapture(e.pointerId);
  dragOffset.x = e.clientX - cam.getBoundingClientRect().left;
  dragOffset.y = e.clientY - cam.getBoundingClientRect().top;
  startPos.x = e.clientX;
  startPos.y = e.clientY;
  cam.style.transition = 'none';
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - startPos.x;
  const dy = e.clientY - startPos.y;
  // Only start moving after a 5px threshold to distinguish click from drag
  if (!hasMoved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
  hasMoved = true;
  const x = e.clientX - dragOffset.x;
  const y = e.clientY - dragOffset.y;
  cam.style.left = x + 'px';
  cam.style.top = y + 'px';
  cam.style.right = 'auto';
});

window.addEventListener('pointerup', () => {
  const wasClick = isDragging && !hasMoved;
  isDragging = false;
  cam.style.transition = '';
  // If it was a click (no drag), activate camera
  if (wasClick && !video.classList.contains('active')) {
    toggleCamera();
  }
});

// === WEBCAM ACTIVATION ===
let cameraActive = false;
let cameraStream = null;

async function toggleCamera() {
  if (cameraActive) {
    // Stop the camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    video.srcObject = null;
    video.classList.remove('active');
    placeholder.classList.remove('hidden');
    btnTry.textContent = 'Activate camera';
    btnTry.classList.remove('active');
    cameraActive = false;
    return;
  }

  // Check if getUserMedia is available (won't work on file:// in some browsers)
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    btnTry.textContent = 'Needs HTTPS';
    btnTry.style.opacity = '0.5';
    btnTry.title = 'Camera requires a web server (HTTPS). Try: python3 -m http.server';
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } }
    });
    video.srcObject = cameraStream;
    video.classList.add('active');
    placeholder.classList.add('hidden');
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

btnTry.addEventListener('click', toggleCamera);

// === SCROLL REVEAL ===
const revealSections = document.querySelectorAll(
  '.what-section, .features-section, .usecases-section, .try-section, .reviews-section, .bottom-cta'
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
