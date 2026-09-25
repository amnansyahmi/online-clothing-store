import test from 'node:test';
import assert from 'node:assert/strict';
import { products, productArt, renderGarment } from './garments.js';

function fakeCanvas() {
  const calls=[];
  return {calls,beginPath(){},moveTo(...args){calls.push(['move',...args])},lineTo(...args){calls.push(['line',...args])},closePath(){},fill(){calls.push(['fill'])},stroke(){},save(){},restore(){},arc(){}};
}
const mapping={width:400,height:720,x:x=>x*400,y:y=>y*720};
function samplePose(withLegs=true) {
  const p=Array.from({length:33},()=>({x:.5,y:.5,visibility:0}));
  const positions={11:[.37,.2],12:[.63,.2],23:[.4,.46],24:[.6,.46],25:[.42,.7],26:[.58,.7],27:[.43,.93],28:[.57,.93]};
  for(const [index,[x,y]] of Object.entries(positions))p[index]={x,y,visibility:withLegs||Number(index)<25?1:0};
  return p;
}

test('catalog includes every garment type and unique product identifiers',()=>{
  assert.deepEqual(new Set(products.map(p=>p.type)),new Set(['top','dress','pants']));
  assert.equal(new Set(products.map(p=>p.id)).size,products.length);
  products.forEach(p=>assert.match(productArt(p),/<svg[\s\S]*<\/svg>/));
});

test('all garment types draw when the needed body landmarks are visible',()=>{
  for(const product of products){const ctx=fakeCanvas();assert.equal(renderGarment(ctx,product,samplePose(),mapping),true,product.id);assert.ok(ctx.calls.some(call=>call[0]==='fill'),product.id)}
});

test('trousers need legs; tops and dresses keep rendering when legs are outside the frame',()=>{
  const pose=samplePose(false);
  assert.equal(renderGarment(fakeCanvas(),products.find(p=>p.type==='pants'),pose,mapping),false);
  assert.equal(renderGarment(fakeCanvas(),products.find(p=>p.type==='top'),pose,mapping),true);
  assert.equal(renderGarment(fakeCanvas(),products.find(p=>p.type==='dress'),pose,mapping),true);
});

test('an incomplete or tiny pose does not paint a misleading overlay',()=>{
  const ctx=fakeCanvas(),pose=samplePose();pose[11].visibility=.1;
  assert.equal(renderGarment(ctx,products[0],pose,mapping),false);
  assert.equal(ctx.calls.length,0);
});
