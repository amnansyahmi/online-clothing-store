export const products = [
  { id:'linen-shirt', name:'Collared shirt', type:'top', colorName:'Sand', color:'#e9d9ba', trim:'#cfbd9c', tile:'#e6e5de' },
  { id:'studio-tee', name:'Crew-neck top', type:'top', colorName:'Clay', color:'#8d4538', trim:'#713a31', tile:'#e3d7d1' },
  { id:'column-dress', name:'Straight dress', type:'dress', colorName:'Deep green', color:'#303d32', trim:'#243027', tile:'#dce1d7' },
  { id:'daylight-dress', name:'Flared dress', type:'dress', colorName:'Peach', color:'#d7a27e', trim:'#bd8567', tile:'#ebddd4' },
  { id:'tailored-trouser', name:'Straight trousers', type:'pants', colorName:'Charcoal', color:'#545a56', trim:'#424844', tile:'#dce0dc' },
  { id:'weekend-trouser', name:'Relaxed trousers', type:'pants', colorName:'Oat', color:'#c6b295', trim:'#ae9c83', tile:'#e8e2d8' },
];

// Original vector garment artwork is also used for the collection thumbnails.
export function productArt(product) {
  const c=product.color, t=product.trim;
  const common=`<defs><linearGradient id="g-${product.id}" x1="0" x2="1"><stop stop-color="${t}"/><stop offset=".38" stop-color="${c}"/><stop offset=".8" stop-color="${c}"/><stop offset="1" stop-color="${t}"/></linearGradient></defs>`;
  let shape;
  if (product.type==='top') {
    const shirt=product.id==='linen-shirt';
    shape=`<path d="M88 45 L105 37 L119 52 L141 52 L155 37 L173 45 L211 90 L188 115 L174 101 L177 246 Q130 254 83 246 L86 101 L72 115 L49 90 Z" fill="url(#g-${product.id})" stroke="${t}" stroke-width="2"/>`+
      (shirt?`<path d="M105 37 L130 70 L119 52 Z M155 37 L130 70 L141 52 Z" fill="${t}"/><path d="M130 70 L130 241" stroke="${t}" stroke-width="2"/><circle cx="130" cy="105" r="2" fill="${t}"/><circle cx="130" cy="139" r="2" fill="${t}"/><circle cx="130" cy="173" r="2" fill="${t}"/>`:`<path d="M108 40 Q130 72 152 40" fill="none" stroke="${t}" stroke-width="6"/>`)+
      `<path d="M84 117 L93 108 M176 108 L185 117 M87 228 Q130 235 173 228" stroke="${t}" stroke-width="2" fill="none" opacity=".65"/>`;
  } else if (product.type==='dress') {
    shape=`<path d="M103 37 L118 48 Q130 62 142 48 L157 37 L194 74 L179 110 L164 99 L163 175 L196 276 Q130 291 64 276 L97 175 L96 99 L81 110 L66 74 Z" fill="url(#g-${product.id})" stroke="${t}" stroke-width="2"/><path d="M97 168 Q130 179 163 168 M103 37 Q130 87 157 37" fill="none" stroke="${t}" stroke-width="3"/><path d="M84 272 Q130 282 176 272" stroke="${t}" opacity=".6" fill="none"/>`;
  } else {
    shape=`<path d="M81 37 Q130 42 179 37 L176 119 L158 278 L131 278 L130 133 L129 133 L128 278 L101 278 L84 119 Z" fill="url(#g-${product.id})" stroke="${t}" stroke-width="2"/><path d="M82 57 Q130 63 178 57 M130 59 L130 123 M94 84 L108 102 M166 84 L152 102 M101 268 L128 268 M132 268 L159 268" stroke="${t}" stroke-width="2" fill="none"/>`;
  }
  return `<svg class="product-art" viewBox="0 0 260 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of ${product.name}">${common}${shape}</svg>`;
}

function point(landmarks, index, mapping) {
  const p=landmarks[index];
  if (!p || (p.visibility??1)<.45) return null;
  return {x:mapping.x(p.x),y:mapping.y(p.y)};
}
const between=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const scaleFrom=(center,p,f)=>({x:center.x+(p.x-center.x)*f,y:center.y+(p.y-center.y)*f});
function drawPolygon(ctx,points,color,trim) {
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
  ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=trim;ctx.lineWidth=2;ctx.stroke();
}
function seam(ctx,a,b,trim,width=1.5){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=trim;ctx.lineWidth=width;ctx.stroke()}

