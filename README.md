# Fitting Room prototype

A mobile-first clothing catalog prototype with live camera garment overlays. It does not include payments, checkout, accounts, or real inventory.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. To test on a phone, host the files on HTTPS. A plain `http://<LAN IP>` address cannot access the camera. There is no build step or paid API key.

Choose a demo garment and tap **Try on camera**. Allow camera access, face the camera, and keep your shoulders and hips visible. Trousers also need your legs in frame. The fitting room lets you switch between samples while the camera is running, switch camera direction, save a preview PNG, or stop the camera.

## Prototype limits

- All six garments are labeled as samples. Their vector artwork and colors are placeholders for actual catalog assets. No prices, materials, sizes, or stock are implied.
- MediaPipe Pose Landmarker detects body landmarks in the browser. The app draws a 2D garment shape on top of the camera image. It does not replace existing clothing photorealistically, account for occlusion, measure size, or simulate fabric drape.
- Camera frames are not sent by this app to a server. A captured image is downloaded only when the shopper presses the shutter.
- The first camera session needs the internet to load MediaPipe JavaScript/WASM from jsDelivr and Google's lite pose model. The service worker caches only the app shell; model and CDN availability offline are not guaranteed.
- `DESIGN.md` documents a **draft prototype direction**, not a final store brand. Real products, names, images, and brand guidance are needed before presenting it as a commercial store.

## Checks

```bash
npm test
node --check app.js
node --check garments.js
node --check sw.js
```

The tests exercise garment rendering and missing-pose behavior. A camera run on actual iOS Safari and Android Chrome remains necessary before launch. Check permission granted/denied, poor lighting, off-frame movement, garment switching, saving, and app backgrounding.
