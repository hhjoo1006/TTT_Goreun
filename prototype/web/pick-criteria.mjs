export const pickCriteria = [
 {id:'auto',label:'고른에게 맡기기',intent:''},
 {id:'landscape',label:'주변 풍경',intent:'주변 풍경과 공간이 잘 보이는 사진을 남기고 싶어요.'},
 {id:'together',label:'같이 찍은 모습',intent:'여러 인물이 함께 프레임 안에 담긴 사진을 남기고 싶어요. 관계나 감정은 추측하지 마세요.'},
 {id:'portrait',label:'내 모습',intent:'인물의 구도와 보이는 차이를 기준으로 골라주세요. 여러 사람 중 누가 나인지는 추측하지 마세요.'},
 {id:'atmosphere',label:'현장 분위기',intent:'현장의 움직임이나 다양한 장면이 보이는 사진을 남기고 싶어요. 감정은 추측하지 마세요.'},
];
export function selectionStory(id, text='') {
 const intent=pickCriteria.find(option=>option.id===id)?.intent||'';
 return [intent,text.trim()].filter(Boolean).join('\n').slice(0,500);
}
