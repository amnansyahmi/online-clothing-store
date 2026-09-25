import { products, productArt, renderGarment } from './garments.js';

const $ = (selector) => document.querySelector(selector);
const grid=$('#product-grid'), modal=$('#fitting-room'), video=$('#camera'), canvas=$('#overlay');
const frame=$('#mirror-frame'), placeholder=$('#camera-placeholder'), status=$('#tracking-status');
const statusText=$('#tracking-text'), guide=$('#mirror-guide'), controls=$('#mirror-controls');
const errorBox=$('#room-error'), retry=$('#retry-camera');
let selected=products[0], stream=null, landmarker=null, raf=0, token=0;
let facing='user', lastDetection=0, previousFocus=null;

function renderProducts(filter='all') {
  grid.innerHTML=products.filter(p=>filter==='all'||p.type===filter).map((p,i)=>`
    <article class="product-card">
      <div class="product-image" style="--tile:${p.tile}"><span class="product-number">LOOK 0${products.indexOf(p)+1}</span>${productArt(p)}<span class="product-badge">${p.label}</span></div>
      <div class="product-meta"><div><h3>${p.name}</h3><p>${p.material}</p></div><span class="price">${p.price}</span></div>
      <button class="try-button" type="button" data-product="${p.id}" aria-label="Try on ${p.name}">Try it on <span aria-hidden="true">↗</span></button>
    </article>`).join('');
}
renderProducts();
$('.filters').addEventListener('click',event=>{
  const button=event.target.closest('[data-filter]');if(!button)return;
  document.querySelectorAll('.filter').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button))});
  renderProducts(button.dataset.filter);
});
grid.addEventListener('click',event=>{const button=event.target.closest('[data-product]');if(button)openRoom(products.find(p=>p.id===button.dataset.product))});

function openRoom(product) {
  previousFocus=document.activeElement;selected=product;facing='user';
  $('#selected-product').innerHTML=`<div class="selected-thumb" style="--tile:${product.tile}">${productArt(product)}</div><div><h3>${product.name}</h3><p>${product.material} · ${product.price}</p></div>`;
  modal.hidden=false;document.body.classList.add('body-modal');errorBox.hidden=true;retry.hidden=true;
  placeholder.hidden=false;status.hidden=true;guide.hidden=true;controls.hidden=true;
  $('#close-room').focus();
}
function stopCamera() {
  token++;cancelAnimationFrame(raf);raf=0;
  if(stream){stream.getTracks().forEach(track=>track.stop());stream=null}
  video.pause();video.srcObject=null;canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  status.hidden=true;guide.hidden=true;controls.hidden=true;placeholder.hidden=false;
}
function closeRoom() {
  stopCamera();modal.hidden=true;document.body.classList.remove('body-modal');previousFocus?.focus();
}
$('#close-room').addEventListener('click',closeRoom);
$('#back-to-collection').addEventListener('click',event=>{event.preventDefault();closeRoom()});
$('#stop-camera').addEventListener('click',stopCamera);
modal.addEventListener('keydown',event=>{
  if(event.key==='Escape')closeRoom();
  if(event.key==='Tab'){
    const focusable=[...modal.querySelectorAll('button:not([hidden]),a:not([hidden])')].filter(el=>el.offsetParent!==null);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});

async function getTracker() {
  if(landmarker)return landmarker;
  const {FilesetResolver,PoseLandmarker}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/+esm');
  const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm');
  landmarker=await PoseLandmarker.createFromOptions(vision,{
    baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',delegate:'CPU'},
    runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.55,minPosePresenceConfidence:.55,minTrackingConfidence:.55,
  });
  return landmarker;
}
function showError(message) {
  errorBox.textContent=message;errorBox.hidden=false;retry.hidden=false;
  status.hidden=true;guide.hidden=true;controls.hidden=true;placeholder.hidden=false;
}
function cameraError(error) {
  if(!window.isSecureContext)return 'The camera needs HTTPS, or localhost when developing. Open the secure version of this site.';
  if(error?.name==='NotAllowedError'||error?.name==='PermissionDeniedError')return 'Camera access was blocked. Allow camera access in your browser settings, then try again.';
  if(error?.name==='NotFoundError')return 'No camera was found on this device.';
  if(error?.name==='NotReadableError')return 'Another app may be using the camera. Close it and try again.';
  return 'The camera could not start. Check its permissions and connection, then try again.';
}
async function startCamera() {
  stopCamera();const current=token;
  errorBox.hidden=true;retry.hidden=true;
  if(!navigator.mediaDevices?.getUserMedia){showError('This browser cannot access a camera here. Open the site using HTTPS in a current browser.');return}
  $('#start-camera').disabled=true;$('#start-camera').textContent='Starting camera…';
  try {
    const acquired=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:960},height:{ideal:1280}}});
    if(current!==token||modal.hidden){acquired.getTracks().forEach(track=>track.stop());return}
    stream=acquired;video.srcObject=stream;video.style.transform=facing==='user'?'scaleX(-1)':'none';
    await video.play();if(current!==token)return;
    placeholder.hidden=true;status.hidden=false;statusText.textContent='Loading body tracking…';
    await getTracker();if(current!==token)return;
    controls.hidden=false;statusText.textContent='Looking for you…';lastDetection=0;raf=requestAnimationFrame(trackFrame);
  }catch(error){if(current!==token)return;console.error('Camera or pose tracking failed:',error);
    if(stream){stream.getTracks().forEach(track=>track.stop());stream=null;video.srcObject=null}
    showError(error?.name==='NotAllowedError'||error?.name==='NotFoundError'||error?.name==='NotReadableError'?cameraError(error):'Body tracking could not load. Connect to the internet and try again.');
  }finally{$('#start-camera').disabled=false;$('#start-camera').innerHTML='Enable camera <span aria-hidden="true">↗</span>'}
}
$('#start-camera').addEventListener('click',startCamera);
retry.addEventListener('click',startCamera);
$('#flip-camera').addEventListener('click',()=>{facing=facing==='user'?'environment':'user';startCamera()});

