const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const dimensions = ['brightness', 'saturation', 'warmth', 'sharpness'];
export function tasteDistance(metrics, refs) {
  if (!refs.length) return .5;
  return Math.min(...refs.map(({ metrics: other }) => Math.sqrt(dimensions.reduce((sum, key) => sum + (metrics[key] - (other?.[key] ?? .5)) ** 2, 0) / dimensions.length)));
}
export function similarity(a, b) {
  if (!a.hash?.length || a.hash.length !== b.hash?.length) return 0;
  const equal = a.hash.reduce((sum, bit, i) => sum + Number(bit === b.hash[i]), 0) / a.hash.length;
  return equal * (1 - Math.min(.3, Math.abs(a.brightness - b.brightness)));
}
export function parseStory(text) {
  const notSmile = /무표정|안 웃|웃지 않/.test(text);
  return {
    soft: /흔들려도|흔들렸어도|흐려도|흐린.*남|흔들린.*남/.test(text), sharp: /선명|또렷/.test(text),
    bright: /밝은|밝게|환한|환하게/.test(text), dark: /어두운.*남|어두운.*선호/.test(text), warm: /따뜻|노을|따스/.test(text),
    smile: /웃는|웃음|미소/.test(text) && !/웃는.*말고/.test(text), neutral: notSmile,
    open: /눈을? 뜬|눈 뜬|눈.*감은.*(빼|제외|말고)/.test(text),
    closed: /눈을? 감은|눈 감은/.test(text) && !/눈.*감은.*(빼|제외|말고)/.test(text),
    wide: /풍경|배경|골목|거리 전체|넓게/.test(text), close: /인물|얼굴|가까이|트램 앞/.test(text)
  };
}
export function partitionPhotos(photos, selected, cleanup) {
  const result = { selected: [], cleanup: [], later: [] }, seen = new Set();
  for (const photo of photos) {
    if (seen.has(photo.id)) continue;
    seen.add(photo.id);
    if (selected.has(photo.id)) result.selected.push(photo);
    else if (cleanup.has(photo.id)) result.cleanup.push(photo);
    else result.later.push(photo);
  }
  return result;
}
export function classify(photos, settings, refs, story, limit = 2) {
  const pref = parseStory(story), flags = new Map(), scores = new Map(), reasons = new Map(), notes = [];
  const demo = photos.every((p) => Boolean(p.demo)), selectedCriteria = settings.criteria || [];
  const criteria = new Set(selectedCriteria), groups = [];
  const hasFace = photos.some((p) => p.face);
  const supported = [];
  for (const photo of photos) {
    const m = photo.metrics, face = photo.face, problems = [];
    if (criteria.has('blur') && m.sharpness < .2 && !pref.soft) problems.push('흔들림이나 흐림이 있을 수 있어요.');
    if (criteria.has('dark') && (m.brightness < .23 || m.darkRatio > .66) && !pref.dark) problems.push('어두운 부분이 많아요.');
    if (criteria.has('eyes') && face?.blink > .58 && !pref.closed) problems.push('사진 속 얼굴에서 눈 감음이 감지됐어요.');
    if (criteria.has('tilt') && face?.roll > 15) problems.push('얼굴 축이 기울어져 있어요. 전체 구도도 확인해 주세요.');
    flags.set(photo.id, problems);
    let score = .22 * m.sharpness + .22 * (1 - Math.abs(m.brightness - .55)) + (refs.length ? .42 * (1 - tasteDistance(m, refs)) : .15);
    score -= problems.length * .26;
    if (pref.soft) score += (1 - m.sharpness) * .12;
    if (pref.sharp) score += m.sharpness * .35;
    if (pref.bright) score += m.brightness * .35;
    if (pref.dark) score += (1 - m.brightness) * .35;
    if (pref.warm) score += m.warmth * .35;
    if (pref.smile && face) score += face.smile * .6;
    if (pref.neutral && !pref.smile && face) score += (1 - face.smile) * .6;
    if (pref.open && face) score += (1 - face.blink) * .5;
    if (pref.closed && face) score += face.blink * .5;
    if (demo && photo.scene) {
      if (pref.wide) score += photo.scene.wide * .7;
      if (pref.close) score += photo.scene.close * .7;
      if (/골목/.test(story)) score += photo.scene.lane * .8;
    } else if (face?.box) {
      const area = face.box[2] * face.box[3];
      if (pref.close) score += clamp(area * 3) * .35;
      if (pref.wide) score += (1 - clamp(area * 3)) * .15;
    }
    scores.set(photo.id, score);
  }
  const ordered = [...photos].sort((a, b) => scores.get(b.id) - scores.get(a.id));
  for (const photo of ordered) {
    let group = groups.find((g) => demo ? g.key === photo.group : similarity(g.photos[0].metrics, photo.metrics) > .78);
    if (!group) { group = { key: demo ? photo.group : `group-${groups.length}`, photos: [] }; groups.push(group); }
    group.photos.push(photo);
  }
  const count = Math.min(photos.length, Math.max(1, Number(limit) || 2)), candidateIds = [];
  if (pref.smile && pref.neutral && count >= 2) {
    const happy = ordered.find((p) => p.face?.smile > .3), neutral = ordered.find((p) => p.face?.smile < .15 && p.id !== happy?.id);
    if (happy && neutral) candidateIds.push(happy.id, neutral.id);
    else notes.push('웃는 컷과 무표정 컷을 모두 확실히 확인하지 못했어요. 후보를 직접 비교해 주세요.');
  }
  const pool = criteria.has('duplicate') ? groups.map((g) => g.photos[0]).sort((a, b) => scores.get(b.id) - scores.get(a.id)) : ordered;
  for (const p of [...pool, ...ordered]) if (candidateIds.length < count && !candidateIds.includes(p.id)) candidateIds.push(p.id);
  const cleanupIds = photos.filter((p) => !candidateIds.includes(p.id)).map((p) => p.id);
  for (const photo of photos) {
    const m = photo.metrics, face = photo.face; let reason;
    if (cleanupIds.includes(photo.id) && flags.get(photo.id).length) reason = flags.get(photo.id)[0];
    else if (demo && photo.explanation) {
      const type = /골목/.test(story) ? 'lane' : pref.wide ? 'wide' : pref.close ? 'close' : pref.closed ? 'closed' : pref.open ? 'open' : pref.soft ? 'soft' : 'default';
      reason = photo.explanation[type] || photo.explanation.default;
    } else if (pref.smile && face?.smile > .3) reason = '사진 속 얼굴에서 웃는 표정을 감지했어요.';
    else if (pref.neutral && face?.smile < .15) reason = '웃음 신호가 낮아 무표정에 가까운 컷이에요.';
    else if (pref.open && face && face.blink < .2) reason = '사진 속 얼굴의 눈 감음 신호가 낮아요.';
    else if (pref.closed && face?.blink > .58) reason = '눈 감은 순간을 남기고 싶은 기준을 참고했어요.';
    else if (pref.soft && m.sharpness < .3) reason = '조금 흐려도 남기고 싶은 기준을 참고했어요.';
    else if (refs.length && tasteDistance(m, refs) < .25) reason = '좋아하는 사진과 색감·밝기가 비슷해요.';
    else if (pref.warm && m.warmth > .03) reason = '따뜻한 색감이 보이는 사진이에요.';
    else if (pref.bright && m.brightness > .5) reason = '밝은 사진을 우선하는 기준을 참고했어요.';
    else if (cleanupIds.includes(photo.id) && criteria.has('duplicate') && groups.some((g) => g.photos.some((p) => p.id === photo.id) && g.photos.length > 1)) reason = '비슷한 구도의 다른 후보를 먼저 보여드렸어요.';
    else reason = m.sharpness > .45 ? '윤곽이 비교적 또렷한 사진이에요.' : '다른 후보와 나란히 보며 남길지 확인해 주세요.';
    reasons.set(photo.id, reason);
  }
  if (criteria.has('blur')) supported.push('밝기·윤곽을 이용한 흐림 확인');
  if (criteria.has('dark')) supported.push('어두운 부분 확인');
  if (criteria.has('duplicate')) supported.push('구도·색감이 비슷한 사진 묶기');
  if (criteria.has('eyes')) supported.push(hasFace ? '얼굴이 보이는 사진의 눈 감음 참고' : '눈 감음: 확인 가능한 얼굴 정보 없음');
  if (criteria.has('tilt')) supported.push(hasFace ? '기울기: 얼굴 축만 참고, 배경 수평선은 직접 확인' : '구도 기울기: 얼굴 정보가 없어 직접 확인 필요');
  if (refs.length) supported.push(`취향 사진 ${refs.length}장의 색감·밝기 참고`);
  if (!demo) notes.push('정리 대상은 설정에 기록합니다. 여행·동물 등 장면의 의미를 인식해 걸러내는 기능은 아직 연결하지 않았어요.');
  if (story && !demo) notes.push('스토리 전체의 의미는 아직 해석하지 않아요. 확인 가능한 밝기·선명도·표정 등의 단어만 참고했어요.');
  if (demo) notes.push('예시의 장면 설명과 확대 위치는 미리 준비한 내용입니다. 실제 Gemini 분석 결과가 아니에요.');
  notes.push('분류는 정리 검토용입니다. 원본을 이동하거나 삭제하지 않습니다.');
  return { candidateIds, cleanupIds, groups, reasons, flags, supported, notes, pref, mode: demo ? 'demo' : 'local' };
}
