export const MAX_FILES = 30;
export const JPEG_LIMIT = 105000;

export async function decodeFile(file) {
  if (file.size > 35 * 1024 * 1024) throw new Error(`${file.name}: 35MB 이하 사진을 선택해 주세요.`);
  const originalUrl = URL.createObjectURL(file);
  let bitmap;
  try {
    if (typeof createImageBitmap === 'function') {
      try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* Safari format fallback. */ }
    }
    if (!bitmap) { bitmap = new Image(); bitmap.src = originalUrl; await bitmap.decode(); }
    const width = bitmap.width || bitmap.naturalWidth, height = bitmap.height || bitmap.naturalHeight;
    const draw = (max, quality) => {
      const scale = Math.min(1, max / Math.max(width, height));
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', quality);
    };
    const thumb = draw(320, .75), preview = draw(1280, .84);
    let edge = 640, data = draw(edge, .65);
    while (data.split(',')[1].length > JPEG_LIMIT && edge > 160) { edge = Math.round(edge * .8); data = draw(edge, .6); }
    const metrics = inspectPixels(bitmap);
    return { name: file.name, file, originalUrl, thumb, preview, data, width, height, metrics };
  } catch { URL.revokeObjectURL(originalUrl); throw new Error(`${file.name}: 이 브라우저에서 열 수 없는 사진이에요. JPG·PNG로 바꿔 주세요.`); }
  finally { bitmap?.close?.(); }
}

export function inspectPixels(image) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0, 128, 128);
  const bytes = ctx.getImageData(0, 0, 128, 128).data, gray = new Float32Array(128 * 128);
  let light = 0, saturation = 0, warm = 0, darkPixels = 0;
  for (let i = 0; i < gray.length; i++) {
    const r = bytes[i * 4], g = bytes[i * 4 + 1], b = bytes[i * 4 + 2];
    const value = .2126 * r + .7152 * g + .0722 * b;
    gray[i] = value; light += value; warm += r - b;
    const max = Math.max(r, g, b), min = Math.min(r, g, b); saturation += max ? (max - min) / max : 0;
    if (value < 45) darkPixels++;
  }
  let sum = 0, sumSquares = 0, count = 0;
  for (let y = 1; y < 127; y++) for (let x = 1; x < 127; x++) {
    const i = y * 128 + x, lap = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - 128] - gray[i + 128];
    sum += lap; sumSquares += lap * lap; count++;
  }
  const variance = sumSquares / count - (sum / count) ** 2;
  const hash = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const left = gray[(y * 16 + 8) * 128 + Math.min(127, x * 14 + 7)], right = gray[(y * 16 + 8) * 128 + Math.min(127, (x + 1) * 14 + 7)];
    hash.push(left > right ? 1 : 0);
  }
  return { brightness: light / gray.length / 255, saturation: saturation / gray.length, warmth: warm / gray.length / 255,
    sharpness: Math.min(1, variance / 1500), darkRatio: darkPixels / gray.length, hash };
}

let faceModel;
export async function detectFaces(photo) {
  if (!faceModel) {
    faceModel = (async () => {
      const { FilesetResolver, FaceLandmarker } = await import('./vendor/vision_bundle.mjs');
      const vision = await FilesetResolver.forVisionTasks(new URL('./vendor/wasm', import.meta.url).href);
      return FaceLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: new URL('./vendor/face_landmarker.task', import.meta.url).href, delegate: 'CPU' },
        runningMode: 'IMAGE', numFaces: 6, outputFaceBlendshapes: true });
    })().catch((error) => { faceModel = null; throw error; });
  }
  const model = await faceModel;
  const image = new Image(); image.src = photo.preview; await image.decode();
  const scale = Math.min(1, 768 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  const result = model.detect(canvas);
  const faces = result.faceLandmarks.map((points, i) => {
    const categories = result.faceBlendshapes[i]?.categories || [];
    const value = (name) => categories.find((category) => category.categoryName === name)?.score || 0;
    const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
    const left = Math.max(0, Math.min(...xs)), top = Math.max(0, Math.min(...ys)), right = Math.min(1, Math.max(...xs)), bottom = Math.min(1, Math.max(...ys));
    const a = points[33], b = points[263];
    const roll = Math.atan2((b.y - a.y) * canvas.height, (b.x - a.x) * canvas.width) * 180 / Math.PI;
    return { smile: (value('mouthSmileLeft') + value('mouthSmileRight')) / 2, blink: (value('eyeBlinkLeft') + value('eyeBlinkRight')) / 2,
      eyes: [(a.x+b.x)/2,(a.y+b.y)/2], mouth: [(points[61].x+points[291].x)/2,(points[61].y+points[291].y)/2],
      roll: Math.abs(roll) > 90 ? Math.abs(180 - Math.abs(roll)) : Math.abs(roll), box: [left, top, right - left, bottom - top] };
  });
  faces.sort((a, b) => b.box[2] * b.box[3] - a.box[2] * a.box[3]);
  return faces.length ? { faces, blink: Math.max(...faces.map((f) => f.blink)), smile: Math.max(...faces.map((f) => f.smile)), roll: faces[0].roll, box: faces[0].box } : null;
}

export async function mapLimited(items, task, concurrency = 2) {
  let cursor = 0; const result = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) { const index = cursor++; result[index] = await task(items[index], index); }
  }));
  return result;
}

export function wirePhoto(photo) { return { id: photo.id, mimeType: 'image/jpeg', data: photo.data.split(',')[1] }; }
