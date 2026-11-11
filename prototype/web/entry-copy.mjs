// Add future targets here. Only known campaign values can replace the service title.
export const entryTitles = new Map([
  ['travel_instagram', ['여행 사진은 잔뜩,', '인스타엔 뭘 올리지?']],
  ['cute', ['오늘 찍은 사진 중', '가장 귀여운 한 컷은? 💕']],
]);
export function applyEntryTitle(title, search) {
  const lines = entryTitles.get(new URLSearchParams(search).get('utm_content'));
  if (!title || !lines) return;
  const doc = title.ownerDocument;
  title.replaceChildren(...lines.flatMap((line, index) =>
    index ? [doc.createElement('br'), doc.createTextNode(line)] : [doc.createTextNode(line)]));
}
