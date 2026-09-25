// Original concept garments. Product graphics are drawn in both the catalog and camera overlay.
export const products = [
  { id: 'stripe-tee', name: 'Diagonal Stripe Tee', type: 'tee', category: 'Graphic T-Shirt', colorName: 'Bone / red', color: '#e7e1d3', trim: '#c7bfae', tile: '#eeeae2', design: 'stripe' },
  { id: 'night-tee', name: 'Night Run Tee', type: 'tee', category: 'Graphic T-Shirt', colorName: 'Black / white', color: '#222a27', trim: '#161d1a', tile: '#e4e5e1', design: 'night' },
  { id: 'number-tee', name: 'Number Tee', type: 'tee', category: 'Graphic T-Shirt', colorName: 'Blue / white', color: '#34537b', trim: '#263f5f', tile: '#e0e6ed', design: 'number' },
  { id: 'contour-tee', name: 'Contour Tee', type: 'tee', category: 'Graphic T-Shirt', colorName: 'Olive / cream', color: '#596647', trim: '#47513a', tile: '#e6e8df', design: 'contour' },
  { id: 'collared-shirt', name: 'Collared Shirt', type: 'shirt', category: 'Shirt', colorName: 'Sand', color: '#d9c8a8', trim: '#bbab8c', tile: '#ebe8df' },
  { id: 'straight-dress', name: 'Straight Dress', type: 'dress', category: 'Dress', colorName: 'Deep green', color: '#303d32', trim: '#243027', tile: '#dce1d7' },
  { id: 'flared-dress', name: 'Flared Dress', type: 'dress', category: 'Dress', colorName: 'Peach', color: '#d7a27e', trim: '#bd8567', tile: '#ebddd4' },
  { id: 'straight-trousers', name: 'Straight Trousers', type: 'pants', category: 'Trousers', colorName: 'Charcoal', color: '#545a56', trim: '#424844', tile: '#dce0dc' },
  { id: 'relaxed-trousers', name: 'Relaxed Trousers', type: 'pants', category: 'Trousers', colorName: 'Oat', color: '#c6b295', trim: '#ae9c83', tile: '#e8e2d8' },
];

const teePath = 'M105 40 L116 47 Q130 59 144 47 L155 40 L174 47 L209 90 L187 110 L173 97 L174 245 Q130 253 86 245 L87 97 L73 110 L51 90 L86 47 Z';

function teeGraphicSvg(product) {
  switch (product.design) {
    case 'stripe':
      return '<path d="M57 148 L197 83 L204 102 L69 168 Z" fill="#b44932"/><path d="M73 170 L207 108" fill="none" stroke="#e4b2a0" stroke-width="3"/>';
    case 'night':
      return '<text x="130" y="143" fill="#f3f1e9" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="800" letter-spacing="-2">PACE</text><path d="M86 155 H174 M101 162 H159" stroke="#f3f1e9" stroke-width="3"/>';
    case 'number':
      return '<circle cx="130" cy="148" r="45" fill="none" stroke="#e9edf1" stroke-width="5"/><text x="130" y="169" fill="#e9edf1" text-anchor="middle" font-family="Arial,sans-serif" font-size="62" font-weight="800">03</text>';
    case 'contour':
      return '<path d="M73 157 Q92 140 106 153 T139 142 T174 142 M73 170 Q92 153 106 166 T139 155 T174 155 M73 183 Q92 166 106 179 T139 168 T174 168" fill="none" stroke="#e8e4ca" stroke-width="3" stroke-linecap="round"/>';
    default:
      return '';
  }
}

