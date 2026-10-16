"use client";
import { useEffect, useRef, useState } from "react";
import snapshot from "./league-assets.json";
export type Catalog = typeof snapshot;
const CDN = "https://ddragon.leagueoflegends.com";
const CACHE = "project-x-ddragon-v1";
const clean = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
type Spell = {name:string; description:string; image:{full:string}};
type Detail = {id:string;name:string;title:string;tags:string[];lore:string;passive:Spell;spells:Spell[];skins:{num:number;name:string;parentSkin?:number}[]};
export function useLeagueCatalog() {
  const [catalog,setCatalog] = useState<Catalog>(snapshot);
  const [status,setStatus] = useState("Loading Riot's complete catalog…");
  const [busy,setBusy] = useState(false);
  const [attempt,setAttempt] = useState(0);
  const current = useRef<Catalog | null>(snapshot);
  useEffect(() => {
    let stopped=false;
    const controller=new AbortController();
    async function json(url:string) {
      const response=await fetch(url,{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(20000)])});
      if(!response.ok) throw new Error(`Data Dragon HTTP ${response.status}`);
      return response.json();
    }
    let running=false;
    async function refresh() {
      if(running) return;
      running=true; setBusy(true);
      try {
        const versions=await json(`${CDN}/api/versions.json`);
        const version=versions[0];
        if(typeof version!=="string" || !/^\d+\.\d+\.\d+$/.test(version)) throw new Error("Invalid patch");
        if(current.current?.version===version) {setStatus(`Data Dragon ${version} · Up to date`);return;}
        const roster=await json(`${CDN}/cdn/${version}/data/en_US/champion.json`);
        const ids=Object.keys(roster.data);
        if(!ids.length) throw new Error("Empty roster");
        let index=0,done=0;
        const champions:Catalog['champions']=[], skins:Catalog['skins']=[];
        const results = await Promise.allSettled(Array.from({length:6},async()=>{
          while(index<ids.length && !stopped) {
            const id=ids[index++];
            const result=await json(`${CDN}/cdn/${version}/data/en_US/champion/${id}.json`);
            const c=result.data[id] as Detail;
            champions.push({id:c.id,name:c.name,title:c.title,tags:c.tags,lore:clean(c.lore),image:`${CDN}/cdn/img/champion/splash/${id}_0.jpg`,icon:`${CDN}/cdn/${version}/img/champion/${id}.png`,abilities:[c.passive,...c.spells].map((a,i)=>({key:["P","Q","W","E","R"][i],name:a.name,description:clean(a.description),iconUrl:`${CDN}/cdn/${version}/img/${i===0?'passive':'spell'}/${a.image.full}`}))});
            for(const s of c.skins) {
              if(s.parentSkin!=null) continue;
              skins.push({id:`${id}_${s.num}`,champion:id,name:s.num===0?`Classic ${c.name}`:s.name,image:`${CDN}/cdn/img/champion/splash/${id}_${s.num}.jpg`});
            }
            if(!stopped) setStatus(`Loading patch ${version} · ${++done}/${ids.length} champions`);
          }
        }));
        if(results.some(r=>r.status === "rejected")) throw new Error("Incomplete catalog");
        if(stopped) return;
        champions.sort((a,b)=>a.name.localeCompare(b.name));skins.sort((a,b)=>a.name.localeCompare(b.name));
        const next={version,champions,skins};
        current.current=next;setCatalog(next);setStatus(`Data Dragon ${version} · Up to date`);
        try {localStorage.setItem(CACHE,JSON.stringify(next));} catch { /* Catalog remains available in memory. */ }
      } catch {
        if(!stopped) setStatus(current.current?`Offline · Saved patch ${current.current.version}. Retry to check updates.`:"Could not load Data Dragon. Showing the starter catalog. Retry to load all champions and skins.");
      } finally {running=false;if(!stopped)setBusy(false);}
    }
    try {
      const cached=JSON.parse(localStorage.getItem(CACHE)||"null");
      if(cached && typeof cached.version==='string' && Array.isArray(cached.champions) && cached.champions.length>100 && Array.isArray(cached.skins) && cached.skins.length>100) {current.current=cached;setCatalog(cached);}
    } catch { /* Ignore invalid cache. */ }
    void refresh();
    const timer=setInterval(()=>void refresh(),60*60*1000);
    const resume=()=>{if(document.visibilityState==='visible')void refresh();};
    document.addEventListener('visibilitychange',resume);
    window.addEventListener('online',resume);
    return ()=>{stopped=true;controller.abort();clearInterval(timer);document.removeEventListener('visibilitychange',resume);window.removeEventListener('online',resume);};
  },[attempt]);
  return {catalog,status,busy,retry:()=>setAttempt(n=>n+1)};
}
