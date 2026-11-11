const examples=[
 {image:'assets/family-eyes-open.jpg',reason:'아이의 눈과 미소가 함께 담겨 있어요.'},
 {image:'assets/family-eyes-closed.jpg',reason:'눈을 감은 순간도, 내가 좋아하는 표정이라면 남길 수 있어요.'},
 {image:'assets/family-wide.jpg',reason:'함께한 풍경이 더 넓게 담겨 있어요.'}
];
const keep=document.querySelector('.demo-keep');
function resetKeep(){keep.setAttribute('aria-pressed','false');keep.querySelector('.empty-check').textContent='';document.querySelector('.demo-feedback').hidden=true;}
for(const button of document.querySelectorAll('[data-candidate]'))button.addEventListener('click',()=>{
 const index=Number(button.dataset.candidate),example=examples[index];
 for(const tab of document.querySelectorAll('[data-candidate]'))tab.setAttribute('aria-pressed',String(tab===button));
 const original=document.querySelector('#demo-original');original.src=example.image;original.alt=`후보 ${index+1}의 전체 구도`;
 for(const img of document.querySelectorAll('.demo-details img'))img.src=example.image;
 // The wider-framed sample has different face coordinates; keep its detail crop aligned.
 document.querySelector('.demo-details').classList.toggle('wide-sample',index===2);
 const reason=document.querySelector('#demo-reason');reason.replaceChildren(Object.assign(document.createElement('span'),{className:'reason-dot'}),document.createTextNode(example.reason));resetKeep();
});
keep.addEventListener('click',()=>{const selected=keep.getAttribute('aria-pressed')!=='true';keep.setAttribute('aria-pressed',String(selected));keep.querySelector('.empty-check').textContent=selected?'✓':'';document.querySelector('.demo-feedback').hidden=!selected;});
