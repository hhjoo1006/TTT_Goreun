import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeMedia,formatBytes,loadGallery} from '../web/gallery.mjs';
test('uses actual media bytes, deduplicates, ignores other files',()=>{
 const a={name:'a.jpg',type:'image/jpeg',size:1200000,lastModified:1};
 const s=summarizeMedia([a,a,{name:'b.mov',type:'video/quicktime',size:5000000,lastModified:2},{name:'readme.txt',type:'text/plain',size:400}],42);
 assert.deepEqual(s,{photos:{count:1,bytes:1200000},videos:{count:1,bytes:5000000},totalBytes:6200000,updatedAt:42});
});
test('recognizes HEIC with empty mime type and rejects invalid bytes',()=>{
 const s=summarizeMedia([{name:'a.HEIC',type:'',size:23000},{name:'bad.jpg',size:-1}]);
 assert.equal(s.photos.count,1);assert.equal(s.totalBytes,23000);
});
test('formats small and large selections rather than rounding all to zero GB',()=>{
 assert.deepEqual(formatBytes(6200000),{value:'6.2',unit:'MB'});
 assert.deepEqual(formatBytes(38000000000),{value:'38',unit:'GB'});
 assert.deepEqual(formatBytes(NaN),{value:'—',unit:''});
});
test('rejects corrupt stored summaries instead of inventing storage capacity',()=>{
 globalThis.localStorage={getItem:()=>JSON.stringify({choice:'allowed',summary:{totalBytes:7,photos:{bytes:8,count:1},videos:{bytes:0,count:0},updatedAt:1}})};
 assert.deepEqual(loadGallery(),{choice:'allowed',summary:null});
 globalThis.localStorage={getItem:()=>'{oops'};
 assert.deepEqual(loadGallery(),{choice:null,summary:null});
});