export function productArt(product) {
  const { id, color, trim, name } = product;
  const gradient = `<defs><linearGradient id="fill-${id}" x1="0" x2="1"><stop stop-color="${trim}"/><stop offset=".35" stop-color="${color}"/><stop offset=".78" stop-color="${color}"/><stop offset="1" stop-color="${trim}"/></linearGradient><clipPath id="shape-${id}"><path d="${teePath}"/></clipPath></defs>`;
  let shape;

  if (product.type === 'tee') {
    shape = `<path d="${teePath}" fill="url(#fill-${id})" stroke="${trim}" stroke-width="2"/>
      <g clip-path="url(#shape-${id})">${teeGraphicSvg(product)}</g>
      <path d="M108 43 Q130 71 152 43" fill="none" stroke="${trim}" stroke-width="5"/>`;
  } else if (product.type === 'shirt') {
    shape = `<path d="M88 45 L105 37 L119 52 L141 52 L155 37 L173 45 L211 90 L188 115 L174 101 L177 246 Q130 254 83 246 L86 101 L72 115 L49 90 Z" fill="url(#fill-${id})" stroke="${trim}" stroke-width="2"/>
      <path d="M105 37 L130 70 L119 52 Z M155 37 L130 70 L141 52 Z" fill="${trim}"/>
      <path d="M130 70 V241" stroke="${trim}" stroke-width="2"/>
      <circle cx="130" cy="105" r="2" fill="${trim}"/><circle cx="130" cy="139" r="2" fill="${trim}"/><circle cx="130" cy="173" r="2" fill="${trim}"/>`;
  } else if (product.type === 'dress') {
    shape = `<path d="M103 37 L118 48 Q130 62 142 48 L157 37 L194 74 L179 110 L164 99 L163 175 L196 276 Q130 291 64 276 L97 175 L96 99 L81 110 L66 74 Z" fill="url(#fill-${id})" stroke="${trim}" stroke-width="2"/>
      <path d="M97 168 Q130 179 163 168 M103 37 Q130 87 157 37" fill="none" stroke="${trim}" stroke-width="3"/>`;
  } else {
    shape = `<path d="M81 37 Q130 42 179 37 L176 119 L158 278 L131 278 L130 133 L129 133 L128 278 L101 278 L84 119 Z" fill="url(#fill-${id})" stroke="${trim}" stroke-width="2"/>
      <path d="M82 57 Q130 63 178 57 M130 59 V123 M94 84 L108 102 M166 84 L152 102" stroke="${trim}" stroke-width="2" fill="none"/>`;
  }

  return `<svg class="product-art" viewBox="0 0 260 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of ${name}">${gradient}${shape}</svg>`;
}

function point(landmarks, index, mapping) {
  const landmark = landmarks[index];
  if (!landmark || (landmark.visibility ?? 1) < .45) return null;
  return { x: mapping.x(landmark.x), y: mapping.y(landmark.y) };
}

const between = (a, b, fraction) => ({ x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction });
const scaleFrom = (center, pointToScale, factor) => ({ x: center.x + (pointToScale.x - center.x) * factor, y: center.y + (pointToScale.y - center.y) * factor });

