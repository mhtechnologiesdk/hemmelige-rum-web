import * as THREE from './vendor/three.module.js';
export function createBag({scene,camera,canvas,box,cyl,mat,label,getState,onSelect,onSound}){
const root=new THREE.Group(),lid=new THREE.Group(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let opened=false,angle=0,parts=[],panel=null,hover=null,signature='';
const leather=mat('#69452e',.85),edge=mat('#34271e'),lining=mat('#324233'),brass=mat('#c5a363',.3,.7),paper=mat('#decfa4');
root.position.set(0,-.12,-1.5);root.rotation.x=.48;root.scale.setScalar(.95);root.visible=false;camera.add(root);if(!camera.parent)scene.add(camera);
box(1.22,.065,.78,0,-.10,0,leather,root);box(1.12,.015,.68,0,-.057,0,lining,root);
for(const x of [-.60,.60])box(.055,.24,.80,x,.025,0,leather,root);
for(const z of [-.39,.39])box(1.2,.24,.055,0,.025,z,leather,root);
for(const x of [-.43,.43]){box(.07,.255,.013,x,.025,.424,edge,root);box(.095,.075,.018,x,.045,.438,brass,root);}
// Stitched leather edging and a rounded carrying handle.
for(let i=0;i<38;i++)for(const z of [-.425,.425])box(.013,.008,.006,-.56+i*.03,.13,z,brass,root);
const handle=new THREE.Mesh(new THREE.TorusGeometry(.16,.025,12,32,Math.PI),leather);handle.position.set(0,.13,-.43);root.add(handle);
lid.position.set(0,.15,-.41);root.add(lid);box(1.23,.045,.82,0,0,.41,leather,lid);box(1.11,.012,.70,0,-.029,.41,lining,lid);
const bagLight=new THREE.PointLight('#ffe2b0',2,3,2);bagLight.position.set(0,.55,-.35);camera.add(bagLight);bagLight.visible=false;
const names={ember:'Glødesegl',letter:'Foldet brev',key:'Messingnøgle',lens:'Violet glas',disc:'Stjerneskive',note:'Urtegning',crystal:'Krystal',strip:'Sidste besked',prism:'Lysprisme'};
function build(){const next=getState().items.join('|');if(next===signature)return;signature=next;for(const p of parts){root.remove(p);p.traverse(o=>o.geometry?.dispose());}parts=[];const items=getState().items;items.forEach((id,i)=>{const g=new THREE.Group();g.position.set(-.4+(i%4)*.27,-.02,-.20+Math.floor(i/4)*.32);root.add(g);g.userData.item=id;parts.push(g);
if(['letter','note','strip'].includes(id)){const p=label(id==='letter'?'LIND\n✉':id==='note'?'URVÆRK\n◷':'SIDSTE\nBESKED',.19,.23,0,.01,0,{rx:-Math.PI/2,size:65,parent:g});}
else if(id==='key'){const ring=new THREE.Mesh(new THREE.TorusGeometry(.045,.012,10,28),brass);ring.rotation.x=-Math.PI/2;ring.position.z=-.065;g.add(ring);box(.024,.024,.15,0,.01,.04,brass,g);for(const z of [.07,.11])box(.055,.025,.018,.02,.01,z,brass,g);}
else if(id==='lens'){const ring=new THREE.Mesh(new THREE.TorusGeometry(.068,.01,10,32),brass);ring.rotation.x=-Math.PI/2;g.add(ring);cyl(.06,.06,.01,0,0,0,mat('#8055bb',.15,.3),g);box(.018,.02,.085,0,0,.10,brass,g);}
else if(id==='disc'||id==='ember'){cyl(.085,.085,.025,0,0,0,brass,g);label(id==='ember'?'✹':'✦',.12,.12,0,.014,0,{rx:-Math.PI/2,size:200,bg:'#b49758',parent:g});}
else {const mesh=new THREE.Mesh(id==='prism'?new THREE.CylinderGeometry(.055,.055,.18,3):new THREE.OctahedronGeometry(.09),mat(id==='prism'?'#8dc5d4':'#ba91df',.12,.4));mesh.position.y=.04;mesh.rotation.z=.35;g.add(mesh);}
const tag=label(names[id],.235,.055,0,.012,.145,{rx:-Math.PI/2,size:65,bg:'#354334',ink:'#ecdba5',parent:g});
});}
function open(){if(opened)return;build();opened=true;root.visible=true;bagLight.visible=true;angle=0;onSound('paper');panel=document.createElement('div');panel.id='bagHelp';panel.innerHTML='<span>Åbn spændet på tasken. B: luk tasken · Esc: tilbage</span><button>Læg tasken væk</button>';panel.querySelector('button').onclick=close;document.querySelector('#app').append(panel);document.querySelector('.game')?.classList.add('bag-open');canvas.focus();}
function close(){opened=false;root.visible=false;bagLight.visible=false;panel?.remove();panel=null;document.querySelector('.game')?.classList.remove('bag-open');hover=null;canvas.focus();}
function hits(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(root.children,true);}
let unlatched=false;
function click(e){if(!opened)return false;if(!unlatched){if(!hits(e).length)return true;unlatched=true;onSound('key');panel.querySelector('span').textContent=getState().items.length?'Vælg en genstand direkte i tasken. B / Esc: luk':'Tasken er tom. Find genstande i rummet. B / Esc: luk';return true;}if(angle<1.4)return true;for(const h of hits(e)){let o=h.object;while(o&&o!==root&&!o.userData.item)o=o.parent;if(o?.userData.item){const id=o.userData.item;close();onSound('paper');onSelect(id);return true;}if(h.object.parent===lid)return true;}return true;}
function move(e){if(!opened)return false;let id=null;if(unlatched&&angle>1.4)for(const h of hits(e)){let o=h.object;while(o&&o!==root&&!o.userData.item)o=o.parent;if(o?.userData.item){id=o.userData.item;break;}}if(id!==hover){hover=id;if(panel)panel.querySelector('span').textContent=id?names[id]+' · klik for at vælge':unlatched?(getState().items.length?'Vælg en genstand direkte i tasken. B / Esc: luk':'Tasken er tom. B / Esc: luk'):'Klik på tasken for at åbne spændet.';}return true;}
return{open(){unlatched=false;open();},close,click,move,update(dt){root.scale.setScalar(Math.min(.95,camera.aspect*.72));angle=THREE.MathUtils.damp(angle,unlatched?2.55:0,7,dt);lid.rotation.x=-angle;},get active(){return opened;},dispose(){close();}};
}
