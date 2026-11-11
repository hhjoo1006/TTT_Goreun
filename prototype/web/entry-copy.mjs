// Add future targets here. Only known campaign values can replace the service title.
export const entryTitles = new Map([
  ['parents', ['우리 아기 사진 100장 다 귀엽지만,', '올릴 사진은 고민되니까.']],
  ['travel_instagram', ['여행 사진은 잔뜩,', '인스타엔 뭘 올리지?']],
  ['cute', ['오늘 찍은 사진 중', '가장 귀여운 한 컷은? 💕']],
  ['pet', ['다 귀여워서', '못 고르죠?']],
]);
// Optional start-button text per campaign. Targets not listed here keep the original button text.
export const entryButtons = new Map([
  ['pet', '3초 만에 고르기'],
]);
const campaign = (search) => new URLSearchParams(search).get('utm_content');
export function applyEntryTitle(title, search) {
  const lines = entryTitles.get(campaign(search));
  if (!title || !lines) return;
  const doc = title.ownerDocument;
  title.replaceChildren(...lines.flatMap((line, index) =>
    index ? [doc.createElement('br'), doc.createTextNode(line)] : [doc.createTextNode(line)]));
}
// Replaces only the button's text, keeping its icon.
export function applyEntryButton(button, search) {
  const label = entryButtons.get(campaign(search));
  const text = button && [...button.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
  if (!label || !text) return;
  text.textContent = `${label} `;
}
