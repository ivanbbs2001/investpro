export const uid=()=>Math.random().toString(36).slice(2,9);
export const ymdToUTC=v=>{if(typeof v==="number")return v;const m=String(v||"").match(/^(\d{4})-(\d{2})-(\d{2})/);return m?Date.UTC(+m[1],+m[2]-1,+m[3]):NaN;};
export const localISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export const tdParseLine=(line)=>{const sep=line.includes("\t")?"\t":line.includes(";")?";":",";const r=[];let cur="",q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"')q=!q;else if(c===sep&&!q){r.push(cur.trim());cur="";}else cur+=c;}r.push(cur.trim());return r;};
export const tdMoney=s=>{s=(s||"").replace(/R\$|\s/g,"");if(!/^-?\d[\d.,]*$/.test(s))return null;if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");else if((s.match(/\./g)||[]).length>1)s=s.replace(/\./g,"");const v=Math.abs(Number(s));return isFinite(v)&&v>0?v:null;};
