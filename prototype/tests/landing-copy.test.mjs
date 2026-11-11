import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../../landing/app.js',import.meta.url),'utf8');
function render(search){
 const title={textContent:'기존 큰 제목'},description={textContent:'기존 작은 설명'};
 const writes=[];
 const elements={'.hero-copy h1':title,'.hero-description':description};
 const document={
  querySelector(selector){if(selector==='.demo-keep')return {addEventListener(){}};assert.ok(selector in elements,selector);writes.push(selector);return elements[selector];},
  querySelectorAll(){return [];}
 };
 vm.runInNewContext(source,{document,location:{search},URLSearchParams});
 return {title:title.textContent,description:description.textContent,writes};
}
test('influencer campaign changes only hero title and description',()=>{
 const result=render('?utm_source=instagram&utm_medium=paid_social&utm_campaign=bestshot_test&utm_content=influencer');
 assert.equal(result.title,'베스트샷 피드 올리기');
 assert.equal(result.description,'오늘의 베스트샷으로 피드 쉽게 올리기');
 assert.deepEqual(result.writes,['.hero-copy h1','.hero-description']);
});
test('missing, empty and unknown campaign values preserve original content',()=>{
 for(const search of ['', '?utm_content=', '?utm_content=unknown', '?utm_content=__proto__', '?utm_campaign=influencer']){
  const result=render(search);
  assert.equal(result.title,'기존 큰 제목',search);
  assert.equal(result.description,'기존 작은 설명',search);
  assert.deepEqual(result.writes,[],search);
 }
});
