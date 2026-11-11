import test from 'node:test';
import assert from 'node:assert/strict';
import {entryCampaigns,entryTitles,applyEntryTitle,applyEntryDescription,applyEntryButton} from '../web/entry-copy.mjs';
function title(){
 return {nodes:['original title'],ownerDocument:{createElement:tag=>({tag}),createTextNode:text=>({text})},replaceChildren(...nodes){this.nodes=nodes;}};
}
test('influencer app title and description change without changing button or icon',()=>{
 const heading=title(),description={hidden:true,textContent:''},text={nodeType:3,textContent:'올릴 사진 고르기 '},icon={nodeType:1};
 const button={childNodes:[text,icon]},search='?utm_source=instagram&utm_medium=paid_social&utm_campaign=bestshot_test&utm_content=influencer';
 applyEntryTitle(heading,search);applyEntryDescription(description,search);applyEntryButton(button,search);
 assert.deepEqual(heading.nodes,[{text:'베스트샷'},{tag:'br'},{text:'피드 올리기'}]);
 assert.equal(description.textContent,'오늘의 베스트샷으로 피드 쉽게 올리기');
 assert.equal(description.hidden,false);
 assert.equal(text.textContent,'올릴 사진 고르기 ');
 assert.equal(button.childNodes[1],icon);
});
test('missing, empty and unknown utm_content preserve app defaults',()=>{
 for(const search of ['','?utm_content=','?utm_content=unknown','?utm_content=__proto__']){
  const heading=title(),description={hidden:true,textContent:''},text={nodeType:3,textContent:'올릴 사진 고르기 '},button={childNodes:[text]};
  applyEntryTitle(heading,search);applyEntryDescription(description,search);applyEntryButton(button,search);
  assert.deepEqual(heading.nodes,['original title']);assert.equal(description.hidden,true);assert.equal(description.textContent,'');assert.equal(text.textContent,'올릴 사진 고르기 ');
 }
});
test('existing campaign headlines and buttons remain supported',()=>{
 for(const [key,lines] of entryTitles){
  const heading=title();applyEntryTitle(heading,'?utm_content='+key);
  assert.deepEqual(heading.nodes.filter(n=>n.text).map(n=>n.text),lines);
 }
 const text={nodeType:3,textContent:'올릴 사진 고르기 '};applyEntryButton({childNodes:[text]},'?utm_content=pet');assert.equal(text.textContent,'3초 만에 고르기 ');
 assert.equal(entryCampaigns.has('influencer'),true);
});
