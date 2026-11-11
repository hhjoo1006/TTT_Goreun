import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildPages} from '../scripts/build-pages.mjs';
for(const basePath of ['/TTT_Goreun',''])test(`Pages links, local config and model assets at ${basePath||'/'}`,async()=>{
 const outDir=await mkdtemp(join(tmpdir(),'goreun-pages-'));
 try{
  await buildPages({basePath,outDir});
  for(const path of ['index.html','app/index.html']){
   const html=await readFile(join(outDir,path),'utf8');
   for(const [,ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|#)/.test(ref))continue;
    const url=new URL(ref,`https://example.test${basePath}/${path}`);
    assert.ok(url.pathname.startsWith(basePath+'/'),url.pathname);
    let relative=url.pathname.slice(basePath.length+1);if(!relative||relative.endsWith('/'))relative+='index.html';
    await access(join(outDir,relative));
   }
  }
  const landing=await readFile(join(outDir,'index.html'),'utf8');
  assert.equal(landing.split(`href="${basePath}/app/"`).length-1,4);
  assert.equal(landing.includes('start=pick'),false);
  const app=await readFile(join(outDir,'app/app.js'),'utf8');
  assert.ok(app.includes(`fetch('${basePath}/api/config.json'`));
  assert.deepEqual(JSON.parse(await readFile(join(outDir,'api/config.json'),'utf8')),{gemini:false});
  for(const asset of ['app/album.mjs','app/vendor/face_landmarker.task','app/vendor/wasm/vision_wasm_internal.wasm','assets/fonts/Pretendard-Regular.woff2','app/assets/album/baby-01.jpg','.nojekyll'])await access(join(outDir,asset));
  await assert.rejects(access(join(outDir,'worker')));
 }finally{await rm(outDir,{recursive:true,force:true});}
});
