// Aspect-correct engraved plaques and paper labels shared by the room props.
export function signSize(w,h){const edge=w>1?1536:768;return w>=h?[edge,Math.max(96,Math.round(edge*h/w))]:[Math.max(96,Math.round(edge*w/h)),edge];}
export function drawSign(c,w,h,text,opts={}){
 const bg=opts.bg||'#e5d5b0',ink=opts.ink||'#30271c',small=Math.min(w,h),pad=small*.075;
 c.fillStyle=bg;c.fillRect(0,0,w,h);
 const wash=c.createLinearGradient(0,0,w,h);wash.addColorStop(0,'rgba(255,239,198,.09)');wash.addColorStop(.5,'rgba(255,239,198,0)');wash.addColorStop(1,'rgba(0,0,0,.13)');c.fillStyle=wash;c.fillRect(0,0,w,h);
 c.strokeStyle=ink;c.globalAlpha=.65;c.lineWidth=Math.max(1,small*.009);c.strokeRect(pad,pad,w-pad*2,h-pad*2);
 c.globalAlpha=.28;c.lineWidth=Math.max(1,small*.003);const inner=pad+small*.035;c.strokeRect(inner,inner,w-inner*2,h-inner*2);c.globalAlpha=1;
 for(const x of [pad,w-pad])for(const y of [pad,h-pad]){c.fillStyle=ink;c.beginPath();c.arc(x,y,small*.014,0,Math.PI*2);c.fill();}
 const lines=String(text).split('\n'),usableW=w-pad*3.8,usableH=h-pad*3.5;
 let size=Math.min(usableH/(lines.length*1.3),h*.58);c.textAlign='center';c.textBaseline='middle';
 c.font=`${size}px Georgia`;const max=Math.max(...lines.map(line=>c.measureText(line).width));if(max>usableW)size*=usableW/max;
 c.font=`${size}px Georgia`;c.fillStyle=ink;lines.forEach((line,i)=>c.fillText(line,w/2,h/2+(i-(lines.length-1)/2)*size*1.3));
}
