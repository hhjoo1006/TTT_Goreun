import test from 'node:test';
import assert from 'node:assert/strict';
import {comparisonCrop,comparisonFaces} from '../web/comparison.mjs';
test('faces align by left-to-right position without mutating model order',()=>{
 const right={box:[.7,.2,.15,.3]},left={box:[.1,.2,.1,.2]},photo={face:{faces:[right,left]}};
 assert.deepEqual(comparisonFaces(photo),[left,right]);assert.equal(photo.face.faces[0],right);
});
test('eye and smile crops follow real landmarks and stay within the photo',()=>{
 const photo={face:{box:[.8,.7,.18,.28],eyes:[.9,.78],mouth:[.9,.94]}};
 const eye=comparisonCrop(photo,1200,800,'eyes'),mouth=comparisonCrop(photo,1200,800,'mouth');
 assert.ok(mouth.y>eye.y);for(const crop of [eye,mouth]){assert.ok(crop.x>=0&&crop.y>=0);assert.ok(crop.x+crop.width<=1200);assert.ok(crop.y+crop.height<=800);assert.equal(crop.width,crop.height);}
});
test('face crops normalize the same face across different source resolutions',()=>{
 const photo={face:{box:[.3,.2,.2,.4]}};
 const a=comparisonCrop(photo,1000,800),b=comparisonCrop(photo,2000,1600);
 assert.equal(a.width*2,b.width);assert.equal(a.x*2,b.x);assert.equal(a.y*2,b.y);
});
test('unknown face uses Gemini focus and full framing remains uncropped',()=>{
 const photo={focus:[.9,.2]};const crop=comparisonCrop(photo,1000,800);
 assert.ok(crop.x>500);assert.deepEqual(comparisonCrop(photo,1000,800,'whole'),{x:0,y:0,width:1000,height:800});
});
