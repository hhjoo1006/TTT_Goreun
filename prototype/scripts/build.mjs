import {readFile,writeFile,mkdir,rm,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
const files=['index.html','styles.css','app.js','photos.mjs','engine.mjs','storage.mjs','gallery.mjs','zip.mjs','ai.mjs','comparison.mjs','album.mjs','icon.svg','vendor/vision_bundle.mjs','vendor/NOTICE.txt','assets/fonts/LICENSE.txt'];
for(const file of await readdir('web/assets/album'))if(file.endsWith('.jpg')&&!['food.jpg','flowers.jpg'].includes(file))files.push('assets/album/'+file);
const mime={jpg:'image/jpeg',html:'text/html;charset=utf-8',css:'text/css;charset=utf-8',js:'text/javascript;charset=utf-8',mjs:'text/javascript;charset=utf-8',svg:'image/svg+xml',txt:'text/plain;charset=utf-8',woff2:'font/woff2'};
const assets={};for(const path of files){const bytes=await readFile(join('web',path)),ext=path.split('.').pop(),binary=['woff2','jpg'].includes(ext);assets['/'+path]={type:mime[ext],binary,data:bytes.toString(binary?'base64':'utf8')};}
const worker=(await readFile('worker/index.mjs','utf8')).replace('/*__EMBEDDED_ASSETS__*/ {}',JSON.stringify(assets));
if(gzipSync(worker).byteLength>3000000)throw new Error('Worker archive is too large');
await rm('dist',{recursive:true,force:true});await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await writeFile('dist/server/index.js',worker);await writeFile('dist/.openai/hosting.json',await readFile('.openai/hosting.json'));
console.log(`Worker ready · ${Math.round(gzipSync(worker).byteLength/1024)} KB compressed`);
