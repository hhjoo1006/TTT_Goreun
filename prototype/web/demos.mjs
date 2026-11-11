const face = (blink, smile, box, roll = 1) => ({ blink, smile, box, roll, faces: [{ blink, smile, box, roll }] });
export const demoSets = {
  family: [
    { path: 'family-eyes-open.jpg', name: '눈을 뜬 순간.jpg', group: '호숫가의 오후', face: face(.03,.72,[.49,.26,.2,.35]), focus: [.59,.43], scene: { wide:.3,close:1,lane:0 },
      explanation: { default:'아이와 엄마의 표정이 또렷하게 담긴 컷이에요.',open:'아이가 눈을 뜨고 카메라를 보는 순간이에요.',close:'엄마와 아이가 가까이 담겨 표정이 잘 보여요.' } },
    { path: 'family-eyes-closed.jpg', name: '눈을 감은 순간.jpg', group: '호숫가의 오후', face: face(.85,.63,[.48,.27,.21,.34]), focus:[.59,.44], scene:{wide:.3,close:1,lane:0},
      explanation:{ default:'아이가 눈을 감은 순간이에요.',closed:'눈을 감은 순간도 남기고 싶은 기준에 맞는 컷이에요.' } },
    { path: 'family-shaky.jpg', name: '조금 흔들린 순간.jpg', group: '호숫가의 오후', face:face(.04,.78,[.49,.27,.2,.34]),focus:[.59,.43],sharpness:.08,scene:{wide:.35,close:.9,lane:0},
      explanation:{ default:'조금 흔들렸지만 두 사람의 웃는 표정이 담겨 있어요.',soft:'흐려도 남기고 싶은 순간이라는 기준을 참고했어요.' } },
    { path:'family-wide.jpg',name:'풍경을 넓게 담은 순간.jpg',group:'호숫가의 오후',face:face(.04,.69,[.57,.43,.07,.13]),focus:[.62,.5],scene:{wide:1,close:.15,lane:0},
      explanation:{default:'호수와 산이 넓게 담겨 그날의 장소가 함께 보여요.',wide:'가까운 컷보다 풍경이 넓게 담긴 사진이에요.'} }
  ],
  travel: [
    {path:'travel-close.jpg',name:'트램을 가까이.jpg',group:'리스본의 거리',focus:[.52,.60],scene:{wide:.1,close:1,lane:.1},explanation:{default:'트램의 앞유리와 창틀이 가까이 보여요.',close:'트램 앞모습을 크게 담고 싶은 기준을 참고했어요.'}},
    {path:'travel-lane.jpg',name:'트램과 골목.jpg',group:'리스본의 거리',focus:[.68,.54],scene:{wide:.7,close:.4,lane:1},explanation:{default:'트램 옆 계단과 골목을 함께 담은 컷이에요.',lane:'트램 옆 골목도 담고 싶은 기준에 맞아요.',wide:'트램과 옆 골목이 함께 보여요.'}},
    {path:'travel-wide.jpg',name:'거리 전체.jpg',group:'리스본의 거리',focus:[.5,.68],scene:{wide:1,close:0,lane:.3},explanation:{default:'선로가 멀리 이어져 거리 전체가 보여요.',wide:'트램을 가까이 찍은 컷보다 거리 전체가 한눈에 들어와요.'}}
  ]
};
