const key='goreun-gallery-v1';
export function summarizeMedia(files,updatedAt=Date.now()){
  const photos={count:0,bytes:0},videos={count:0,bytes:0},seen=new Set();
  for(const file of files){
    const identity=`${file.name}:${file.size}:${file.lastModified}`;
    if(seen.has(identity))continue;seen.add(identity);
    const size=Number(file.size);if(!Number.isSafeInteger(size)||size<0)continue;
    const isPhoto=file.type?.startsWith('image/')||/\.(jpe?g|png|webp|heic|heif|avif|gif|bmp|tiff?)$/i.test(file.name||'');
    const isVideo=file.type?.startsWith('video/')||/\.(mov|mp4|m4v|webm|3gp|mkv|avi)$/i.test(file.name||'');
    const group=isPhoto?photos:isVideo?videos:null;if(!group)continue;
    group.count++;group.bytes+=size;
  }
  return {photos,videos,totalBytes:photos.bytes+videos.bytes,updatedAt};
}
export function formatBytes(bytes){
  if(!Number.isFinite(bytes)||bytes<0)return {value:'—',unit:''};
  if(bytes===0)return {value:'0',unit:'B'};
  const units=['B','KB','MB','GB','TB'],i=Math.min(units.length-1,Math.floor(Math.log(bytes)/Math.log(1000)));
  return {value:new Intl.NumberFormat('ko-KR',{maximumFractionDigits:i?1:0}).format(bytes/(1000**i)),unit:units[i]};
}
export function loadGallery(){
  try{
    const data=JSON.parse(localStorage.getItem(key)||'null');
    if(!data||!['allowed','declined'].includes(data.choice))return {choice:null,summary:null};
    const s=data.summary;
    const valid=s&&[s.photos?.count,s.photos?.bytes,s.videos?.count,s.videos?.bytes,s.totalBytes,s.updatedAt].every(n=>Number.isSafeInteger(n)&&n>=0)&&s.totalBytes===s.photos.bytes+s.videos.bytes;
    return {choice:data.choice,summary:data.choice==='allowed'&&valid?s:null};
  }catch{return {choice:null,summary:null};}
}
export function saveGallery(value){localStorage.setItem(key,JSON.stringify(value));}