function geometry() {
  const bounds=frame.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  const w=bounds.width,h=bounds.height;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
  const scale=Math.max(w/video.videoWidth,h/video.videoHeight);
  const drawnW=video.videoWidth*scale,drawnH=video.videoHeight*scale;
  const offsetX=(w-drawnW)/2,offsetY=(h-drawnH)/2;
  return {w,h,dpr,mapping:{width:w,height:h,x:x=>offsetX+(facing==='user'?1-x:x)*drawnW,y:y=>offsetY+y*drawnH},drawnW,drawnH,offsetX,offsetY};
}
function trackFrame(now) {
  if(!stream||video.readyState<2||modal.hidden)return;
  raf=requestAnimationFrame(trackFrame);
  if(now-lastDetection<85)return;
  lastDetection=now;
  try {
    const {w,h,dpr,mapping}=geometry(),ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const result=landmarker.detectForVideo(video,now),pose=result.landmarks?.[0];
    const found=pose&&renderGarment(ctx,selected,pose,mapping);
    status.classList.toggle('found',!!found);
    statusText.textContent=found?'Your look is live':'Looking for your full pose…';
    guide.hidden=!!found;
    guide.textContent=selected.type==='pants'?'Step back until your hips and legs are visible':'Step back until your shoulders and hips are visible';
  }catch(error){console.error('Pose tracking stopped:',error);stopCamera();showError('Body tracking stopped. Try opening the camera again.')}
}
$('#capture').addEventListener('click',()=>{
  if(!stream||video.readyState<2)return;
  const {w,h,dpr,drawnW,drawnH,offsetX,offsetY}=geometry();
  const output=document.createElement('canvas');output.width=Math.round(w*dpr);output.height=Math.round(h*dpr);
  const ctx=output.getContext('2d');ctx.scale(dpr,dpr);
  if(facing==='user'){ctx.translate(w,0);ctx.scale(-1,1);ctx.drawImage(video,w-offsetX-drawnW,offsetY,drawnW,drawnH);ctx.setTransform(dpr,0,0,dpr,0,0)}
  else ctx.drawImage(video,offsetX,offsetY,drawnW,drawnH);
  ctx.drawImage(canvas,0,0,w,h);
  output.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`forma-${selected.id}-preview.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30_000)},'image/png');
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&stream)stopCamera()});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
