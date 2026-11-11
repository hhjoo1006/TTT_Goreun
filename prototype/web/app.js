import { applyEntryTitle, applyEntryButton } from './entry-copy.mjs?v=pet-3';
import { makeZip } from './zip.mjs';
import { albums, sampleAlbum, albumPhotos } from './album.mjs?v=daily-samples-1';
import { comparisonCrop, comparisonFaces } from './comparison.mjs';
import { decodeFile, detectFaces, mapLimited, MAX_FILES } from './photos.mjs';
import { classify, partitionPhotos, parseStory } from './engine.mjs';
import { loadSettings, saveSettings, profileKey, loadTaste, saveTaste } from './storage.mjs';
import {reviewResult,analysisPayload} from './ai.mjs';
import {summarizeMedia,loadGallery,saveGallery} from './gallery.mjs';

const $ = (id) => document.getElementById(id);
applyEntryTitle($('entry-title'), location.search);applyEntryButton($('home-start'), location.search);
const icons = {
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7"/>',
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  chosen:'<path d="M14 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9m-5-7 3 3 6-7"/><circle cx="8" cy="9" r=".8"/>',
  photo:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
  video:'<path d="M6 3v18l15-9Z"/>',file:'<path d="M14 2H5v20h14V7Zm0 0v6h5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',up:'<path d="M12 20V4m-6 6 6-6 6 6"/>', 
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  sliders:'<path d="M3 6h7m4 0h7M3 12h12m4 0h2M3 18h3m4 0h11"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',book:'<path d="M12 5v15M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',spark:'<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3ZM20 2v4M18 4h4"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',back:'<path d="M20 12H4m6-6-6 6 6 6"/>',plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12 4 4L20 5"/>',
  images:'<rect x="7" y="3" width="15" height="15" rx="2"/><path d="M17 21H4a2 2 0 0 1-2-2V7M7 14l4-4 6 7M16 12l2-2 4 4"/><circle cx="17" cy="7" r="1"/>',
  shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>',heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  share:'<path d="M12 16V3m-5 5 5-5 5 5M5 12v8h14v-8"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',parents:'<circle cx="8" cy="7" r="3"/><circle cx="17" cy="12" r="2.5"/><path d="M2 20v-3a6 6 0 0 1 11-3M13 21v-2a4 4 0 0 1 8 0v2"/>',camera:'<rect x="2" y="6" width="20" height="15" rx="3"/><path d="m8 6 2-3h4l2 3"/><circle cx="12" cy="13" r="4"/>',
  blur:'<path d="m3 7 5-3m-5 9 10-6M3 19l16-9m-10 11 12-7m-5 7 5-3"/>',duplicate:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',eyes:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><path d="m3 3 18 18"/>',dark:'<path d="M20 15a9 9 0 0 1-11-11 9 9 0 1 0 11 11Z"/>',tilt:'<rect x="5" y="5" width="14" height="14" rx="2" transform="rotate(-12 12 12)"/><path d="M1 21h22"/>',zoom:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>'
};
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
const targets = [{id:'general',label:'일반',icon:'user'},{id:'parents',label:'엄마·아빠',icon:'parents'},{id:'influencer',label:'인플루언서',icon:'camera'}];
const subjects = ['여행','인물','동물','음식','제품'];
const criteria = [{id:'blur',label:'흔들림'},{id:'tilt',label:'구도 기울기'},{id:'duplicate',label:'중복·유사'},{id:'eyes',label:'눈 감음'},{id:'dark',label:'어두운 사진'}];
const state = { settings:loadSettings(), draft:null, refs:[], settingsRefs:[], settingsProfile:'', photos:[], included:new Set(), chosen:new Set(), cleanup:new Set(), candidates:[], result:null,
  demo:null, screen:'', tab:'candidates', reading:0, version:0, controller:null, focus:true, currentPhotos:[], viewerIndex:0, zoom:1, pan:[0,0], faceFailed:false, refsLoading:false, tasteReading:false, lastLimit:1, pickCountMode:'1', aiAvailable:false, aiReview:null, analysisStory:'', askingConsent:false, localOnly:false };
