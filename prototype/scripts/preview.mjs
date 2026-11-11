import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import worker from '../worker/index.mjs';
const env={};
console.log('Ready for private preview settings on stdin');
// Preview credentials arrive via stdin only, never a local environment file.
let input='';for await(const chunk of process.stdin){input+=chunk;if(input.includes('\n'))break;}
Object.assign(env,JSON.parse(input||'{}'));
const types={html:'text/html',css:'text/css',js:'text/javascript',mjs:'text/javascript',svg:'image/svg+xml',woff2:'font/woff2',wasm:'application/wasm',jpg:'image/jpeg',txt:'text/plain'};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:8766');
  if(!url.pathname.startsWith('/api/')){
   const path=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);if(path.includes('..')){res.writeHead(404).end();return;}
   const data=await readFile(new URL('../web'+path,import.meta.url));res.writeHead(200,{'Content-Type':types[path.split('.').pop()]||'application/octet-stream','Cache-Control':'no-cache'}).end(data);return;
  }
  const body=[];for await(const chunk of req)body.push(chunk);
  const request=new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(body)}:{})});
  const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(404).end('Not found');}
});server.listen(8766,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8766/'));