export function renderGarment(ctx, product, landmarks, mapping) {
  const s1=point(landmarks,11,mapping),s2=point(landmarks,12,mapping);
  const h1=point(landmarks,23,mapping),h2=point(landmarks,24,mapping);
  if (![s1,s2,h1,h2].every(Boolean)) return false;
  const [sl,sr]=s1.x<s2.x?[s1,s2]:[s2,s1];
  const [hl,hr]=h1.x<h2.x?[h1,h2]:[h2,h1];
  const shoulderWidth=Math.hypot(sr.x-sl.x,sr.y-sl.y);
  const torsoHeight=Math.abs((hl.y+hr.y)/2-(sl.y+sr.y)/2);
  if (shoulderWidth<25 || torsoHeight<35 || shoulderWidth>mapping.width*.85) return false;
  const c=product.color,t=product.trim;
  ctx.save();ctx.lineJoin='round';
  if(product.type==='pants'){
    const k1=point(landmarks,25,mapping),k2=point(landmarks,26,mapping);
    const a1=point(landmarks,27,mapping),a2=point(landmarks,28,mapping);
    if(![k1,k2,a1,a2].every(Boolean)){ctx.restore();return false}
    const [kl,kr]=k1.x<k2.x?[k1,k2]:[k2,k1], [al,ar]=a1.x<a2.x?[a1,a2]:[a2,a1];
    const hipWidth=Math.hypot(hr.x-hl.x,hr.y-hl.y),w=hipWidth*.12;
    const waistL=scaleFrom(between(hl,hr,.5),hl,1.16),waistR=scaleFrom(between(hl,hr,.5),hr,1.16);
    const crotch=between(between(hl,hr,.5),between(kl,kr,.5),.31);
    drawPolygon(ctx,[waistL,between(hl,hr,.48),crotch,{x:kl.x+w,y:kl.y},{x:al.x+w*.77,y:al.y},{x:al.x-w*.77,y:al.y},{x:kl.x-w,y:kl.y}],c,t);
    drawPolygon(ctx,[between(hl,hr,.52),waistR,{x:kr.x+w,y:kr.y},{x:ar.x+w*.77,y:ar.y},{x:ar.x-w*.77,y:ar.y},{x:kr.x-w,y:kr.y},crotch],c,t);
    seam(ctx,waistL,waistR,t,2);seam(ctx,between(hl,hr,.5),crotch,t);
  } else {
    const center=between(sl,sr,.5), sleeveWidth=shoulderWidth*.23;
    const outerL=scaleFrom(center,sl,1.18),outerR=scaleFrom(center,sr,1.18);
    const sleeveL={x:outerL.x-sleeveWidth*.65,y:outerL.y+torsoHeight*.42};
    const sleeveR={x:outerR.x+sleeveWidth*.65,y:outerR.y+torsoHeight*.42};
    const armpitL=between(sl,hl,.34),armpitR=between(sr,hr,.34);
    let hemL=scaleFrom(between(hl,hr,.5),hl,1.1), hemR=scaleFrom(between(hl,hr,.5),hr,1.1);
    if(product.type==='dress'){
      const k1=point(landmarks,25,mapping),k2=point(landmarks,26,mapping);
      const avgKnee=k1&&k2?(k1.y+k2.y)/2:(hl.y+hr.y)/2+torsoHeight*.9;
      const hemY=Math.min(mapping.height+20,avgKnee+torsoHeight*.12);
      const widen=shoulderWidth*(product.id==='daylight-dress'?.67:.48);
      hemL={x:hl.x-widen,y:hemY};hemR={x:hr.x+widen,y:hemY};
    }
    drawPolygon(ctx,[outerL,between(sl,center,.38),between(sr,center,.38),outerR,sleeveR,{x:armpitR.x+sleeveWidth*.36,y:armpitR.y},hemR,hemL,{x:armpitL.x-sleeveWidth*.36,y:armpitL.y},sleeveL],c,t);
    seam(ctx,between(hl,hr,.5),between(hemL,hemR,.5),t,.7);
    if(product.type==='dress')seam(ctx,hl,hr,t,2);
    if(product.id==='linen-shirt'){
      seam(ctx,center,between(hemL,hemR,.5),t,1.6);
      ctx.fillStyle=t;for(let i=1;i<=3;i++){const b=between(center,between(hl,hr,.5),i/4);ctx.beginPath();ctx.arc(b.x,b.y,Math.max(1.5,shoulderWidth*.012),0,Math.PI*2);ctx.fill()}
    }
  }
  ctx.restore();return true;
}
