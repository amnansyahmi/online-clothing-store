# FORMA — clothing store and live fitting room

A mobile-first, installable PWA prototype for browsing a clothing collection and previewing garments through the camera. No checkout, login, backend, or payment integration.

## Run it

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` on the same computer. For testing on a phone, deploy to **HTTPS**; a plain `http://<LAN IP>` address cannot access the camera. The store itself has no build step or paid API keys.

Tap **Try it on** on any product, then **Enable camera**. Allow camera access, stand back, face the camera, and keep your shoulders and hips visible. Dresses and trousers work best when your legs are visible. You can switch cameras, save a preview PNG, turn off the camera, or close the room. Camera permission is requested only after tapping the button.

## How it works

- The camera frames and body landmarks stay in the browser. MediaPipe Pose Landmarker detects landmarks on device; the vector garment is drawn on a canvas over the video. The app does not send camera frames to a server.
- The first camera session downloads MediaPipe's JavaScript/WASM from jsDelivr and Google's lite pose model. An internet connection is needed to load these assets the first time; the app shell is available offline after installation. The pose model/CDN assets are not guaranteed offline by the service worker.
- Try-on is an **illustrative 2D overlay**, not a photorealistic replacement or a measurement of fit. It follows shoulders, hips, and (for trousers) knees and ankles. It may look less accurate for turns, occlusions, loose fabric, or poor lighting. Capture saves the composite locally only when pressed.
- The six sample products, prices, and vector designs in `garments.js` are placeholders. Replace them with your real catalog and garment assets. Production-grade fit and realistic drape would require calibrated product imagery or 3D assets and a more advanced virtual try-on pipeline.

## Files

`index.html` contains the catalog and fitting room interface. `styles.css` defines the responsive layout. `garments.js` contains the sample catalog, artwork, and canvas overlay. `app.js` manages product selection, camera, tracking, and capture. `manifest.webmanifest`, `sw.js`, and `assets/` make the site installable and cache the app shell.

## Test

```bash
npm test
```

For actual camera QA, open an HTTPS deployment on both iOS Safari and Android Chrome. Grant and deny permission, switch cameras, leave and return to the app, and try each garment type in good lighting.
