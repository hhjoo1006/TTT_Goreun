import test from 'node:test';
import assert from 'node:assert/strict';
import {createSamplePhotos,prepareSamplePhotos} from '../web/sample-photos.mjs';
const items=Array.from({length:63},(_,i)=>({asset:'photo-'+i,name:'photo-'+i+'.jpg',folder:'travel'}));
const catalog=()=>createSamplePhotos(items,'https://example.test/TTT_Goreun/app/');
test('sample catalog exposes selectable image URLs without decoding all 63 files',()=>{
 const photos=catalog();assert.equal(photos.length,63);assert.equal(new Set(photos.map(p=>p.id)).size,63);
 assert.equal(photos[0].thumb,'https://example.test/TTT_Goreun/app/assets/album/photo-0.jpg');
 assert.equal(photos[0].loading,false);assert.equal(photos[0].samplePrepared,false);assert.equal(photos[0].file,undefined);
});
test('only selected samples are fetched and prepared; preparation is reused',async()=>{
 const photos=catalog(),selected=[photos[0],photos[8]];let fetched=0,decoded=0;
 const options={fetchPhoto:async()=>{fetched++;return new Response(new Blob(['jpeg']));},decode:async file=>{decoded++;return {file,name:file.name,originalUrl:'blob:prepared',data:'data:image/jpeg;base64,YQ==',metrics:{brightness:.5}};}};
 const ids=selected.map(p=>p.id);await prepareSamplePhotos(selected,options);
 assert.equal(fetched,2);assert.equal(decoded,2);assert.equal(photos[1].samplePrepared,false);
 assert.deepEqual(selected.map(p=>p.id),ids);assert.equal(selected[0].metrics.brightness,.5);
 await prepareSamplePhotos(selected,options);assert.equal(fetched,2);assert.equal(decoded,2);
 await prepareSamplePhotos([{sample:false}],options);assert.equal(fetched,2);
});
test('failed sample fetch stays retryable',async()=>{
 const photo=catalog()[0];await assert.rejects(prepareSamplePhotos([photo],{fetchPhoto:async()=>new Response('',{status:503})}),/다시 시도/);assert.equal(photo.samplePrepared,false);
});
test('cancelling sample preparation does not install partial analysis data',async()=>{
 const photo=catalog()[0],controller=new AbortController();
 await assert.rejects(prepareSamplePhotos([photo],{signal:controller.signal,fetchPhoto:async()=>new Response(new Blob(['jpeg'])),decode:async()=>{controller.abort();return {originalUrl:'blob:cancelled',metrics:{}};}}),{name:'AbortError'});
 assert.equal(photo.samplePrepared,false);assert.equal(photo.metrics,undefined);
});
