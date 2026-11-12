import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, access, rm, readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import handler, {config} from '../netlify/functions/goreun-api.mjs';
import {buildNetlify} from '../scripts/build-netlify.mjs';

test('Netlify output preserves live API calls, local assets and excludes server secrets', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'goreun-netlify-'));
  try {
    await buildNetlify({outDir});
    for (const file of ['index.html', 'app/index.html', 'app/assets/fonts/Pretendard-Regular.woff2', 'app/vendor/face_landmarker.task', 'app/vendor/wasm/vision_wasm_internal.wasm']) await access(join(outDir, file));
    const app = await readFile(join(outDir, 'app/app.js'), 'utf8');
    assert.ok(app.includes("fetch('/api/config'"));
    assert.ok(app.includes("fetch('/api/analyze'"));
    assert.equal(app.includes('config.json'), false);
    const files = await readdir(outDir, {recursive: true});
    assert.equal(files.some(p => /(^|\/)(worker|functions|\.env|netlify\.toml)(\/|$)/.test(p)), false);
  } finally { await rm(outDir, {recursive: true, force: true}); }
});

test('Netlify runtime env supports config and analysis without exposing the key', async () => {
  const priorKey = process.env.GEMINI_API_KEY;
  const priorFetch = globalThis.fetch;
  try {
    delete process.env.GEMINI_API_KEY;
    assert.deepEqual(config.path, ['/api/config', '/api/analyze']);
    assert.equal((await (await handler(new Request('https://goreun.test/api/config'))).json()).gemini, false);
    process.env.GEMINI_API_KEY = 'test-private-key';
    const response = await handler(new Request('https://goreun.test/api/config'));
    assert.match(response.headers.get('cache-control'), /no-store/);
    const text = await response.text();
    assert.equal(JSON.parse(text).gemini, true);
    assert.equal(text.includes('test-private-key'), false);
    const payload = {consent: true, photos: ['a', 'b'].map(id => ({id, mimeType: 'image/jpeg', data: '/9j/AAAAAAAAAAAA'})), references: [], story: '웃는 사진', count: 1};
    globalThis.fetch = async (url, options) => {
      assert.equal(new URL(url).hostname, 'generativelanguage.googleapis.com');
      assert.equal(options.headers['x-goog-api-key'], 'test-private-key');
      return Response.json({candidates: [{content: {parts: [{text: JSON.stringify({photos: payload.photos.map(p => ({id: p.id, score: 90, reason: '웃는 표정', group: 'same'})), selectedIds: ['a'], notes: []})}]}}]});
    };
    const request = origin => new Request('https://goreun.test/api/analyze', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: origin}, body: JSON.stringify(payload)});
    const analysis = await handler(request('https://goreun.test'));
    assert.equal(analysis.status, 200);
    assert.deepEqual((await analysis.json()).review.selectedIds, ['a']);
    assert.equal((await handler(request('https://other.test'))).status, 403);
  } finally {
    globalThis.fetch = priorFetch;
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
  }
});
