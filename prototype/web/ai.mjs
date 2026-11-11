export function reviewResult(review,photos,count){
 const byId=new Map(review.photos.map(p=>[p.id,p]));
 const preferred=review.selectedIds.filter(id=>byId.has(id));
 const ranked=[...review.photos].sort((a,b)=>b.score-a.score).map(p=>p.id);
 const candidateIds=[...new Set([...preferred,...ranked])].slice(0,Math.min(count,photos.length));
 const cleanupIds=photos.filter(p=>!candidateIds.includes(p.id)).map(p=>p.id);
 for(const photo of photos){const focus=byId.get(photo.id)?.focus;if(focus)photo.focus=[focus.x,focus.y];}
 return {candidateIds,cleanupIds,reasons:new Map(review.photos.map(p=>[p.id,p.reason])),supported:['Gemini가 취향 사진·공통 기준·입력한 스토리를 함께 참고했어요.','사진별 근거와 비교할 포인트를 분석했어요.'],notes:[...review.notes,'분석을 위해 압축 미리보기와 입력 문장만 Google Gemini로 전송했어요. 원본은 기기에 남아 있어요.','분류는 정리 검토용입니다. 원본을 이동하거나 삭제하지 않습니다.'],mode:'gemini'};
}
export function analysisPayload(photos,refs,settings,story,count){
 const wire=p=>({id:p.id,mimeType:'image/jpeg',data:p.data.includes(',')?p.data.split(',')[1]:p.data});
 return {consent:true,photos:photos.map(wire),references:refs.slice(0,10).map(wire),settings:{target:settings.target,subjects:settings.subjects,criteria:settings.criteria,sns:settings.target==='influencer'?settings.sns:''},story,count};
}