let toastTimer, refVersion = 0, importToken = 0;
const uid = () => crypto.randomUUID();
const node = (tag, cls, text) => { const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el; };
function toast(message) { $('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500); }
function show(screen) {
  state.screen=screen; document.querySelectorAll('main>.screen').forEach((el)=>el.hidden=el.id!==`${screen}-screen`);
  const active=screen==='home'?'home':screen==='settings'?'settings':'organize';
  for(const name of ['home','organize','settings']){const item=$(`nav-${name}`);item.classList.toggle('active',name===active);if(name===active)item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');}
  $('global-header').hidden=screen==='home';document.body.dataset.screen=screen;
  window.scrollTo({top:0,behavior:'instant'});
  const title=$(`${screen}-screen`).querySelector('h1');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}
  if(screen==='organize'){$('album-tabs').scrollLeft=0;$('album-expand').focus({preventScroll:true});}
}
function choice(labelText, value, name, checked, type='checkbox', glyph) {
  const label=node('label','choice'),input=node('input');input.type=type;input.name=name;input.value=value;input.checked=checked;
  const span=node('span',glyph?'target-choice':'chip');if(glyph)span.innerHTML=icon(glyph);span.append(node('span','',labelText));label.append(input,span);return label;
}
async function getRefs(settings) { try{return await loadTaste(profileKey(settings));}catch{return [];} }
function lockSettings(){const locked=state.refsLoading||state.tasteReading;$('save-settings').disabled=locked;$('default-settings').disabled=locked;$('add-taste').disabled=locked;}
async function switchSettingsRefs() {
  const version=++refVersion,key=profileKey(state.draft);state.settingsProfile=key;state.settingsRefs=[];state.refsLoading=true;lockSettings();
  const refs=await getRefs(state.draft);if(version!==refVersion)return;state.settingsRefs=refs;state.refsLoading=false;lockSettings();renderTaste();
}
function renderSettingsOptions() {
  const draft=state.draft;
  $('criteria-options').replaceChildren(...criteria.map((c)=>{
    const label=node('label','criterion'),input=node('input');input.type='checkbox';input.name='criterion';input.value=c.id;input.checked=draft.criteria.includes(c.id);label.innerHTML=icon(c.id);label.append(node('span','',c.label),input);return label;
  }));

}
async function openSettings() {
  if(state.controller){toast('분석을 취소한 뒤 설정을 바꿔주세요.');return;}
  state.settingsReturn=state.screen==='home'?'home':'organize';state.draft=structuredClone(state.settings);state.draft.sns='Instagram';
  $('settings-eyebrow').textContent=state.settings.configured?'언제든 바꿀 수 있어요':'처음 한 번만 설정해요';
  $('settings-title').textContent=state.settings.configured?'내 취향과 공통 기준.':'내 취향과 공통 기준.';
  $('save-settings').innerHTML=(state.settings.configured?'설정 저장':'저장하고 사진 고르기')+icon('arrow');
  $('default-settings').hidden=state.settings.configured;
  renderSettingsOptions();show('settings');await switchSettingsRefs();
}
function renderTaste() {
  $('taste-grid').replaceChildren();
  for(const ref of state.settingsRefs){
    const card=node('div','taste-photo'),image=node('img');image.src=ref.thumb;image.alt=ref.name;
    const remove=node('button','','×');remove.type='button';remove.setAttribute('aria-label',`${ref.name} 취향에서 빼기`);
    remove.onclick=async()=>{state.settingsRefs=state.settingsRefs.filter((p)=>p.id!==ref.id);try{await saveTaste(state.settingsProfile,state.settingsRefs);}catch{toast('이번 실행에만 반영돼요. 기기 저장 공간을 확인해 주세요.');}renderTaste();};
    card.append(image,remove);$('taste-grid').append(card);
  }
  if(state.settingsRefs.length<10){const add=node('button','taste-empty','+');add.type='button';add.setAttribute('aria-label','내 취향 사진 추가');add.onclick=()=>$('taste-input').click();$('taste-grid').append(add);}
  const profile='내 인스타 취향';
  $('taste-note').textContent=`${profile} · ${state.settingsRefs.length}/10장. 사진을 고르지 않고 시작해도 돼요.`;
}
$('settings-form').addEventListener('change',async(event)=>{
  const input=event.target;
  if(input.name==='criterion')state.draft.criteria=[...document.querySelectorAll('[name=criterion]:checked')].map(el=>el.value);
});
$('add-taste').onclick=()=>$('taste-input').click();
$('taste-input').onchange=async(event)=>{
  if(state.refsLoading||state.tasteReading)return;state.tasteReading=true;lockSettings();
  const files=[...event.target.files];event.target.value='';const key=state.settingsProfile,version=refVersion;
  const room=10-state.settingsRefs.length;if(files.length>room)toast(`취향 사진은 최대 10장까지 저장해요. ${room}장만 추가할게요.`);
  $('taste-note').textContent='취향 사진의 색감과 밝기를 준비하고 있어요…';
  const prepared=await mapLimited(files.slice(0,room),async(file)=>{try{return await decodeFile(file);}catch(error){toast(error.message);return null;}});
  const refs=prepared.filter(Boolean).map((p)=>{URL.revokeObjectURL(p.originalUrl);return{id:uid(),name:p.name,thumb:p.thumb,data:p.data,metrics:p.metrics};});
  state.tasteReading=false;lockSettings();
  if(version!==refVersion){toast('설정이 바뀌어 취향 사진을 추가하지 않았어요. 다시 골라주세요.');return;}
  state.settingsRefs.push(...refs);try{await saveTaste(key,state.settingsRefs);}catch{toast('취향을 기기에 저장하지 못했어요. 이번 실행에서만 참고해요.');}renderTaste();
};
async function persistSettings() {
  if(state.refsLoading||state.tasteReading)return;
  if(!state.draft.subjects.length){toast('정리할 사진 대상을 하나 이상 골라주세요.');return;}
  state.draft.sns='Instagram';state.draft.configured=true;state.settings=structuredClone(state.draft);state.refs=[...state.settingsRefs];
  try{saveSettings(state.settings);}catch{toast('설정을 기기에 저장하지 못했어요. 이번 실행에만 적용돼요.');}
  state.aiReview=null;refreshContext();show(state.settingsReturn||'organize');
}
$('settings-form').onsubmit=(event)=>{event.preventDefault();persistSettings();};$('default-settings').onclick=persistSettings;
for(const id of ['nav-settings','edit-settings','home-taste'])$(id).onclick=openSettings;
function goHome(){state.controller?.abort();show('home');}
function goOrganize(){state.controller?.abort();refreshContext();state.album='device';mountPhotos();show('organize');}
$('nav-home').onclick=goHome;$('back-home').onclick=goHome;
$('nav-organize').onclick=goOrganize;$('home-start').onclick=goOrganize;
let gallery=loadGallery();
function persistGallery(){try{saveGallery(gallery);}catch{toast('연결 정보는 이번 실행에서만 유지돼요.');}}
// Fixed prototype scenario: 60 GB of photos + 36 GB of videos = 75% of 128 GB.
function renderGallery(){}

function acceptGallery(files){
  const summary=summarizeMedia(files);
  if(!summary.photos.count&&!summary.videos.count){toast('선택한 사진·영상이 없어 연결하지 않았어요.');return false;}
  gallery={choice:'allowed',summary};persistGallery();renderGallery();return true;
}
function refreshContext() {}
state.album='device';state.albumConfirmed=false;
let catalogLoaded=false,catalogLoading=false;
async function ensureAlbum(){
 if(catalogLoaded||state.reading)return;
 catalogLoaded=true;catalogLoading=true;mountPhotos();
 try{
  const files=await mapLimited(sampleAlbum,async item=>{const response=await fetch(`assets/album/${item.asset}.jpg`);if(!response.ok)throw new Error('앨범을 준비하지 못했어요.');return new File([await response.blob()],item.name,{type:'image/jpeg'});});
  await importFiles(files,null,{autoSelect:false,metadata:sampleAlbum.map(p=>({...p,sample:true}))});
 }catch{catalogLoaded=false;toast('예시 앨범을 열지 못했어요. 내 사진으로 시작할 수 있어요.');}
 finally{catalogLoading=false;mountPhotos();}
}

function visibleAlbumPhotos(){const photos=state.albumConfirmed?state.photos:state.photos.filter(photo=>state.album==='device'?!photo.sample:photo.sample);return albumPhotos(photos,state.album==='device'?'recent':state.album,state.included,state.albumConfirmed);}
function requestedCount(){return state.pickCountMode==='custom'?Number($('pick-count-input').value):Number(state.pickCountMode);}
function validRequestedCount(){const n=requestedCount();return Number.isInteger(n)&&n>=1&&n<=state.included.size;}
function updateCountOptions(){
 const max=state.included.size;
 document.querySelectorAll('[data-pick-count]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.pickCount===state.pickCountMode));button.disabled=button.dataset.pickCount!=='custom'&&Number(button.dataset.pickCount)>max;});
 $('pick-count-custom').hidden=state.pickCountMode!=='custom';$('pick-count-input').max=String(max);$('pick-count-max').textContent=`장 · 최대 ${max}장`;
}
document.querySelectorAll('[data-pick-count]').forEach(button=>button.onclick=()=>{state.pickCountMode=button.dataset.pickCount;updatePhotoStatus();});
$('pick-count-input').oninput=()=>updatePhotoStatus();
function updatePhotoStatus() {
 updateCountOptions();
 $('photo-count').textContent=`${state.included.size}장 선택${state.albumConfirmed?' 완료':''}`;
 if(!state.albumConfirmed&&document.activeElement===$('story'))$('story').blur();
 $('story-composer').hidden=!state.albumConfirmed;
 $('organize-disclosure').hidden=!state.albumConfirmed;
 $('confirm-photos').setAttribute('aria-expanded',String(state.albumConfirmed));
 $('analyze').hidden=!state.albumConfirmed;
 $('analyze').disabled=state.reading>0||state.included.size<2||!state.albumConfirmed||!validRequestedCount();
 $('confirm-photos').disabled=state.reading>0||state.included.size<2;
 $('confirm-photos').textContent=state.albumConfirmed?'다시 선택':'선택 완료';
 $('confirm-photos').classList.toggle('secondary',state.albumConfirmed);$('confirm-photos').classList.toggle('primary',!state.albumConfirmed);
 $('album-expand').disabled=state.reading>0||catalogLoading;
 $('album-expand').hidden=false;
 $('empty-photo-picker').disabled=state.reading>0||catalogLoading;
 $('composer-status').textContent=state.reading?'사진을 준비하고 있어요…':'';
 $('album-filters').hidden=state.albumConfirmed;
 $('photo-toolbar').hidden=!state.photos.length||state.albumConfirmed;
 const visible=visibleAlbumPhotos();$('album-empty').hidden=visible.length>0;
}
function photoTile(photo) {
 const tile=node('div','photo-thumb album-photo'+(photo.loading?' skeleton':''));tile.dataset.id=photo.id;
 if(photo.loading){tile.setAttribute('aria-label',`${photo.name} 준비 중`);return tile;}
 const label=node('label','album-photo-label'),check=node('input','thumb-check');check.type='checkbox';check.checked=state.included.has(photo.id);check.setAttribute('aria-label',`${photo.name} 정리 대상으로 선택`);
 const image=node('img');image.src=photo.thumb;image.alt=photo.name;image.loading='lazy';const tick=node('span','album-tick',check.checked?'✓':'');tick.setAttribute('aria-hidden','true');
 check.onchange=()=>{if(check.checked&&state.included.size>=MAX_FILES){check.checked=false;toast(`한 번에 최대 ${MAX_FILES}장까지 골라주세요.`);return;}check.checked?state.included.add(photo.id):state.included.delete(photo.id);state.albumConfirmed=false;mountPhotos();};label.append(check,image,tick);
 tile.append(label);return tile;
}
function mountPhotos(){
 $('photo-grid').replaceChildren(...visibleAlbumPhotos().map(photoTile));
 $('album-expand').setAttribute('aria-pressed',String(state.album==='device'));
 $('album-filters').replaceChildren(...albums.map(album=>{const button=node('button','',`${album.label} (샘플)`);button.type='button';button.setAttribute('aria-pressed',String(state.album===album.id));button.onclick=()=>{state.album=album.id;mountPhotos();$('album-scroll').scrollTop=0;ensureAlbum();};return button;}));
 updatePhotoStatus();
}
// Swipe to select, like the iPhone Photos app: a sideways swipe starts selecting (vertical swipes keep scrolling),
// the range from the first photo to the one under the finger takes the start photo's opposite state.
const swipe={active:false};
function tileAt(x,y){return document.elementFromPoint(x,y)?.closest('#photo-grid .album-photo:not(.skeleton)');}
function paintTile(tile){const on=state.included.has(tile.dataset.id),check=tile.querySelector('.thumb-check');if(check)check.checked=on;const tick=tile.querySelector('.album-tick');if(tick)tick.textContent=on?'✓':'';}
function applySwipe(tile){
 const tiles=[...$('photo-grid').querySelectorAll('.album-photo:not(.skeleton)')],end=tiles.indexOf(tile);if(end<0||end===swipe.last)return;swipe.last=end;
 const [from,to]=swipe.start<end?[swipe.start,end]:[end,swipe.start];let blocked=false;
 tiles.forEach((t,i)=>{const id=t.dataset.id,inRange=i>=from&&i<=to,want=inRange?swipe.select:swipe.before.has(id);
  if(want&&!state.included.has(id)){if(state.included.size>=MAX_FILES){blocked=true;return;}state.included.add(id);}else if(!want)state.included.delete(id);paintTile(t);});
 if(blocked&&!swipe.warned){swipe.warned=true;toast(`한 번에 최대 ${MAX_FILES}장까지 골라주세요.`);}
 updatePhotoStatus();
}
function swipeAutoScroll(){
 if(!swipe.selecting)return;const box=$('album-scroll').getBoundingClientRect(),edge=40;
 const dy=swipe.y<box.top+edge?-8:swipe.y>box.bottom-edge?8:0;
 if(dy){$('album-scroll').scrollTop+=dy;const t=tileAt(swipe.x,swipe.y);if(t)applySwipe(t);}
 swipe.raf=requestAnimationFrame(swipeAutoScroll);
}
$('photo-grid').addEventListener('pointerdown',event=>{
 if(event.button!==0)return;const tile=tileAt(event.clientX,event.clientY);if(!tile)return;
 Object.assign(swipe,{active:true,selecting:false,pointer:event.pointerId,mouse:event.pointerType==='mouse',x0:event.clientX,y0:event.clientY,x:event.clientX,y:event.clientY,tile});
});
$('photo-grid').addEventListener('pointermove',event=>{
 if(!swipe.active||event.pointerId!==swipe.pointer)return;swipe.x=event.clientX;swipe.y=event.clientY;
 if(!swipe.selecting){
  const dx=Math.abs(swipe.x-swipe.x0),dy=Math.abs(swipe.y-swipe.y0);
  if(swipe.mouse?Math.max(dx,dy)<6:dx<10&&dy<10)return;
  if(!swipe.mouse&&dy>=dx){swipe.active=false;return;}// vertical finger move: let the album scroll
  const tiles=[...$('photo-grid').querySelectorAll('.album-photo:not(.skeleton)')];
  Object.assign(swipe,{selecting:true,warned:false,last:-1,start:tiles.indexOf(swipe.tile),select:!state.included.has(swipe.tile.dataset.id),before:new Set(state.included)});
  state.albumConfirmed=false;$('photo-grid').classList.add('swiping');try{$('photo-grid').setPointerCapture(event.pointerId);}catch{}
  applySwipe(swipe.tile);swipe.raf=requestAnimationFrame(swipeAutoScroll);
 }
 const tile=tileAt(swipe.x,swipe.y);if(tile)applySwipe(tile);
});
function endSwipe(){
 if(!swipe.active)return;const was=swipe.selecting;swipe.active=false;swipe.selecting=false;cancelAnimationFrame(swipe.raf);
 if(was){$('photo-grid').classList.remove('swiping');swipe.justSwiped=true;setTimeout(()=>{swipe.justSwiped=false;},0);mountPhotos();}
}
for(const type of ['pointerup','pointercancel'])$('photo-grid').addEventListener(type,endSwipe);
// While selecting, stop the page from scrolling under the finger; after a swipe, ignore the click it leaves behind.
$('photo-grid').addEventListener('touchmove',event=>{if(swipe.selecting)event.preventDefault();},{passive:false});
$('photo-grid').addEventListener('click',event=>{if(swipe.justSwiped){event.preventDefault();event.stopPropagation();}},true);
$('photo-grid').addEventListener('dragstart',event=>event.preventDefault());
// Only an explicit photo-picker action opens the native file chooser.
function openPhotoPicker(){if(state.reading||catalogLoading)return;state.album='device';mountPhotos();$('album-scroll').scrollTop=0;$('photo-input').click();}
$('album-expand').onclick=openPhotoPicker;
$('empty-photo-picker').onclick=openPhotoPicker;
$('confirm-photos').onclick=()=>{state.albumConfirmed=!state.albumConfirmed;if(state.albumConfirmed&&!validRequestedCount())state.pickCountMode='1';mountPhotos();};
function clearPhotos(){catalogLoaded=false;state.aiReview=null;state.version++;for(const p of state.photos)if(p.originalUrl)URL.revokeObjectURL(p.originalUrl);state.photos=[];state.included.clear();state.chosen.clear();state.cleanup.clear();state.candidates=[];state.result=null;state.demo=null;state.albumConfirmed=false;state.faceFailed=false;$('story').value='';mountPhotos();}
async function importFiles(files, demoItems=null, {autoSelect=true,metadata=[]}={}) {
  if(state.reading){toast('지금 고른 사진을 먼저 준비하고 있어요.');return;}
  if(!demoItems&&state.demo)clearPhotos();
  const known=new Set(state.photos.map(p=>p.file&&`${p.file.name}:${p.file.size}:${p.file.lastModified}`));
  files=files.filter(file=>!known.has(`${file.name}:${file.size}:${file.lastModified}`));
  if(autoSelect&&state.photos.filter(photo=>!photo.sample).length+files.length>MAX_FILES){toast(`한 번에 최대 ${MAX_FILES}장까지 골라주세요.`);return;}
  if(!files.length)return;
  if(!gallery.summary&&!metadata.some(m=>m?.sample))acceptGallery(files);// sample album is not the user's device photos
  const version=state.version,token=++importToken;state.reading++;let complete=0,failures=0;
  state.albumConfirmed=false;
  const placeholders=files.map((file,i)=>({...metadata[i],id:uid(),name:file.name,file,loading:true}));state.photos.push(...placeholders);mountPhotos();$('photo-progress').hidden=false;
  const progress=()=>{$('photo-progress').textContent=`사진 준비 ${complete}/${files.length}장${failures?` · 열 수 없는 사진 ${failures}장`:''}`;};progress();
  await mapLimited(files,async(file,i)=>{
    let prepared;
    try{
      prepared=await decodeFile(file);
      if(version!==state.version){URL.revokeObjectURL(prepared.originalUrl);return;}
      const photo={...metadata[i],...prepared,id:placeholders[i].id,...(demoItems?{...demoItems[i],demo:true}:{}),loading:false};
      if(demoItems?.[i].sharpness!==undefined)photo.metrics.sharpness=demoItems[i].sharpness;
      state.photos[state.photos.findIndex(p=>p.id===photo.id)]=photo;if(autoSelect)state.included.add(photo.id);
      const old=[...$('photo-grid').children].find(el=>el.dataset.id===photo.id);old?.replaceWith(photoTile(photo));
    }catch(error){failures++;toast(error.message);state.photos=state.photos.filter(p=>p.id!==placeholders[i].id);[...$('photo-grid').children].find(el=>el.dataset.id===placeholders[i].id)?.remove();}
    finally{complete++;if(token===importToken){progress();updatePhotoStatus();}await new Promise(resolve=>requestAnimationFrame(resolve));}
  });
  state.reading--;if(version===state.version){mountPhotos();setTimeout(()=>{if(token===importToken)$('photo-progress').hidden=true;},1600);}
}
async function useDeviceFiles(files){
 if(!files.length||state.reading)return;
 state.album='device';await importFiles(files);
}
$('photo-input').onchange=(event)=>{const files=[...event.target.files];event.target.value='';useDeviceFiles(files);};
$('all-photos').onclick=()=>{const visible=visibleAlbumPhotos().filter(p=>!p.loading);for(const p of visible){if(state.included.size<MAX_FILES)state.included.add(p.id);}if(visible.some(p=>!state.included.has(p.id)))toast(`한 번에 최대 ${MAX_FILES}장까지 골라주세요.`);state.albumConfirmed=false;mountPhotos();};
$('no-photos').onclick=()=>{state.included.clear();state.albumConfirmed=false;mountPhotos();};
$('drop-zone').ondragover=(event)=>{event.preventDefault();$('drop-zone').classList.add('dragging');};$('drop-zone').ondragleave=()=>$('drop-zone').classList.remove('dragging');$('drop-zone').ondrop=(event)=>{event.preventDefault();$('drop-zone').classList.remove('dragging');useDeviceFiles([...event.dataTransfer.files]);};
function checkAbort(signal){if(signal.aborted)throw new DOMException('취소됨','AbortError');}
function bounded(promise,signal,ms=25000){return new Promise((resolve,reject)=>{let timer;const onAbort=()=>{clearTimeout(timer);reject(new DOMException('취소됨','AbortError'));};signal.addEventListener('abort',onAbort,{once:true});timer=setTimeout(()=>{signal.removeEventListener('abort',onAbort);reject(new Error('모델 준비 시간 초과'));},ms);promise.then(resolve,reject).finally(()=>{clearTimeout(timer);signal.removeEventListener('abort',onAbort);});});}
async function fetchAIStatus(){
 try{const response=await fetch('/api/config',{cache:'no-store'});const data=response.ok?await response.json():{};state.aiAvailable=data.gemini===true;}catch{state.aiAvailable=false;}
 updatePhotoStatus();
}
function chooseEngine(photos){
 state.askingConsent=true;
 return new Promise(resolve=>{
  const dialog=$('ai-consent');let done=false;
  const finish=choice=>{if(done)return;done=true;state.askingConsent=false;dialog.close();dialog.removeEventListener('cancel',cancel);resolve(choice);};
  const cancel=event=>{event.preventDefault();finish(null);};
  $('ai-consent-yes').onclick=()=>finish('gemini');$('ai-consent-local').onclick=()=>finish('local');$('ai-consent-cancel').onclick=()=>finish(null);dialog.addEventListener('cancel',cancel);dialog.showModal();
 });
}
async function analyze(localOnly=false) {
  if(state.reading||state.controller||state.askingConsent)return;
  const photos=state.photos.filter(p=>state.included.has(p.id));if(photos.length<2){toast('사진을 더 골라주세요.');return;}
  if(!validRequestedCount()){toast('선택한 사진 수 안에서 고를 장수를 입력해 주세요.');return;}
  const count=requestedCount();$('candidate-limit').replaceChildren(...Array.from({length:photos.length},(_,i)=>{const option=document.createElement('option');option.value=String(i+1);option.textContent=`${i+1}장`;return option;}));$('candidate-limit').value=String(count);
  const engine=localOnly?'local':state.aiAvailable?await chooseEngine(photos):'local';if(!engine)return;
  state.faceFailed=false;state.aiReview=null;const controller=new AbortController();state.controller=controller;show('loading');
  try{
    if(engine==='gemini'){
      const payload=analysisPayload(photos,state.refs,state.settings,$('story').value,Number($('candidate-limit').value));
      const response=await bounded(fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal}),controller.signal,65000);
      let data;try{data=await response.json();}catch{throw new Error('서버 응답을 읽지 못했어요. 다시 시도해 주세요.');}
      if(!response.ok||!data.review)throw new Error(data.error||'AI 분석을 완료하지 못했어요.');
      state.aiReview=data.review;
    }else{
      photos.forEach(p=>delete p.focus);
      const pref=parseStory($('story').value),needFaces=state.settings.criteria.some(c=>['eyes','tilt'].includes(c))||pref.smile||pref.neutral||pref.open||pref.closed||pref.close||pref.wide;
      if(needFaces&&!state.demo){
        const remaining=photos.filter(p=>!p.faceChecked);
        for(let i=0;i<remaining.length;i++){
          checkAbort(controller.signal);
          try{remaining[i].face=await bounded(detectFaces(remaining[i]),controller.signal,i===0?25000:12000);remaining[i].faceChecked=true;}
          catch(error){checkAbort(controller.signal);state.faceFailed=true;break;}
          await new Promise(resolve=>setTimeout(resolve,0));
        }
      }
    }
    checkAbort(controller.signal);state.analysisStory=$('story').value;state.chosen.clear();buildResult();show('result');
  }catch(error){
    if(error.name!=='AbortError'){
      controller.abort();show('organize');
      if(engine==='gemini'){$('ai-error-message').textContent=error.message;$('ai-error').showModal();}
      else toast('정리를 마치지 못했어요. 사진이나 기준을 바꿔 다시 시도해 주세요.');
    }
  }
  finally{if(state.controller===controller)state.controller=null;}
}
for(const id of ['open-google-terms','consent-google-terms'])$(id).onclick=()=>$('google-terms').showModal();
$('close-google-terms').onclick=()=>$('google-terms').close();
$('ai-error-local').onclick=()=>{$('ai-error').close();analyze(true);};$('ai-error-close').onclick=()=>$('ai-error').close();
function buildResult(){
  state.lastLimit=Number($('candidate-limit').value);
  const photos=state.photos.filter(p=>state.included.has(p.id));state.result=state.aiReview?reviewResult(state.aiReview,photos,state.lastLimit):classify(photos,state.settings,state.refs,state.analysisStory,state.lastLimit);
  if(state.faceFailed&&!state.demo)state.result.notes.unshift('얼굴 모델을 준비하지 못해 일부 표정·기울기 기준은 적용되지 않았어요.');
  state.candidates=[...state.result.candidateIds];state.cleanup=new Set(state.result.cleanupIds);state.tab='candidates';state.focus=true;state.compareIds=[];state.activeComparisonId=null;state.comparePoint='face';state.comparePerson=0;renderResults();
}
$('analyze').onclick=()=>analyze();
$('story').oninput=()=>{$('story').style.height='auto';$('story').style.height=`${Math.min(120,$('story').scrollHeight)}px`;};
$('story').onkeydown=(event)=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)&&!$('analyze').disabled){event.preventDefault();analyze();}};
$('cancel-analysis').onclick=()=>{state.controller?.abort();show('organize');};
$('candidate-limit').onchange=()=>{if(state.chosen.size&&!confirm('후보 수를 바꾸면 이번에 체크한 사진은 초기화돼요. 바꿀까요?')){$('candidate-limit').value=String(state.lastLimit);return;}state.pickCountMode='custom';$('pick-count-input').value=$('candidate-limit').value;state.chosen.clear();buildResult();};
$('back-to-photos').onclick=()=>show('organize');
function resultPhoto(id){return state.photos.find(p=>p.id===id);}
function toggleChosen(id){state.chosen.has(id)?state.chosen.delete(id):state.chosen.add(id);if(state.chosen.has(id)){state.cleanup.delete(id);if(!state.candidates.includes(id))state.candidates.push(id);}renderResults();}
function changeFolder(id,toCleanup){
  if(toCleanup){state.cleanup.add(id);state.candidates=state.candidates.filter(value=>value!==id);state.chosen.delete(id);toast('이번에 고르지 않은 사진에 모았어요. 삭제하지 않아요.');}
  else{state.cleanup.delete(id);if(!state.candidates.includes(id))state.candidates.push(id);toast('남길 후보로 되돌렸어요.');}renderResults();
}
function renderResults(){
  const result=state.result;if(!result)return;const all=state.photos.filter(p=>state.included.has(p.id));
  $('engine-badge').textContent=result.mode==='gemini'?'Gemini 분석':result.mode==='demo'?'미리 준비한 예시':'기기에서 기본 정리';$('result-mode').textContent='비교와 선택 · 마지막 선택은 직접';
  $('result-summary').textContent=`${all.length}장 중 ${state.candidates.length}장을 후보로 모았어요. ${state.demo?'예시 설명을 참고해 직접 비교해 보세요.':'사진의 원본은 그대로예요.'}`;
  $('applied-criteria').replaceChildren(...[...result.supported,...result.notes,'활용처: 내 인스타그램 게시물',state.analysisStory?`이번 기준: ${state.analysisStory}`:'취향 사진과 공통 기준을 참고했어요.'].map(text=>node('p','',text)));
  const tabs={candidates:`올릴 후보 ${state.candidates.length}`,cleanup:`이번에 고르지 않은 사진 ${state.cleanup.size}`,all:`전체 ${all.length}`};
  for(const [key,text]of Object.entries(tabs)){const tab=$(`tab-${key}`);tab.textContent=text;tab.setAttribute('aria-selected',String(state.tab===key));}
  $('folder-note').textContent=state.tab==='cleanup'?'이 체험 안에 따로 모은 사진이에요. 삭제하지 않았고, 후보로 되돌릴 수 있어요.':'사진을 누르면 위에서 원본과 확대 포인트를 볼 수 있어요.';
  const photos=state.tab==='cleanup'?all.filter(p=>state.cleanup.has(p.id)):state.tab==='all'?all:state.candidates.map(resultPhoto).filter(Boolean);
  const cards=photos.map((photo)=>{
    const card=node('article','result-card'+(state.chosen.has(photo.id)?' kept':''));
    const imageButton=node('button','card-image');imageButton.type='button';imageButton.setAttribute('aria-label',`${photo.name} 비교`);imageButton.onclick=()=>{state.activeComparisonId=photo.id;state.compareIds=[photo.id,...(state.compareIds||[]).filter(id=>id!==photo.id)].slice(0,2);renderComparison();$('comparison-panel').scrollIntoView({behavior:'smooth',block:'start'});};
    const image=node('img');image.src=photo.preview;image.alt=photo.name;const badge=node('span','card-badge',state.cleanup.has(photo.id)?'다른 사진':state.chosen.has(photo.id)?'내가 고른 사진':'올릴 후보'),zoom=node('span','card-zoom');zoom.innerHTML=icon('zoom');imageButton.append(image,badge,zoom);
    const content=node('div','card-content'),title=node('h3','',photo.name),reason=node('p','',result.reasons.get(photo.id));
    const bottom=node('div','card-bottom'),label=node('label','keep-label'),check=node('input');check.type='checkbox';check.checked=state.chosen.has(photo.id);check.onchange=()=>toggleChosen(photo.id);label.append(check,document.createTextNode('이 사진으로 고르기'));
    const move=node('button','text-button',state.cleanup.has(photo.id)?'후보로 되돌리기':'이번에는 빼기');move.type='button';move.onclick=()=>changeFolder(photo.id,!state.cleanup.has(photo.id));bottom.append(label,move);content.append(title,reason,bottom);card.append(imageButton,content);return card;
  });
  $('result-grid').replaceChildren(...cards);if(!cards.length)$('result-grid').append(node('p','helper','여기에 모인 사진이 없어요. 다른 분류를 확인해 주세요.'));
  $('selected-count').textContent=`${state.chosen.size}장`;$('finish').disabled=!state.chosen.size;
  $('feedback-panel').hidden=false;$('feedback-sns').textContent='Instagram';
  renderComparison();
}
for(const key of ['candidates','cleanup','all'])$(`tab-${key}`).onclick=()=>{state.tab=key;renderResults();};
const compareModes=[['face','얼굴·표정'],['eyes','눈'],['mouth','미소'],['whole','전체 구도']];
let comparisonJob=Promise.resolve();
function comparisonPhotos(){
 const all=state.photos.filter(p=>state.included.has(p.id));
 const ids=(state.compareIds||[]).filter(id=>all.some(p=>p.id===id));
 for(const id of [...state.candidates,...all.map(p=>p.id)])if(!ids.includes(id)&&ids.length<2)ids.push(id);
 state.compareIds=ids.slice(0,2);return state.compareIds.map(resultPhoto).filter(Boolean);
}
function prepareComparisonFaces(photos){
 for(const photo of photos){
  if(photo.faceChecked||photo.comparePending||photo.compareFailed)continue;
  photo.comparePending=true;
  comparisonJob=comparisonJob.then(async()=>{
   if(!state.photos.includes(photo)){photo.comparePending=false;return;}
   try{photo.face=await detectFaces(photo);photo.faceChecked=true;}
   catch{photo.compareFailed=true;}
   finally{photo.comparePending=false;if(state.screen==='result')renderComparison();}
  });
 }
}
function drawComparison(photo,mode,canvas,marker,magnification=1){
 const image=new Image();
 image.onload=()=>{
  const width=image.naturalWidth,height=image.naturalHeight;
  const crop=comparisonCrop(photo,width,height,mode,state.comparePerson||0);
  if(magnification>1){const w=crop.width/magnification,h=crop.height/magnification;crop.x+=(crop.width-w)/2;crop.y+=(crop.height-h)/2;crop.width=w;crop.height=h;}
  const ctx=canvas.getContext('2d');ctx.fillStyle='#f5f5f5';ctx.fillRect(0,0,600,600);
  const scale=Math.min(600/crop.width,600/crop.height),dw=crop.width*scale,dh=crop.height*scale;
  ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,(600-dw)/2,(600-dh)/2,dw,dh);
  if(marker){marker.hidden=mode==='whole';Object.assign(marker.style,{left:`${crop.x/width*100}%`,top:`${crop.y/height*100}%`,width:`${crop.width/width*100}%`,height:`${crop.height/height*100}%`});}
 };
 image.onerror=()=>{canvas.setAttribute('aria-label','사진을 불러오지 못했어요. 원본에서 확인해 주세요.');};
 image.src=photo.preview;
}
function renderCompareControls(container,photos){
 const selectors=node('div','compare-selectors');
 photos.forEach((photo,index)=>{
  const label=node('label','',index===0?'기준 사진':'비교할 사진'),select=node('select');
  select.setAttribute('aria-label',index===0?'기준 사진 선택':'비교할 사진 선택');
  for(const p of state.photos.filter(p=>state.included.has(p.id))){const option=node('option','',p.name);option.value=p.id;option.selected=p.id===photo.id;option.disabled=p.id===photos[1-index].id;select.append(option);}
  select.onchange=()=>{state.compareIds[index]=select.value;state.comparePerson=0;renderComparison();};label.append(select);selectors.append(label);
 });
 const points=node('div','compare-points');points.setAttribute('role','group');points.setAttribute('aria-label','비교할 포인트');
 const hasFace=photos.every(p=>comparisonFaces(p).length);
 for(const [id,text]of compareModes){
  const button=node('button','',text);button.type='button';button.setAttribute('aria-pressed',String((state.comparePoint||'face')===id));
  button.disabled=['eyes','mouth'].includes(id)&&!photos.every(p=>comparisonFaces(p).some(f=>f[id]));
  button.onclick=()=>{state.comparePoint=id;renderComparison();};points.append(button);
 }
 const people=node('div','compare-people');const count=Math.min(...photos.map(p=>comparisonFaces(p).length));
 if(count>1)for(let i=0;i<count;i++){
  const button=node('button','',`인물 ${i+1}`);button.type='button';button.setAttribute('aria-pressed',String((state.comparePerson||0)===i));button.onclick=()=>{state.comparePerson=i;renderComparison();};people.append(button);
 }
 container.replaceChildren(selectors,points,people);
 const pending=photos.some(p=>p.comparePending);
 $('compare-explanation').textContent=pending?'얼굴 위치를 확인하고 있어요. 지금도 전체 구도를 비교할 수 있어요.':hasFace?'얼굴은 왼쪽부터 인물 순서로 맞춰 보여줘요. 같은 사람인지 확인해 주세요.':photos.some(p=>p.focus)?'분석한 포인트를 확대했어요. 얼굴이 확인되면 눈과 미소도 비교할 수 있어요.':'얼굴을 확인하지 못해 중앙을 보여줘요. 전체 구도도 함께 확인해 주세요.';
}
function renderComparePair(container,photos,modal=false){
 const mode=state.comparePoint||'face';
 container.replaceChildren(...photos.map((photo,index)=>{
  const figure=node('figure'),context=node('button','compare-context');context.type='button';context.setAttribute('aria-label',`${photo.name} 전체 사진 확대`);
  const thumb=node('img');thumb.src=photo.preview;thumb.alt=photo.name;const marker=node('span','compare-marker');marker.setAttribute('aria-hidden','true');context.append(thumb,marker);context.onclick=()=>openViewer(state.photos.filter(p=>state.included.has(p.id)),photo.id);
  const button=node('button','compare-open');button.type='button';button.setAttribute('aria-label',`${photo.name} 포인트 크게 비교`);button.onclick=()=>{if(!modal)$('compare-dialog').showModal();else openViewer(photos,photo.id);renderComparison();};
  const canvas=node('canvas');canvas.width=600;canvas.height=600;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${photo.name} ${compareModes.find(m=>m[0]===mode)[1]} 확대`);button.append(canvas);drawComparison(photo,mode,canvas,marker);
  const caption=node('figcaption'),name=node('strong','',index===0?'기준 사진':'비교하는 사진'),reason=node('p','',state.result.reasons.get(photo.id));caption.append(name,reason);
  const label=node('label','keep-label compare-keep'),check=node('input');check.type='checkbox';check.checked=state.chosen.has(photo.id);check.onchange=()=>toggleChosen(photo.id);label.append(check,document.createTextNode('이 사진으로 고르기'));
  figure.append(context,button,caption,label);return figure;
 }));
}
function renderComparisonStage(photo){
 const stage=$('compare-pair');stage.className='detail-stage';
 const original=node('button','stage-original');original.type='button';original.setAttribute('aria-label',`${photo.name} 원본 확대`);
 const img=node('img');img.src=photo.preview;img.alt=photo.name;original.append(img);original.onclick=()=>openViewer(state.photos.filter(p=>state.included.has(p.id)),photo.id);
 const details=node('div','stage-details');
 const faces=comparisonFaces(photo),hasLandmarks=faces.some(f=>f.eyes&&f.mouth);
 const modes=hasLandmarks?[['face','표정'],['eyes','눈'],['mouth','미소']]:[['face',photo.focus?'분석 포인트':'중앙 확대'],['face','더 가까이'],['whole','전체 구도']];
 for(const [i,[mode,label]] of modes.entries()){
  const button=node('button','stage-detail');button.type='button';button.setAttribute('aria-label',`${photo.name} ${label} 크게 보기`);
  const canvas=node('canvas');canvas.width=600;canvas.height=600;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',label);
  drawComparison(photo,mode,canvas,null,i===1&&!hasLandmarks?1.7:1);button.append(canvas,node('span','',label));
  button.onclick=()=>{state.comparePoint=mode;$('compare-dialog').showModal();renderComparison();};details.append(button);
 }
 stage.replaceChildren(original,details);
 const reason=node('p','stage-reason',state.result.reasons.get(photo.id));stage.after(reason);
}
function renderComparison(){
 const photos=comparisonPhotos();$('comparison-panel').hidden=photos.length<2;if(photos.length<2){if($('compare-dialog').open)$('compare-dialog').close();return;}
 let active=resultPhoto(state.activeComparisonId);if(!active||!state.included.has(active.id))active=photos[0];state.activeComparisonId=active.id;
 prepareComparisonFaces([...new Set([...photos,active])]);
 if(['eyes','mouth'].includes(state.comparePoint)&&!photos.every(p=>comparisonFaces(p).some(f=>f[state.comparePoint])))state.comparePoint='face';
 const tabs=node('div','stage-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','확인할 후보');
 const candidates=[...new Set([...state.candidates,active.id])].map(resultPhoto).filter(Boolean);
 candidates.forEach((p,i)=>{const button=node('button','',`후보 ${i+1}`);button.type='button';button.setAttribute('aria-pressed',String(p.id===active.id));button.onclick=()=>{state.activeComparisonId=p.id;state.compareIds=[p.id,...(state.compareIds||[]).filter(id=>id!==p.id)].slice(0,2);renderComparison();};tabs.append(button);});
 const people=node('div','compare-people');comparisonFaces(active).forEach((face,i)=>{if(comparisonFaces(active).length<2)return;const button=node('button','',`인물 ${i+1}`);button.type='button';button.setAttribute('aria-pressed',String((state.comparePerson||0)===i));button.onclick=()=>{state.comparePerson=i;renderComparison();};people.append(button);});
 $('compare-controls').replaceChildren(tabs,people);$('comparison-panel').querySelectorAll('.stage-reason').forEach(el=>el.remove());renderComparisonStage(active);
 $('compare-explanation').textContent=active.comparePending?'확대할 포인트를 살펴보고 있어요.':'원본은 크게, 비교할 포인트는 가까이.';
 if($('compare-dialog').open){renderCompareControls($('modal-compare-controls'),photos);renderComparePair($('modal-compare-pair'),photos,true);}
}
$('close-compare').onclick=$('done-compare').onclick=()=>$('compare-dialog').close();
$('apply-feedback').onclick=()=>{const feedback=$('feedback').value.trim();if(!feedback){toast('다시 고를 기준을 적어주세요.');return;}$('story').value=feedback;try{localStorage.setItem(`goreun-feedback:${profileKey(state.settings)}`,feedback);}catch{}analyze();};
function renderDone(){
  const all=state.photos.filter(p=>state.included.has(p.id)),plan=partitionPhotos(all,state.chosen,state.cleanup);
  $('done-summary').textContent=`${plan.selected.length}장을 골랐어요. 다른 사진도 삭제하지 않고 이 체험 안에 따로 모았어요.`;
  $('chosen-grid').replaceChildren(...plan.selected.map(photo=>{const button=node('button');button.type='button';button.setAttribute('aria-label',`${photo.name} 확대`);const image=node('img');image.src=photo.preview;image.alt=photo.name;button.append(image);button.onclick=()=>openViewer(plan.selected,photo.id);return button;}));
  $('remember-choice').disabled=false;$('remember-choice').innerHTML=icon('heart')+'내 취향에 저장';
  show('done');
}
$('finish').onclick=()=>{if(!state.chosen.size)return;state.cleanup=new Set(state.photos.filter(p=>state.included.has(p.id)&&!state.chosen.has(p.id)).map(p=>p.id));state.candidates=[...state.chosen];renderDone();};$('back-to-results').onclick=()=>{show('result');renderResults();};
$('remember-choice').onclick=async()=>{
  const chosen=state.photos.filter(p=>state.chosen.has(p.id)).map(p=>({id:uid(),name:p.name,thumb:p.thumb,data:p.data,metrics:p.metrics}));
  const refs=[...state.refs,...chosen].slice(-10);
  try{await saveTaste(profileKey(state.settings),refs);state.refs=refs;$('remember-choice').textContent='취향에 저장했어요';$('remember-choice').disabled=true;toast('다음 정리에 이 색감과 밝기를 참고해요.');}catch{toast('기기에 저장하지 못했어요. 저장 공간이나 브라우저 설정을 확인해 주세요.');}
};
$('coming-sns').onclick=()=>window.open('https://www.instagram.com/','_blank','noopener,noreferrer');
$('connect-instagram').onclick=()=>$('instagram-dialog').showModal();
$('close-instagram').onclick=()=>$('instagram-dialog').close();
$('instagram-add-photos').onclick=()=>{$('instagram-dialog').close();$('taste-input').click();};
$('download-selected').onclick=async()=>{
 const button=$('download-selected');button.disabled=true;
 try{const photos=state.photos.filter(p=>state.chosen.has(p.id));if(!photos.length)return;
 const entries=await Promise.all(photos.map(async(p,i)=>({path:`인스타에 올릴 사진/${i+1}-${p.name.replace(/[\\/:*?"<>|]/g,'_')}`,blob:p.file||await(await fetch(p.originalUrl||p.preview)).blob()})));
 const zip=await makeZip(entries),url=URL.createObjectURL(zip),link=document.createElement('a');link.href=url;link.download='Goreun-내가-고른-사진.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('고른 사진을 ZIP 파일로 저장해요.');
 }catch{toast('사진을 저장하지 못했어요. 다시 시도해 주세요.');}finally{button.disabled=false;}
};
$('new-session').onclick=()=>{refreshContext();renderGallery();show('home');};
let pointerStart=null,lastTouchX=0,pinchDistance=0,pinchZoom=1;
function updateZoom(){ $('viewer-img').style.transform=`translate(${state.pan[0]}px,${state.pan[1]}px) scale(${state.zoom})`;$('zoom-label').textContent=`${state.zoom.toFixed(state.zoom%1?1:0)}×`; }
function displayViewer(){const photo=state.currentPhotos[state.viewerIndex];if(!photo)return;$('viewer-img').src=photo.originalUrl||photo.preview;$('viewer-img').alt=photo.name;$('viewer-counter').textContent=`${state.viewerIndex+1} / ${state.currentPhotos.length} · ${photo.name}`;state.zoom=1;state.pan=[0,0];updateZoom();}
function openViewer(photos,id){state.currentPhotos=photos;state.viewerIndex=Math.max(0,photos.findIndex(p=>p.id===id));displayViewer();if(!$('viewer').open)$('viewer').showModal();}
function moveViewer(delta){state.viewerIndex=(state.viewerIndex+delta+state.currentPhotos.length)%state.currentPhotos.length;displayViewer();}
$('close-viewer').onclick=()=>$('viewer').close();$('prev-photo').onclick=()=>moveViewer(-1);$('next-photo').onclick=()=>moveViewer(1);
$('zoom-in').onclick=()=>{state.zoom=Math.min(6,state.zoom+.5);updateZoom();};$('zoom-out').onclick=()=>{state.zoom=Math.max(1,state.zoom-.5);if(state.zoom===1)state.pan=[0,0];updateZoom();};$('zoom-reset').onclick=()=>{state.zoom=1;state.pan=[0,0];updateZoom();};
$('viewer').onkeydown=(event)=>{if(event.key==='ArrowLeft')moveViewer(-1);if(event.key==='ArrowRight')moveViewer(1);};
$('viewer-stage').onwheel=(event)=>{event.preventDefault();state.zoom=Math.max(1,Math.min(6,state.zoom+(event.deltaY<0?.15:-.15)));if(state.zoom===1)state.pan=[0,0];updateZoom();};
$('viewer-stage').onpointerdown=(event)=>{pointerStart=[event.clientX,event.clientY,...state.pan];if(state.zoom>1)$('viewer-stage').setPointerCapture(event.pointerId);};
$('viewer-stage').onpointermove=(event)=>{if(pointerStart&&state.zoom>1){state.pan=[pointerStart[2]+event.clientX-pointerStart[0],pointerStart[3]+event.clientY-pointerStart[1]];updateZoom();}};
$('viewer-stage').onpointerup=(event)=>{if(pointerStart&&state.zoom===1&&Math.abs(event.clientX-pointerStart[0])>50)moveViewer(event.clientX<pointerStart[0]?1:-1);pointerStart=null;};$('viewer-stage').onpointercancel=()=>pointerStart=null;
$('viewer-stage').addEventListener('touchstart',(event)=>{if(event.touches.length===2){pinchDistance=Math.hypot(event.touches[0].clientX-event.touches[1].clientX,event.touches[0].clientY-event.touches[1].clientY);pinchZoom=state.zoom;pointerStart=null;}else lastTouchX=event.touches[0].clientX;},{passive:true});
$('viewer-stage').addEventListener('touchmove',(event)=>{if(event.touches.length===2&&pinchDistance){event.preventDefault();const distance=Math.hypot(event.touches[0].clientX-event.touches[1].clientX,event.touches[0].clientY-event.touches[1].clientY);state.zoom=Math.min(6,Math.max(1,pinchZoom*distance/pinchDistance));updateZoom();}},{passive:false});
$('viewer-stage').addEventListener('touchend',()=>{pinchDistance=0;},{passive:true});
window.addEventListener('pagehide',()=>state.photos.forEach(p=>{if(p.originalUrl)URL.revokeObjectURL(p.originalUrl);}));
async function init(){refreshContext();mountPhotos();renderGallery();if(new URLSearchParams(location.search).get('start')==='pick')goOrganize();else show('home');state.refs=await getRefs(state.settings);await fetchAIStatus();}
init();
