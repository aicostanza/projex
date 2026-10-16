const routes: Record<string,string> = {ph2:'sea',sg2:'sea',th2:'sea',tw2:'sea',vn2:'sea',oc1:'sea',na1:'americas',br1:'americas',la1:'americas',la2:'americas',euw1:'europe',eun1:'europe',tr1:'europe',ru:'europe',me1:'europe',kr:'asia',jp1:'asia'};
export async function riotHistory(request: Request, key?: string, fetcher: typeof fetch = fetch): Promise<Response> {
 key=key?.trim();
 const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
 if(request.method!=='GET') return json({error:'Method not allowed'},405);
 if(!key) return json({error:'Live match history needs a server-side Riot API key. The site owner must configure RIOT_API_KEY.',code:'KEY_MISSING'},503);
 const q=new URL(request.url).searchParams, platform=q.get('platform')||'ph2', region=routes[platform];
 const name=(q.get('name')||'').trim(), tag=(q.get('tag')||'').trim();
 const start=Number(q.get('start')||0), queue=q.get('queue');
 if(!region||!name||name.length>32||!tag||tag.length>10||!Number.isInteger(start)||start<0||start>500||queue&&!['420','440','450','400','430'].includes(queue)) return json({error:'Enter a valid Riot ID, server, and queue.'},400);
 async function get(host:string,path:string) {
  const r=await fetcher(`https://${host}.api.riotgames.com${path}`,{headers:{'X-Riot-Token':key!},signal:AbortSignal.timeout(12000)});
  if(!r.ok) throw {status:r.status,retry:r.headers.get('Retry-After'),stage:path.startsWith('/riot/account')?'account lookup':'match history',region:host};
  return r.json() as Promise<any>;
 }
 try {
  const account=await get(region==='sea'?'asia':region,`/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
  const ids=await get(region,`/lol/match/v5/matches/by-puuid/${encodeURIComponent(account.puuid)}/ids?start=${start}&count=5${queue?'&queue='+queue:''}`);
  const settled=[];
  for(const id of ids) { const m=await get(region,`/lol/match/v5/matches/${encodeURIComponent(id)}`); if(m.info.gameType==='CUSTOM_GAME'||m.info.queueId===0) continue; const p=m.info.participants.find((x:any)=>x.puuid===account.puuid); if(!p) continue;
   settled.push({id,queue:m.info.queueId,date:m.info.gameStartTimestamp,duration:m.info.gameDuration,win:p.win,champion:p.championName,kills:p.kills,deaths:p.deaths,assists:p.assists,cs:p.totalMinionsKilled+p.neutralMinionsKilled,kp: (p.kills+p.assists)/Math.max(1,m.info.participants.filter((x:any)=>x.teamId===p.teamId).reduce((n:number,x:any)=>n+x.kills,0))*100,vision:p.visionScore,damage:p.totalDamageDealtToChampions,gold:p.goldEarned,items:[0,1,2,3,4,5,6].map(n=>p['item'+n]),participants:m.info.participants.map((x:any)=>({name:x.riotIdGameName||x.summonerName,tag:x.riotIdTagline,champion:x.championName,team:x.teamId,kills:x.kills,deaths:x.deaths,assists:x.assists,damage:x.totalDamageDealtToChampions}))});
  }
  return json({account:{name:account.gameName,tag:account.tagLine},matches:settled,next:start+ids.length,hasMore:ids.length===5});
 } catch(e:any) {const status=e.status||502; return json({error:status===404?'Riot ID not found on this region. Check the name, tag, and server.':status===401||status===403?`Riot rejected ${e.stage||'the request'} (${status}, ${e.region||'unknown region'}). Check API key permissions and configuration.`:status===429?'Riot’s rate limit was reached. Please wait before searching again.':'Riot is temporarily unavailable. Please try again.',retryAfter:status===429?e.retry:undefined},status===401||status===403?503:status);}
}
