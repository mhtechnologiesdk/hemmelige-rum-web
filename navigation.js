// Block entry into furniture, while allowing a player already intersecting it to leave.
export function blocksStep(c,from,to){const depth=p=>Math.min(c.w-Math.abs(p.x-c.x),c.d-Math.abs(p.z-c.z));const next=depth(to);if(next<=0)return false;const current=depth(from);return current<=0||next>current+1e-8;}
