// Add targets 2–4 here: each utm_content value maps only to the hero title and description.
const landingCampaigns = new Map([
  ['influencer', {
    title: '베스트샷 피드 올리기',
    description: '오늘의 베스트샷으로 피드 쉽게 올리기'
  }]
]);
const landingCampaign = landingCampaigns.get(new URLSearchParams(location.search).get('utm_content'));
if (landingCampaign) {
  document.querySelector('.hero-copy h1').textContent = landingCampaign.title;
  document.querySelector('.hero-description').textContent = landingCampaign.description;
}

const examples=[
 {image:'assets/ig-cafe.jpg',reason:'카페 배경과 자연스러운 표정이 함께 담겨 있어요.'},
 {image:'assets/ig-street.jpg',reason:'다른 구도에서는 옷차림과 거리 분위기가 더 잘 보여요.'},
 {image:'assets/ig-balcony.jpg',reason:'여행 배경이 넓게 담겨 있어요.'}
];
const keep=document.querySelector('.demo-keep');
function resetKeep(){keep.setAttribute('aria-pressed','false');keep.querySelector('.empty-check').textContent='';document.querySelector('.demo-feedback').hidden=true;}
for(const button of document.querySelectorAll('[data-candidate]'))button.addEventListener('click',()=>{
 const index=Number(button.dataset.candidate),example=examples[index];
 for(const tab of document.querySelectorAll('[data-candidate]'))tab.setAttribute('aria-pressed',String(tab===button));
 const original=document.querySelector('#demo-original');original.src=example.image;original.alt=`후보 ${index+1}의 전체 구도`;
 for(const img of document.querySelectorAll('.demo-details img'))img.src=example.image;
 // The wider-framed sample has different face coordinates; keep its detail crop aligned.
 document.querySelector('.demo-details').dataset.candidate=String(index);
 const reason=document.querySelector('#demo-reason');reason.replaceChildren(Object.assign(document.createElement('span'),{className:'reason-dot'}),document.createTextNode(example.reason));resetKeep();
});
keep.addEventListener('click',()=>{const selected=keep.getAttribute('aria-pressed')!=='true';keep.setAttribute('aria-pressed',String(selected));keep.querySelector('.empty-check').textContent=selected?'✓':'';document.querySelector('.demo-feedback').hidden=!selected;});
