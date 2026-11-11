import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function buildPages({basePath='/TTT_Goreun',outDir=join(root,'dist/pages')}={}){
 const base=basePath==='/'?'':basePath.replace(/\/$/,'');
 if(base&&!/^\/[A-Za-z0-9_.-]+$/.test(base))throw new Error('Expected a root or repository Pages base path');
 await rm(outDir,{recursive:true,force:true});await mkdir(outDir,{recursive:true});
 await cp(join(root,'landing'),outDir,{recursive:true});
 await cp(join(root,'prototype/web'),join(outDir,'app'),{recursive:true});
 for(const file of ['index.html','app/index.html']){
  const path=join(outDir,file),html=await readFile(path,'utf8');
  await writeFile(path,html.replace(/href="\/(?!\/)([^"]*)"/g,(_,rest)=>`href="${base}/${rest}"`));
 }
 // Pages has no API runtime. Return a real config response and keep local analysis available.
 const appPath=join(outDir,'app/app.js');
 const app=await readFile(appPath,'utf8');
 if(!app.includes("fetch('/api/config'"))throw new Error('AI config request changed; review the Pages build');
 await writeFile(appPath,app.replace("fetch('/api/config'",`fetch('${base}/api/config.json'`).replace("fetch('/api/analyze'",`fetch('${base}/api/analyze'`));
 await mkdir(join(outDir,'api'),{recursive:true});
 await writeFile(join(outDir,'api/config.json'),JSON.stringify({gemini:false}));
 await writeFile(join(outDir,'.nojekyll'),'');
 // Keep the previous landing URL usable, including incoming campaign parameters and section anchors.
 await mkdir(join(outDir,'landing'),{recursive:true});
 await writeFile(join(outDir,'landing/index.html'),`<!doctype html><html lang="ko"><meta charset="utf-8"><title>고른</title><a href="${base}/">고른으로 이동</a><script>location.replace(${JSON.stringify(base+'/')}+location.search+location.hash);</script></html>`);
 return outDir;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const out=await buildPages({basePath:process.env.PAGES_BASE_PATH??'/TTT_Goreun'});
 console.log('GitHub Pages build ready:',out);
}
