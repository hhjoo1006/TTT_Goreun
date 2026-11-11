import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../worker/index.mjs',import.meta.url),'utf8');
const assets=Object.fromEntries([
 ['/landing/index.html','landing','text/html'],['/index.html','service','text/html'],
 ['/landing/styles.css','landing styles','text/css'],['/styles.css','service styles','text/css'],
 ['/app.js','service script','text/javascript'],['/assets/album/example.jpg','image','image/jpeg']
].map(([path,data,type])=>[path,{data,type,binary:false}]));
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source.replace('/*__EMBEDDED_ASSETS__*/ {}',JSON.stringify(assets))).toString('base64'));
const get=(path,method='GET')=>worker.fetch(new Request('https://goreun.example'+path,{method}),{});
test('landing and service have separate pages and relative asset namespaces',async()=>{
 for(const [path,body] of [['/','landing'],['/index.html','landing'],['/app/','service'],['/app/index.html','service'],['/styles.css','landing styles'],['/app/styles.css','service styles'],['/app/app.js','service script'],['/app/assets/album/example.jpg','image']]){
  const response=await get(path);assert.equal(response.status,200,path);assert.equal(await response.text(),body,path);
 }
 assert.equal((await get('/app/missing.js')).status,404);
 assert.equal(await (await get('/app/','HEAD')).text(),'');
});
test('canonical routes retain incoming query parameters',async()=>{
 for(const [path,target] of [['/app?start=pick','/app/?start=pick'],['/landing/?utm_source=kakao','/?utm_source=kakao']]){
  const response=await get(path);assert.equal(response.status,308);assert.equal(response.headers.get('location'),'https://goreun.example'+target);
 }
});
test('API and face model routes remain available after moving service to /app',async()=>{
 assert.equal((await (await get('/api/config')).json()).gemini,false);
 const model=await get('/app/vendor/face_landmarker.task');assert.equal(model.status,302);assert.match(model.headers.get('location'),/^https:\/\/storage.googleapis.com\//);
});
