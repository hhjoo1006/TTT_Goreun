import {decodeFile, mapLimited} from './photos.mjs';

// Listing an album must not wait for downloads, canvas conversions or pixel inspection.
export function createSamplePhotos(items, baseUrl) {
  return items.map(item => {
    const url = new URL('assets/album/' + item.asset + '.jpg', baseUrl).href;
    return {...item, id:'sample-' + item.asset, sample:true, loading:false,
      thumb:url, preview:url, originalUrl:url, samplePrepared:false};
  });
}
function checkAbort(signal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
}
// Only selected samples need AI previews, pixel metrics and file bytes.
export async function prepareSamplePhotos(photos, {signal, fetchPhoto=fetch, decode=decodeFile} = {}) {
  checkAbort(signal);
  const pending = photos.filter(photo => photo.sample && !photo.samplePrepared);
  await mapLimited(pending, async photo => {
    checkAbort(signal);
    const response = await fetchPhoto(photo.originalUrl, {signal, cache:'force-cache'});
    if (!response.ok) throw new Error('사진을 준비하지 못했어요. 다시 시도해 주세요.');
    const file = new File([await response.blob()], photo.name, {type:'image/jpeg'});
    checkAbort(signal);
    const prepared = await decode(file);
    if (signal?.aborted) {
      URL.revokeObjectURL(prepared.originalUrl);
      checkAbort(signal);
    }
    Object.assign(photo, prepared, {samplePrepared:true});
  }, 4);
}
