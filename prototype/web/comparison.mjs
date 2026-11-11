// Match detected faces by left-to-right position; identity is left to the user.
export function comparisonFaces(photo){
 const faces=photo.face?.faces?.length?photo.face.faces:photo.face?.box?[photo.face]:[];
 return [...faces].sort((a,b)=>(a.box[0]+a.box[2]/2)-(b.box[0]+b.box[2]/2));
}
export function comparisonCrop(photo,width,height,mode='face',person=0){
 if(mode==='whole')return {x:0,y:0,width,height};
 const faces=comparisonFaces(photo),face=faces[Math.min(person,faces.length-1)];
 let center=photo.focus||[.5,.5],side=Math.min(width,height)*.5;
 if(face){
  const [x,y,w,h]=face.box;
  center=[x+w/2,y+h/2];
  side=Math.max(w*width,h*height)*1.45;
  if(mode==='eyes'&&face.eyes){center=face.eyes;side=Math.max(w*width*1.15,h*height*.65);}
  if(mode==='mouth'&&face.mouth){center=face.mouth;side=Math.max(w*width*.85,h*height*.55);}
 }
 side=Math.max(1,Math.min(side,width,height));
 return {x:Math.max(0,Math.min(width-side,center[0]*width-side/2)),y:Math.max(0,Math.min(height-side,center[1]*height-side/2)),width:side,height:side};
}
