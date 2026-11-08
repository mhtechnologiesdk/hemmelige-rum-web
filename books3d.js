import * as THREE from './vendor/three.module.js';
import {roman} from './mission.js';
// Bound volumes remain meshes throughout pulling, handling and shelving.
export function createBooks({scene,camera,canvas,box,mat,label,onSound,onRead,getState}){
const colors=['#773e38','#3e694b','#9a7043','#3b566d'],symbols=['UGLE','EG','ILD','MÅNE'],titles=['Nattens vogter','Skovens hukommelse','Glødens dans','Nattens segl'];
const books=[],ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let active=null,drag=null,help=null;
for(let i=0;i<4;i++){
 const root=new THREE.Group();scene.add(root);root.position.set(-4.1+i*.32,1.78,-5.13);root.rotation.y=Math.PI/2;
 const leather=mat(colors[i]),paper=mat('#dfd0aa'),gilt=mat('#c9a866',.35,.55);
 // Spine at x=-.19, fore-edge at x=.19; covers hinge on the spine.
 box(.4,.55,.025,0,0,-.065,leather,root);box(.36,.51,.10,.005,0,0,paper,root);box(.035,.55,.15,-.19,0,0,leather,root);
 for(let j=0;j<13;j++)box(.363,.002,.102,.005,-.24+j*.039,0,mat(j%2?'#c1ad85':'#ebddbb'),root);
 const spine=label(symbols[i],.12,.38,-.209,0,0,{ry:-Math.PI/2,size:66,bg:colors[i],ink:'#e8d396',parent:root});
 const hinge=new THREE.Group();hinge.position.set(-.19,0,.065);root.add(hinge);box(.4,.55,.025,.19,0,0,leather,hinge);
 label(symbols[i]+'\n\n'+titles[i].replace(' ','\n'),.35,.47,.19,0,.014,{size:45,bg:colors[i],ink:'#ead39c',parent:hinge});
 const sheetPivot=new THREE.Group();sheetPivot.position.set(-.175,0,.057);root.add(sheetPivot);
 box(.35,.50,.003,.175,0,0,paper,sheetPivot);
 label('Professor Linds\nprivate samling\n\n← Vend titelbladet',.33,.47,.175,0,.003,{size:36,parent:sheetPivot});
 const clue=label(symbols[i]+'\n\n'+(getState().variant.difficulty==='family'?String(getState().variant.bookValues[i]):roman(getState().variant.bookValues[i]))+'\n\nEt mærke. Et tal.',.33,.46,.005,0,.055,{size:64,parent:root});
 root.userData={id:'book'+i,name:titles[i]+' · træk bogen ud',bookIndex:i};hinge.userData.bookPart='cover';sheetPivot.userData.bookPart='page';
 books.push({root,hinge,sheetPivot,index:i,home:root.position.clone(),rotation:root.quaternion.clone(),angle:0,page:0,spin:0,tilt:0,pull:0,stage:'shelf',clue});
}
function hud(text){if(!help){help=document.createElement('div');help.id='bookHelp';help.innerHTML='<span></span><button>Læg bogen tilbage · Esc</button>';document.querySelector('#app').append(help);help.querySelector('button').onclick=()=>putBack();}help.querySelector('span').textContent=text;}
function hit(e,roots){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(roots,true).find(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});}
function begin(index){if(active)return;active=books[index];active.stage='pull';active.pull=0;hud('Træk bogen ned mod dig for at få den fri af reolen.');onSound('paper');}
function down(e){if(!active){const h=hit(e,books.map(b=>b.root));if(!h||h.distance>3.8)return false;let o=h.object;while(o&&!Number.isInteger(o.userData.bookIndex))o=o.parent;if(!o)return false;begin(o.userData.bookIndex);drag={x:e.clientX,y:e.clientY,mode:'pull'};return true;}
 if(active.stage==='return')return true;const h=hit(e,[active.root]);let o=h?.object,part;while(o&&o!==active.root){part||=o.userData.bookPart;o=o.parent;}drag={x:e.clientX,y:e.clientY,mode:active.stage==='pull'?'pull':part==='cover'?'cover':part==='page'?'page':'rotate'};return true;}
function hold(){const b=active;b.stage='held';camera.add(b.root);if(!camera.parent)scene.add(camera);b.root.position.set(.22,-.02,-1.03);b.root.rotation.set(-.08,0,0);b.root.scale.setScalar(1.1);hud('Træk omslaget mod venstre. Træk derefter titelbladet til venstre. Træk uden for bogen for at vende den.');onSound('paper');}
function move(e){if(!active)return false;if(!drag||active.stage==='return')return true;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,b=active;if(drag.mode==='pull'){b.pull=THREE.MathUtils.clamp(b.pull+dy*.006+Math.abs(dx)*.001,0,.7);b.root.position.z=b.home.z+b.pull;if(b.pull>.48){hold();drag=null;}}else if(drag.mode==='cover'){b.angle=THREE.MathUtils.clamp(b.angle-dx*.013,0,2.9);b.hinge.rotation.y=-b.angle;}else if(drag.mode==='page'&&b.angle>1.4){b.page=THREE.MathUtils.clamp(b.page-dx*.014,0,2.95);b.sheetPivot.rotation.y=-b.page;if(b.page>1.9&&!b.read){b.read=true;onRead(b.index);onSound('discover');hud('Tallet er fundet i bogen. Vend bogen med musen, eller læg den tilbage.');}}else if(drag.mode==='rotate'){b.spin=THREE.MathUtils.clamp(b.spin+dx*.007,-1,1);b.tilt=THREE.MathUtils.clamp(b.tilt+dy*.005,-.6,.6);b.root.rotation.set(b.tilt,b.spin,0);}drag.x=e.clientX;drag.y=e.clientY;return true;}
function up(){if(!active)return false;drag=null;return true;}
function finishReturn(b){b.root.position.copy(b.home);b.root.quaternion.copy(b.rotation);b.root.scale.setScalar(1);b.hinge.rotation.y=0;b.sheetPivot.rotation.y=0;b.angle=b.page=b.pull=b.spin=b.tilt=0;b.stage='shelf';active=null;}
function putBack(immediate=false){if(!active)return;const b=active;scene.attach(b.root);drag=null;help?.remove();help=null;if(immediate){finishReturn(b);return;}b.stage='return';b.returnTime=0;b.from=b.root.position.clone();b.fromQ=b.root.quaternion.clone();b.fromScale=b.root.scale.x;onSound('paper');canvas.focus();}
function update(dt){if(active?.stage!=='return')return;const b=active;b.returnTime+=dt;const t=Math.min(1,b.returnTime/.5),ease=t*t*(3-2*t);b.root.position.lerpVectors(b.from,b.home,ease);b.root.quaternion.slerpQuaternions(b.fromQ,b.rotation,ease);b.root.scale.setScalar(THREE.MathUtils.lerp(b.fromScale,1,ease));b.hinge.rotation.y=-b.angle*(1-ease);b.sheetPivot.rotation.y=-b.page*(1-ease);if(t===1)finishReturn(b);}
function key(e){if(!active)return false;if(e.code==='Escape')putBack();return true;}
return{update,begin,down,move,up,key,putBack,get active(){return !!active;},dispose(){putBack(true);}};
}