function drawPolygon(ctx, points, color, trim) {
  ctx.beginPath();
  points.forEach((p, index) => index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = trim;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function seam(ctx, a, b, color, width = 1.5) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawTeeGraphic(ctx, product, shoulderCenter, shoulderWidth, torsoHeight) {
  const center = { x: shoulderCenter.x, y: shoulderCenter.y + torsoHeight * .47 };
  const size = shoulderWidth;
  ctx.save();
  ctx.translate(center.x, center.y);

  switch (product.design) {
    case 'stripe':
      ctx.rotate(-.42);
      ctx.fillStyle = '#b44932';
      ctx.fillRect(-size * .64, -size * .10, size * 1.28, size * .22);
      ctx.fillStyle = '#e4b2a0';
      ctx.fillRect(-size * .64, size * .15, size * 1.28, Math.max(2, size * .025));
      break;
    case 'night':
      ctx.fillStyle = '#f3f1e9';
      ctx.textAlign = 'center';
      ctx.font = `800 ${Math.round(size * .24)}px Arial, sans-serif`;
      ctx.fillText('PACE', 0, 0);
      ctx.fillRect(-size * .33, size * .06, size * .66, Math.max(2, size * .025));
      ctx.fillRect(-size * .22, size * .12, size * .44, Math.max(2, size * .025));
      break;
    case 'number':
      ctx.strokeStyle = '#e9edf1';
      ctx.lineWidth = Math.max(2, size * .035);
      ctx.beginPath();
      ctx.arc(0, 0, size * .30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#e9edf1';
      ctx.textAlign = 'center';
      ctx.font = `800 ${Math.round(size * .38)}px Arial, sans-serif`;
      ctx.fillText('03', 0, size * .13);
      break;
    case 'contour':
      ctx.strokeStyle = '#e8e4ca';
      ctx.lineWidth = Math.max(2, size * .02);
      for (let row = -1; row <= 1; row++) {
        ctx.beginPath();
        for (let step = 0; step <= 24; step++) {
          const x = (step / 24 - .5) * size * .8;
          const y = row * size * .12 + Math.sin(step * .65 + row) * size * .045;
          step ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      break;
  }
  ctx.restore();
}

export function renderGarment(ctx, product, landmarks, mapping) {
  const shoulderA = point(landmarks, 11, mapping), shoulderB = point(landmarks, 12, mapping);
  const hipA = point(landmarks, 23, mapping), hipB = point(landmarks, 24, mapping);
  if (![shoulderA, shoulderB, hipA, hipB].every(Boolean)) return false;

  const [sl, sr] = shoulderA.x < shoulderB.x ? [shoulderA, shoulderB] : [shoulderB, shoulderA];
  const [hl, hr] = hipA.x < hipB.x ? [hipA, hipB] : [hipB, hipA];
  const shoulderWidth = Math.hypot(sr.x - sl.x, sr.y - sl.y);
  const torsoHeight = Math.abs((hl.y + hr.y) / 2 - (sl.y + sr.y) / 2);
  if (shoulderWidth < 25 || torsoHeight < 35 || shoulderWidth > mapping.width * .85) return false;

  const { color, trim } = product;
  ctx.save();
  ctx.lineJoin = 'round';

  if (product.type === 'pants') {
    const kneeA = point(landmarks, 25, mapping), kneeB = point(landmarks, 26, mapping);
    const ankleA = point(landmarks, 27, mapping), ankleB = point(landmarks, 28, mapping);
    if (![kneeA, kneeB, ankleA, ankleB].every(Boolean)) {
      ctx.restore();
      return false;
    }

    const [kl, kr] = kneeA.x < kneeB.x ? [kneeA, kneeB] : [kneeB, kneeA];
    const [al, ar] = ankleA.x < ankleB.x ? [ankleA, ankleB] : [ankleB, ankleA];
    const hipWidth = Math.hypot(hr.x - hl.x, hr.y - hl.y);
    const width = hipWidth * .12;
    const waistL = scaleFrom(between(hl, hr, .5), hl, 1.16);
    const waistR = scaleFrom(between(hl, hr, .5), hr, 1.16);
    const crotch = between(between(hl, hr, .5), between(kl, kr, .5), .31);

    drawPolygon(ctx, [waistL, between(hl, hr, .48), crotch, { x: kl.x + width, y: kl.y }, { x: al.x + width * .77, y: al.y }, { x: al.x - width * .77, y: al.y }, { x: kl.x - width, y: kl.y }], color, trim);
    drawPolygon(ctx, [between(hl, hr, .52), waistR, { x: kr.x + width, y: kr.y }, { x: ar.x + width * .77, y: ar.y }, { x: ar.x - width * .77, y: ar.y }, { x: kr.x - width, y: kr.y }, crotch], color, trim);
    seam(ctx, waistL, waistR, trim, 2);
    seam(ctx, between(hl, hr, .5), crotch, trim);
  } else {
    const shoulderCenter = between(sl, sr, .5);
    const sleeveWidth = shoulderWidth * .23;
    const outerL = scaleFrom(shoulderCenter, sl, 1.18);
    const outerR = scaleFrom(shoulderCenter, sr, 1.18);
    const sleeveL = { x: outerL.x - sleeveWidth * .65, y: outerL.y + torsoHeight * .42 };
    const sleeveR = { x: outerR.x + sleeveWidth * .65, y: outerR.y + torsoHeight * .42 };
    const armpitL = between(sl, hl, .34), armpitR = between(sr, hr, .34);
    let hemL = scaleFrom(between(hl, hr, .5), hl, 1.1);
    let hemR = scaleFrom(between(hl, hr, .5), hr, 1.1);

    if (product.type === 'dress') {
      const kneeA = point(landmarks, 25, mapping), kneeB = point(landmarks, 26, mapping);
      const kneeY = kneeA && kneeB ? (kneeA.y + kneeB.y) / 2 : (hl.y + hr.y) / 2 + torsoHeight * .9;
      const hemY = Math.min(mapping.height + 20, kneeY + torsoHeight * .12);
      const widen = shoulderWidth * (product.id === 'flared-dress' ? .67 : .48);
      hemL = { x: hl.x - widen, y: hemY };
      hemR = { x: hr.x + widen, y: hemY };
    }

    drawPolygon(ctx, [outerL, between(sl, shoulderCenter, .38), between(sr, shoulderCenter, .38), outerR, sleeveR, { x: armpitR.x + sleeveWidth * .36, y: armpitR.y }, hemR, hemL, { x: armpitL.x - sleeveWidth * .36, y: armpitL.y }, sleeveL], color, trim);

    if (product.type === 'tee') {
      ctx.save();
      ctx.clip(); // Keep the print inside the same garment silhouette used for the solid overlay.
      drawTeeGraphic(ctx, product, shoulderCenter, shoulderWidth, torsoHeight);
      ctx.restore();
    }
    if (product.type === 'dress') seam(ctx, hl, hr, trim, 2);
    if (product.type === 'shirt') {
      seam(ctx, shoulderCenter, between(hemL, hemR, .5), trim, 1.6);
      ctx.fillStyle = trim;
      for (let index = 1; index <= 3; index++) {
        const button = between(shoulderCenter, between(hl, hr, .5), index / 4);
        ctx.beginPath();
        ctx.arc(button.x, button.y, Math.max(1.5, shoulderWidth * .012), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
  return true;
}
