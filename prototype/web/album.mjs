export const albums=[{id:'recent',label:'최근 항목'},{id:'portraits',label:'인물 사진'},{id:'travel',label:'여행'},{id:'family',label:'가족'},{id:'daily',label:'일상'},{id:'pets',label:'반려견'}];
export const sampleAlbum=[
 {asset:'family-open',name:'호숫가에서 웃는 순간.jpg',folder:'family',portrait:true,favorite:true},
 {asset:'family-closed',name:'잠깐 눈을 감은 순간.jpg',folder:'family',portrait:true},
 {asset:'family-wide',name:'호수와 함께 담은 순간.jpg',folder:'family',portrait:true,favorite:true},
 {asset:'family-shaky',name:'흔들린 가족 사진.jpg',folder:'family',portrait:true},
 {asset:'travel-wide',name:'여행지 거리.jpg',folder:'travel'},
 {asset:'travel-close',name:'노란 트램.jpg',folder:'travel',favorite:true},
 {asset:'travel-lane',name:'골목에서.jpg',folder:'travel'},
 {asset:'landscape',name:'바다 산책로.jpg',folder:'travel',favorite:true},
 {asset:'daily-meal',name:'동네 식당에서 먹은 점심.jpg',folder:'daily',tags:['food']},
 {asset:'daily-cafe',name:'카페에서 잠깐 쉬는 오후.jpg',folder:'daily',portrait:true},
 {asset:'daily-friends',name:'친구들과 웃으며 나누는 대화.jpg',folder:'daily',portrait:true},
 {asset:'daily-shopping',name:'친구와 동네 가게에서 쇼핑.jpg',folder:'daily',portrait:true},
 {asset:'daily-walk',name:'이야기하며 걷는 동네 산책.jpg',folder:'daily',portrait:true},
 ...Array.from({length:10},(_,i)=>({asset:`baby-${String(i+1).padStart(2,'0')}`,name:`아이의 다양한 표정 ${i+1}.jpg`,folder:'portraits',portrait:true})),
 ...Array.from({length:5},(_,i)=>({asset:`tram-${String(i+1).padStart(2,'0')}`,name:`트램 여행 다른 구도 ${i+1}.jpg`,folder:'travel'})),
 ...Array.from({length:10},(_,i)=>({asset:`sea-${String(i+1).padStart(2,'0')}`,name:`바다 ${i<3?'풍경':i<8?'가족':'여성 독사진'} ${i+1}.jpg`,folder:'travel',portrait:i>=3})),
 ...Array.from({length:10},(_,i)=>({asset:`influencer-${String(i+1).padStart(2,'0')}`,name:`인플루언서 일상 ${i+1}.jpg`,folder:'portraits',portrait:true})),
 ...Array.from({length:20},(_,i)=>({asset:`dogs-${String(i+1).padStart(2,'0')}`,name:`반려견의 다양한 순간 ${i+1}.jpg`,folder:'pets'}))

];
export function albumPhotos(photos,album,selected,confirmed=false){
 if(confirmed)return photos.filter(p=>selected.has(p.id));
 if(album==='favorites')return photos.filter(p=>p.favorite);
 if(album==='portraits')return photos.filter(p=>p.portrait);
 if(album==='recent')return photos;
 return photos.filter(p=>p.folder===album||p.tags?.includes(album));
}
