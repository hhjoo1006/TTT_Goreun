import {readFile} from 'node:fs/promises';
import {handleAnalyze} from '../worker/index.mjs';
console.log('Ready for private Gemini credential on stdin');
let raw='';for await(const chunk of process.stdin){raw+=chunk;if(raw.includes('\n'))break;}const env=JSON.parse(raw);
const photos=await Promise.all(['open','closed','wide'].map(async(id)=>({id,mimeType:'image/jpeg',data:(await readFile(`/private/tmp/goreun-ai-${id}.jpg`)).toString('base64')})));
const body={consent:true,photos,references:[],settings:{target:'parents',subjects:['인물','여행'],criteria:['eyes','blur','duplicate']},story:'눈을 감은 사진은 제외하고, 눈을 뜬 사진과 풍경이 넓게 담긴 사진을 하나씩 남겨줘.',count:2};
const request=new Request('https://goreun-unified.growthcamp-6278.chatgpt.site/api/analyze',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://goreun-unified.growthcamp-6278.chatgpt.site'},body:JSON.stringify(body)});
const response=await handleAnalyze(request,env);console.log(JSON.stringify({status:response.status,...await response.json()},null,2));
