import test from 'node:test';
import assert from 'node:assert/strict';
import {selectionStory} from '../web/pick-criteria.mjs';
import {parseStory} from '../web/engine.mjs';
import {analysisPayload} from '../web/ai.mjs';
test('selected criterion and free text both reach AI and local analysis',()=>{
 const story=selectionStory('landscape','노을이 따뜻하게 보였으면 좋겠어요.');
 assert.match(story,/주변 풍경/);assert.match(story,/노을/);
 assert.equal(parseStory(story).wide,true);assert.equal(parseStory(story).warm,true);
 assert.equal(analysisPayload([],[],{},story,1).story,story);
 assert.equal(selectionStory('auto',' 밝은 사진 '),'밝은 사진');
 assert.equal(selectionStory('unknown',''),'');
 assert.ok(selectionStory('portrait','가'.repeat(500)).length<=500);
});
