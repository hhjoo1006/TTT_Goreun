import test from 'node:test';
import assert from 'node:assert/strict';
import {albums,albumPhotos,sampleAlbum} from '../web/album.mjs';
const photos=sampleAlbum.slice(0,8).map((p,i)=>({...p,id:String(i)}));
test('folder and favorite filters do not change the selection across albums',()=>{
 const selected=new Set(['0','4']);
 assert.equal(albumPhotos(photos,'family',selected).length,4);
 assert.equal(albumPhotos(photos,'travel',selected).length,4);
 assert.equal(albumPhotos(photos,'favorites',selected).length,4);
 assert.deepEqual([...selected],['0','4']);
});
test('confirmation shows only selected photos across different folders',()=>{
 const selected=new Set(['0','4']);
 assert.deepEqual(albumPhotos(photos,'family',selected,true).map(p=>p.id),['0','4']);
 assert.equal(albumPhotos(photos,'portraits',selected).length,4);
});
test('device photos without album metadata remain in recents',()=>{
 const actual=[{id:'own'}],selected=new Set();
 assert.deepEqual(albumPhotos(actual,'recent',selected),actual);
 assert.deepEqual(albumPhotos(actual,'favorites',selected),[]);
 assert.deepEqual(albumPhotos(actual,'portraits',selected),[]);
});

test('expanded catalog contains requested photo groups without cake or flowers',()=>{
 assert.equal(sampleAlbum.length,63);
 for(const [prefix,count] of [['baby-',10],['tram-',5],['sea-',10],['influencer-',10],['dogs-',20]])assert.equal(sampleAlbum.filter(p=>p.asset.startsWith(prefix)).length,count);
 assert.equal(sampleAlbum.some(p=>['food','flowers'].includes(p.asset)),false);
 assert.equal(albums.some(a=>['baby','sea','influencer'].includes(a.id)),false);
 const portraits=albumPhotos(sampleAlbum,'portraits',new Set());
 assert.equal(portraits.filter(p=>/^(baby|influencer)-/.test(p.asset)).length,20);
 assert.equal(albumPhotos(sampleAlbum,'travel',new Set()).filter(p=>p.asset.startsWith('sea-')).length,10);
 assert.equal(albumPhotos(sampleAlbum,'pets',new Set()).length,20);
});
