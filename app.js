import { products, productArt, renderGarment } from './garments.js';

const $ = selector => document.querySelector(selector);
const grid = $('#product-grid');
const modal = $('#fitting-room');
const video = $('#camera');
const canvas = $('#overlay');
const mirror = $('#mirror-frame');
const placeholder = $('#camera-placeholder');
const startButton = $('#start-camera');
const retryButton = $('#retry-camera');
const status = $('#tracking-status');
const statusText = $('#tracking-text');
const guide = $('#mirror-guide');
const controls = $('#mirror-controls');
const captureButton = $('#capture');
const errorBox = $('#room-error');

let selected = products[0];
let stream = null;
let trackerPromise = null;
let animationFrame = 0;
let session = 0;
let facing = 'user';
let lastDetection = 0;
let previousFocus = null;

function renderProducts(filter = 'all') {
  const visible = products.filter(product => filter === 'all' || product.type === filter);
  $('#result-count').textContent = String(visible.length);

  if (!visible.length) {
    grid.innerHTML = '<div class="empty-state"><h3>No garments in this category</h3><p>Choose another category to keep browsing.</p></div>';
    return;
  }

  grid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image" style="--tile:${product.tile}">
        <span class="sample-tag">Demo garment</span>
        ${productArt(product)}
      </div>
      <div class="product-info">
        <div><h3>${product.name}</h3><p>${product.colorName}</p></div>
        <span class="color-chip" style="--garment:${product.color}" role="img" aria-label="${product.colorName} color"></span>
      </div>
      <button class="try-button" type="button" data-product="${product.id}" aria-label="Try on ${product.name}">Try on camera</button>
    </article>
  `).join('');
}

function selectProduct(product) {
  selected = product;
  $('#selected-product').innerHTML = `
    <div class="selected-thumb" style="--tile:${product.tile}">${productArt(product)}</div>
    <div><h3>${product.name}</h3><p>Demo garment · ${product.colorName}</p></div>
  `;
  $('#garment-switcher').innerHTML = products.map(item => `
    <button class="switch-item" type="button" data-switch="${item.id}" aria-label="Switch to ${item.name}" aria-pressed="${item.id === product.id}">
      <span class="switch-preview" style="--tile:${item.tile}">${productArt(item)}</span>
      <span>${item.name}</span>
    </button>
  `).join('');
  captureButton.disabled = true;
}

function openRoom(product) {
  previousFocus = document.activeElement;
  selectProduct(product);
  facing = 'user';
  errorBox.hidden = true;
  retryButton.hidden = true;
  startButton.hidden = false;
  $('#placeholder-title').textContent = 'Start your camera';
  modal.hidden = false;
  document.body.classList.add('body-modal');
  $('#close-room').focus();
}

function stopCamera() {
  session++;
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  video.pause();
  video.srcObject = null;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  placeholder.hidden = false;
  status.hidden = true;
  guide.hidden = true;
  controls.hidden = true;
  captureButton.disabled = true;
}

function closeRoom() {
  stopCamera();
  modal.hidden = true;
  document.body.classList.remove('body-modal');
  previousFocus?.focus();
}

$('.filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  document.querySelectorAll('.filter').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderProducts(button.dataset.filter);
});

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-product]');
  if (button) openRoom(products.find(product => product.id === button.dataset.product));
});

$('#garment-switcher').addEventListener('click', event => {
  const button = event.target.closest('[data-switch]');
  if (button) selectProduct(products.find(product => product.id === button.dataset.switch));
});

$('#close-room').addEventListener('click', closeRoom);
$('#back-to-collection').addEventListener('click', closeRoom);
$('#stop-camera').addEventListener('click', stopCamera);

modal.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeRoom();
  if (event.key !== 'Tab') return;

  const focusable = [...modal.querySelectorAll('button:not([hidden])')].filter(item => item.offsetParent !== null);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

async function getTracker() {
  if (!trackerPromise) {
    trackerPromise = (async () => {
      const { FilesetResolver, PoseLandmarker } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/+esm');
      const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm');
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: .55,
        minPosePresenceConfidence: .55,
        minTrackingConfidence: .55,
      });
    })().catch(error => {
      trackerPromise = null;
      throw error;
    });
  }
  return trackerPromise;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  retryButton.hidden = false;
  startButton.hidden = true;
  $('#placeholder-title').textContent = 'Camera unavailable';
  placeholder.hidden = false;
  status.hidden = true;
  guide.hidden = true;
  controls.hidden = true;
}

function cameraError(error) {
  if (!window.isSecureContext) return 'Open this site over HTTPS. The camera will not work on an ordinary HTTP address.';
  if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') return 'Camera permission was denied. Allow camera access in your browser settings, then try again.';
  if (error?.name === 'NotFoundError') return 'This device has no available camera.';
  if (error?.name === 'NotReadableError') return 'Another app may be using your camera. Close it, then try again.';
  return 'The camera could not start. Check your browser permissions and try again.';
}

async function startCamera() {
  stopCamera();
  const currentSession = session;
  errorBox.hidden = true;
  retryButton.hidden = true;
  startButton.hidden = false;
  $('#placeholder-title').textContent = 'Start your camera';

  if (!navigator.mediaDevices?.getUserMedia) {
    showError('Open the site over HTTPS in a browser that supports camera access.');
    return;
  }

  startButton.disabled = true;
  startButton.textContent = 'Starting camera…';
  try {
    const acquired = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: facing }, width: { ideal: 960 }, height: { ideal: 1280 } },
    });
    if (currentSession !== session || modal.hidden) {
      acquired.getTracks().forEach(track => track.stop());
      return;
    }

    stream = acquired;
    video.srcObject = stream;
    video.style.transform = facing === 'user' ? 'scaleX(-1)' : 'none';
    await video.play();
    if (currentSession !== session) return;
    placeholder.hidden = true;
    status.hidden = false;
    statusText.textContent = 'Loading body tracking…';

    await getTracker();
    if (currentSession !== session) return;
    controls.hidden = false;
    statusText.textContent = 'Looking for you…';
    lastDetection = 0;
    animationFrame = requestAnimationFrame(trackFrame);
  } catch (error) {
    if (currentSession !== session) return;
    console.error('Camera or pose tracking failed:', error);
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
    const mediaErrors = ['NotAllowedError', 'PermissionDeniedError', 'NotFoundError', 'NotReadableError'];
    showError(mediaErrors.includes(error?.name) ? cameraError(error) : 'Body tracking could not load. Connect to the internet and try again.');
  } finally {
    startButton.disabled = false;
    startButton.textContent = 'Enable camera';
  }
}

startButton.addEventListener('click', startCamera);
retryButton.addEventListener('click', startCamera);
$('#flip-camera').addEventListener('click', () => {
  facing = facing === 'user' ? 'environment' : 'user';
  startCamera();
});

function geometry() {
  const bounds = mirror.getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
  const drawnWidth = video.videoWidth * scale;
  const drawnHeight = video.videoHeight * scale;
  const offsetX = (width - drawnWidth) / 2;
  const offsetY = (height - drawnHeight) / 2;

  return {
    width, height, dpr, drawnWidth, drawnHeight, offsetX, offsetY,
    mapping: {
      width, height,
      x: x => offsetX + (facing === 'user' ? 1 - x : x) * drawnWidth,
      y: y => offsetY + y * drawnHeight,
    },
  };
}

async function trackFrame(now) {
  if (!stream || modal.hidden) return;
  animationFrame = requestAnimationFrame(trackFrame);
  if (video.readyState < 2 || now - lastDetection < 85) return;
  lastDetection = now;

  try {
    const { width, height, dpr, mapping } = geometry();
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const tracker = await getTracker();
    const pose = tracker.detectForVideo(video, now).landmarks?.[0];
    const found = !!pose && renderGarment(ctx, selected, pose, mapping);
    status.classList.toggle('found', found);
    statusText.textContent = found ? 'Garment in view' : 'Looking for your body…';
    guide.hidden = found;
    guide.textContent = selected.type === 'pants'
      ? 'Step back until your hips and legs are visible'
      : 'Step back until your shoulders and hips are visible';
    captureButton.disabled = !found;
  } catch (error) {
    console.error('Body tracking stopped:', error);
    stopCamera();
    showError('Body tracking stopped. Open the camera again to retry.');
  }
}

captureButton.addEventListener('click', () => {
  if (!stream || captureButton.disabled || video.readyState < 2) return;
  const { width, height, dpr, drawnWidth, drawnHeight, offsetX, offsetY } = geometry();
  const output = document.createElement('canvas');
  output.width = Math.round(width * dpr);
  output.height = Math.round(height * dpr);
  const ctx = output.getContext('2d');
  ctx.scale(dpr, dpr);

  if (facing === 'user') {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, width - offsetX - drawnWidth, offsetY, drawnWidth, drawnHeight);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  } else {
    ctx.drawImage(video, offsetX, offsetY, drawnWidth, drawnHeight);
  }
  ctx.drawImage(canvas, 0, 0, width, height);

  output.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitting-room-${selected.id}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }, 'image/png');
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && stream) stopCamera();
});

renderProducts();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
