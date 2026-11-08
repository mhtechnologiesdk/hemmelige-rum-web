export const pickupSources={key:'casket',disc:'clock',ember:'fireplace',crystal:'safe',strip:'safe',prism:'telescope'};
export function canCollect(state,item){return !!pickupSources[item]&&state.solved.includes(pickupSources[item])&&!state.items.includes(item);}
