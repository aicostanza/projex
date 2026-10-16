"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCheck, ChevronRight, CircleHelp, Crosshair, Flag, Gamepad2, Heart, Info, Layers3, LayoutDashboard, Search, Shield, Sparkles, Star, Swords, Target, Trophy, TrendingUp, X } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import leagueSnapshot from "@/lib/league-assets.json";
import { useLeagueCatalog } from "@/lib/use-league-catalog";
import { championGuides, defaultCollection, defaultPool, matches, overall, type Collection, type CollectionStatus, type SampleMatch, type View } from "@/lib/project-data";
import { LiveMatches } from "./live-matches";
import { MatchAnalysis } from "./match-analysis";
import { GenshinWorkspace, genshinNav, genshinTaskIds } from "./genshin-workspace";

type Champion = (typeof leagueSnapshot.champions)[number];
type Skin = (typeof leagueSnapshot.skins)[number];
const championById = Object.fromEntries(leagueSnapshot.champions.map(c => [c.id, c]));
const nav = [{ id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "champions", label: "Champion explorer", icon: Swords }, { id: "matches", label: "Match review", icon: TrendingUp }, { id: "collection", label: "Collection", icon: Layers3 }] as const;
const storageKey = "project-x-demo-v1";
const gameStorageKey = "project-x-selected-game-v1";
type GameId = "league" | "genshin";
const themes = [{id:"neon-green",label:"Neon green"},{id:"blue",label:"Neon blue"},{id:"violet",label:"Neon violet"},{id:"red",label:"Neon red"}] as const;
type ColorTheme = (typeof themes)[number]["id"];
const themeStorageKey = "project-x-color-theme-v2";



function ChampionIcon({ id, src, className = "" }: { id: string; src?: string; className?: string }) {
  return <img className={`champion-icon ${className}`} src={src || championById[id]?.icon || `/assets/icons/${id}.png`} alt={championById[id]?.name || id} width={48} height={48} loading="lazy" />;
}

function SectionHeading({ title, count, action, onAction }: { title: string; count?: string; action?: string; onAction?: () => void }) {
  return <div className="section-heading"><h2>{title}{count && <span className="count-pill">{count}</span>}</h2>{action && <button className="text-button" onClick={onAction}>{action}<ArrowUpRight size={16} /></button>}</div>;
}

function EmptyState({ title, text, onReset }: { title: string; text: string; onReset?: () => void }) {
  return <Empty className="empty-state"><EmptyHeader><EmptyMedia><Search size={28} /></EmptyMedia><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{text}</EmptyDescription></EmptyHeader>{onReset && <EmptyContent><button className="secondary-button" onClick={onReset}>Clear filters</button></EmptyContent>}</Empty>;
}

function AppNavigation({ game, view, onGameChange, onNavigate, onAbout }: { game: GameId; view: View; onGameChange: (game: GameId) => void; onNavigate: (v: View) => void; onAbout: () => void }) {
  const { setOpenMobile } = useSidebar();
  const activeNav = game === "league" ? nav : genshinNav;
  return <Sidebar className="app-sidebar" collapsible="offcanvas">
    <SidebarHeader className="app-sidebar-header"><button className="brand" onClick={() => { onNavigate("overview"); setOpenMobile(false); }} aria-label="Project X overview"><span className="brand-project">PROJECT</span><span className="brand-x" aria-hidden="true">X</span></button></SidebarHeader>
    <SidebarContent>
      <div className="game-selector"><span className="nav-caption">YOUR GAME</span><Select value={game} onValueChange={value => { if (value === "league" || value === "genshin") { onGameChange(value); setOpenMobile(false); } }}><SelectTrigger className="game-select" aria-label="Selected game">{game === "league" ? <img className="league-logo" src="/assets/league-of-legends-logo.png" alt="" aria-hidden="true" width={50} height={50} /> : <span className="genshin-logo-mark" aria-hidden="true">✦</span>}<SelectValue /></SelectTrigger><SelectContent><SelectItem value="league">League of Legends</SelectItem><SelectItem value="genshin">Genshin Impact</SelectItem></SelectContent></Select><p>Switch games. Keep one workspace.</p></div>
      <SidebarGroup className="nav-group"><SidebarGroupLabel className="nav-caption">WORKSPACE</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{activeNav.map(item => <SidebarMenuItem key={item.id}><SidebarMenuButton className="nav-button" isActive={view === item.id} onClick={() => { onNavigate(item.id); setOpenMobile(false); }} aria-current={view === item.id ? "page" : undefined}><item.icon /><span>{item.label}</span>{view === item.id && <span className="nav-active-marker" aria-hidden="true" />}</SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup>
      <div className="sidebar-note"><span className="small-x" aria-hidden="true">X</span><h3>Your games.<br />All in one place.</h3><p>Understand the game.<br />Build your collection.</p><span className="version-label">EARLY ACCESS / 0.1</span></div>
    </SidebarContent>
    <SidebarFooter className="app-sidebar-footer"><button className="help-button" onClick={onAbout}><CircleHelp size={17} />About this prototype<ArrowUpRight size={15} /></button><div className="profile"><span className="profile-avatar">S</span><div><strong>Shaun</strong><span>Demo profile · SEA</span></div><span className="profile-label">PX</span></div></SidebarFooter>
  </Sidebar>;
}

function MatchRow({ match, selected = false, compact = false, onClick }: { match: SampleMatch; selected?: boolean; compact?: boolean; onClick: () => void }) {
  return <button className={`match-row ${match.won ? "win" : "loss"} ${selected ? "selected" : ""} ${compact ? "compact" : ""}`} onClick={onClick} aria-pressed={compact ? undefined : selected}>
    <span className={`match-outcome ${match.won ? "positive" : "negative"}`}>{match.won ? "W" : "L"}</span><ChampionIcon id={match.champion} /><span className="match-champion"><strong>{championById[match.champion]?.name}</strong><span>Ranked solo · {match.duration}</span></span><span className="match-kda"><strong>{match.kills} <i>/</i> {match.deaths} <i>/</i> {match.assists}</strong><span>{((match.kills+match.assists)/Math.max(1,match.deaths)).toFixed(2)} KDA</span></span>{compact && <span className="match-cs">{(match.cs/match.minutes).toFixed(1)}<span>CS / min</span></span>}<ChevronRight size={16} className="row-chevron" />
  </button>;
}

export default function ProjectX() {
  const {catalog: league, status: catalogStatus, busy: catalogBusy, retry: retryCatalog} = useLeagueCatalog();
  const championById = useMemo(() => Object.fromEntries([...leagueSnapshot.champions,...league.champions].map(c=>[c.id,c])),[league]);
  const guides = useMemo(() => Object.fromEntries(Object.values(championById).map(c=>[c.id, championGuides[c.id] || {lane:c.tags[0] || "Champion",style:c.tags.join(" · "),difficulty:"Explore abilities",focus:"Learn your champion’s abilities",practice:"Practice ability timing, positioning, and combos in the Practice Tool."}])),[championById]);
  const [skinChampion,setSkinChampion] = useState("all");
  const [skinLimit,setSkinLimit] = useState(48);

  const [theme, setTheme] = useState<ColorTheme>("neon-green");
  const [game, setGame] = useState<GameId>("league");
  const [view, setView] = useState<View>("overview");
  const [pool, setPool] = useState<string[]>(defaultPool);
  const [collection, setCollection] = useState<Collection>(defaultCollection);
  const [focus, setFocus] = useState(matches[0].focus);
  const [storageReady, setStorageReady] = useState(false);
  const [localSaveAvailable, setLocalSaveAvailable] = useState(true);
  const [championQuery, setChampionQuery] = useState("");
  const [lane, setLane] = useState("all");
  const [poolTab, setPoolTab] = useState("all");
  const [skinQuery, setSkinQuery] = useState("");
  const [skinTab, setSkinTab] = useState("all");
  const [matchTab, setMatchTab] = useState("all");
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0].id);
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [skinPreview, setSkinPreview] = useState<Skin | null>(null);
  const [genshinTasks, setGenshinTasks] = useState<string[]>(["commissions"]);
  const mainHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(themeStorageKey);
      if (themes.some(t => t.id === storedTheme)) setTheme(storedTheme as ColorTheme);
      const storedGame = window.localStorage.getItem(gameStorageKey);
      if (storedGame === "league" || storedGame === "genshin") setGame(storedGame);
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.pool)) setPool(saved.pool.filter((id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9]+$/.test(id)));
        if (saved.collection && typeof saved.collection === "object" && !Array.isArray(saved.collection)) setCollection(Object.fromEntries(Object.entries(saved.collection).filter(([key,value]) => /^[A-Za-z0-9]+_\d+$/.test(key) && (value === "owned" || value === "wishlist"))) as Collection);
        if (typeof saved.focus === "string" && matches.some(m => m.focus === saved.focus)) setFocus(saved.focus);
        if (Array.isArray(saved.genshinTasks)) setGenshinTasks(saved.genshinTasks.filter((id: unknown): id is string => typeof id === "string" && genshinTaskIds.has(id)));
      }
    } catch { setLocalSaveAvailable(false); }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify({ pool, collection, focus, genshinTasks })); setLocalSaveAvailable(true); }
    catch { setLocalSaveAvailable(false); }
  }, [pool, collection, focus, genshinTasks, storageReady]);

  useEffect(() => {
    const readHash = () => { const value = window.location.hash.slice(1) || "overview"; if (nav.some(n => n.id === value)) setView(value as View); };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (storageReady) {
      try { window.localStorage.setItem(themeStorageKey, theme); } catch { /* Theme remains usable for this session. */ }
    }
  }, [theme, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    document.documentElement.dataset.game = game;
    try { window.localStorage.setItem(gameStorageKey, game); } catch { /* The selected game remains usable for this session. */ }
  }, [game, storageReady]);

  const navigate = (next: View) => { setView(next); window.location.hash = next; window.scrollTo({ top: 0, behavior: "instant" }); requestAnimationFrame(() => mainHeading.current?.focus({ preventScroll: true })); };
  const changeGame = (next: GameId) => { setGame(next); setView("overview"); window.location.hash = "overview"; window.scrollTo({ top: 0, behavior: "instant" }); requestAnimationFrame(() => mainHeading.current?.focus({ preventScroll: true })); };
  const toggleGenshinTask = (id: string) => setGenshinTasks(current => current.includes(id) ? current.filter(task => task !== id) : [...current, id]);
  const openMatch = (match: SampleMatch) => { setSelectedMatchId(match.id); setMatchTab("all"); navigate("matches"); };
  const togglePool = (id: string) => { const exists = pool.includes(id); setPool(current => exists ? current.filter(c => c !== id) : [...current,id]); toast(exists ? `${(championById[id]?.name || id)} removed from your pool` : `${(championById[id]?.name || id)} added to your pool`); };
  const updateSkin = (id: string, status?: CollectionStatus) => { setCollection(current => { const next = {...current}; if(status) next[id] = status; else delete next[id]; return next; }); toast(status === "owned" ? "Marked as owned" : status === "wishlist" ? "Added to your wishlist" : "Removed from your collection"); };
  const useFocus = (next: string) => { setFocus(next); toast.success("Your next-game focus is set"); };
  const selectedMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const focusMatch = matches.find(m => m.focus === focus) || matches[0];
  const owned = league.skins.filter(s => collection[s.id] === "owned");
  const wishlist = league.skins.filter(s => collection[s.id] === "wishlist");
  const filteredChampions = useMemo(() => league.champions.filter(c => (poolTab === "all" || pool.includes(c.id)) && (lane === "all" || guides[c.id].lane === lane || c.tags.includes(lane)) && `${c.name} ${c.title} ${guides[c.id].style}`.toLowerCase().includes(championQuery.toLowerCase().trim())), [championQuery,lane,pool,poolTab,league,guides]);
  const filteredSkins = league.skins.filter(s => (skinTab === "all" || collection[s.id] === skinTab) && (skinChampion === "all" || s.champion === skinChampion) && `${s.name} ${championById[s.champion]?.name || s.champion}`.toLowerCase().includes(skinQuery.toLowerCase().trim()));
  useEffect(()=>setSkinLimit(48),[skinQuery,skinTab,skinChampion]);
  const filteredMatches = matches.filter(m => matchTab === "all" || (matchTab === "wins" ? m.won : !m.won));
  const currentNav = (game === "league" ? nav : genshinNav).find(n => n.id === view)!;

  return <SidebarProvider style={{"--sidebar-width":"18rem"} as CSSProperties}><a href="#main-content" className="skip-link">Skip to content</a><AppNavigation game={game} view={view} onGameChange={changeGame} onNavigate={navigate} onAbout={() => setAboutOpen(true)} /><SidebarInset className="workspace"><header className="topbar"><div className="breadcrumb"><SidebarTrigger className="mobile-nav-trigger" /><span>{game === "league" ? "League of Legends" : "Genshin Impact"}</span><ChevronRight size={13} /><strong>{currentNav.label}</strong></div><div className="topbar-right"><div className="theme-picker"><span className="theme-picker-label">Theme</span><Select value={theme} onValueChange={value => { if (themes.some(t => t.id === value)) setTheme(value as ColorTheme); }}><SelectTrigger className="theme-select" aria-label="Select color theme"><SelectValue /></SelectTrigger><SelectContent>{themes.map(t => <SelectItem key={t.id} value={t.id}><span className={`theme-swatch swatch-${t.id}`} aria-hidden="true" />{t.label}</SelectItem>)}</SelectContent></Select></div><button className="demo-pill" onClick={() => setAboutOpen(true)}><span />Prototype · sample data<Info size={13} /></button><span className="top-avatar" aria-label="Shaun's demo profile">S</span></div></header>
    <div className="workspace-content" id="main-content">
      {game === "league" && <div className="catalog-meta" role="status" aria-live="polite"><span>{catalogStatus}</span><button className="text-button" disabled={catalogBusy} onClick={retryCatalog}>{catalogBusy?"Loading…":"Check updates / Retry"}</button></div>}

      {view === "overview" && <div className="page-enter"><div className="page-heading"><div><p className="eyebrow">LEAGUE OF LEGENDS</p><h1 ref={mainHeading} tabIndex={-1}>Welcome back, Shaun<span className="heading-dot">.</span></h1><p className="page-description">Your champions, your collection, your next move.</p></div><span className="season-label"><Gamepad2 size={17} />Your gaming workspace</span></div>
        <div className="overview-top-grid"><section className="focus-card"><img className="focus-art" src={`/assets/champions/${focusMatch.champion}.jpg`} alt={championById[focusMatch.champion].name} fetchPriority="high" /><div className="focus-shade" /><div className="focus-content"><span className="feature-label"><Crosshair size={14} />YOUR NEXT GAME</span><h2>{focus === matches[0].focus ? <>Turn your lead<br />into an objective.</> : focus}</h2><button className="primary-button" onClick={() => openMatch(focusMatch)}>Review the match<ArrowUpRight size={17} /></button><div className="focus-match-meta"><span className={focusMatch.won?"positive":"negative"}>{focusMatch.won?"VICTORY":"DEFEAT"}</span><span>{championById[focusMatch.champion].name}</span><span>{focusMatch.kills} / {focusMatch.deaths} / {focusMatch.assists}</span></div></div><span className="art-caption">{championById[focusMatch.champion].name.toUpperCase()} / {championById[focusMatch.champion].title.toUpperCase()}</span></section>
          <section className="pool-card panel"><SectionHeading title="Your champion pool" action="Explore" onAction={() => navigate("champions")} /><div className="pool-list">{pool.slice(0,3).map(id => <button className="pool-row" key={id} onClick={() => setSelectedChampion(championById[id])}><ChampionIcon id={id} src={championById[id]?.icon} /><span><strong>{(championById[id]?.name || id)}</strong><small>{guides[id]?.lane} · {guides[id]?.style}</small></span><ArrowUpRight size={17} /></button>)}{pool.length===0 && <div className="small-empty">Star a champion in the explorer to build your pool.</div>}</div><button className="pool-footer" onClick={() => { setPoolTab("saved"); navigate("champions"); }}><span><Star size={14} />{pool.length} saved champions</span><ArrowRight size={16} /></button></section>
        </div>
        <div className="stats-grid"><article className="stat-card"><div className="stat-label"><Trophy size={16} />Win rate<span>6 MATCHES</span></div><div className="stat-value">{overall.winRate}<span>%</span><span className="stat-note positive">{overall.wins}W <i>/</i> {matches.length-overall.wins}L</span></div><div className="result-strip" aria-label="Sample results: win, loss, win, win, loss, win">{matches.map(m => <span key={m.id} className={m.won?"win":"loss"} />)}</div></article><article className="stat-card"><div className="stat-label"><Swords size={16} />Average KDA</div><div className="stat-value">{overall.kda}<span>: 1</span></div><p className="stat-footnote">Kills + assists per death</p></article><article className="stat-card"><div className="stat-label"><Layers3 size={16} />Your collection</div><div className="stat-value">{owned.length}<span>skins owned</span><span className="stat-note">{wishlist.length} wishlisted</span></div><Progress className="collection-progress" value={owned.length/league.skins.length*100} aria-label={`${owned.length} of ${league.skins.length} catalog skins owned`} /></article></div>
        <div className="overview-bottom-grid"><section className="recent-matches"><SectionHeading title="Recent matches" count="SAMPLE" action="View all" onAction={() => navigate("matches")} /><div className="match-list">{matches.slice(0,4).map(m => <MatchRow key={m.id} match={m} compact onClick={() => openMatch(m)} />)}</div></section><section className="learning-card panel"><div className="learning-card-top"><span className="learning-icon"><BookOpen size={20} /></span><span className="eyebrow">PLAY WITH INTENT</span></div><h2>One game.<br />One thing to improve.</h2><p>Your current focus</p><div className="saved-focus"><Target size={18} /><strong>{focus}</strong></div><button className="text-button" onClick={() => navigate("matches")}>Find your next focus<ArrowUpRight size={16} /></button></section></div>
        <section className="wishlist-section"><SectionHeading title="On your wishlist" count={String(wishlist.length)} action="Open collection" onAction={() => { setSkinTab("wishlist"); navigate("collection"); }} /><div className="wishlist-grid">{wishlist.slice(0,3).map(s => <button className="wishlist-feature" key={s.id} onClick={() => setSkinPreview(s)}><img src={s.image} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=championById[s.champion]?.image || "/assets/champions/Gwen.jpg";}} alt={s.name} loading="lazy" /><span className="wishlist-gradient" /><span className="wishlist-name"><small>{championById[s.champion].name.toUpperCase()}</small><strong>{s.name}</strong></span><span className="wishlist-heart"><Heart size={16} fill="currentColor" /></span><ArrowUpRight className="wishlist-arrow" size={20} /></button>)}{wishlist.length===0 && <div className="small-empty">Your wishlist is empty. Explore the collection to save a skin you like.</div>}</div></section>
      </div>}

      {view === "champions" && <div className="page-enter"><div className="page-heading"><div><p className="eyebrow">KNOW YOUR CHAMPIONS</p><h1 ref={mainHeading} tabIndex={-1}>Find your next main<span className="heading-dot">.</span></h1><p className="page-description">Explore the complete roster. Build a pool that feels like you.</p></div><span className="quiet-badge">{league.champions.length} champions</span></div><Tabs value={poolTab} onValueChange={setPoolTab} className="view-tabs"><div className="filter-toolbar"><TabsList variant="line" className="line-tabs"><TabsTrigger value="all">All champions <span>{league.champions.length}</span></TabsTrigger><TabsTrigger value="saved"><Star size={14} />My pool <span>{pool.length}</span></TabsTrigger></TabsList><div className="search-filter"><div className="search-input"><Search size={16} /><Input value={championQuery} onChange={e => setChampionQuery(e.target.value)} placeholder="Search champions" aria-label="Search champions" />{championQuery && <button className="clear-input" onClick={()=>setChampionQuery("")} aria-label="Clear champion search"><X size={15}/></button>}</div><Select value={lane} onValueChange={setLane}><SelectTrigger className="role-select" aria-label="Filter champions by role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem>{["Top","Jungle","Mid","Bot","Support","Assassin","Fighter","Mage","Marksman","Tank"].map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div></div>{["all","saved"].map(tab => <TabsContent key={tab} value={tab}><div className="catalog-meta"><span>{filteredChampions.length} champions</span><span><Star size={13} />Star a champion to add it to your pool</span></div><div className="champion-grid">{filteredChampions.map(c => <article className="champion-card" key={c.id}><button className="champion-card-main" onClick={() => setSelectedChampion(c)} aria-label={`Explore ${c.name}`}><img src={c.image} alt={c.name} loading="lazy" /><span className="champion-image-shade" /><span className="champion-card-info"><small>{guides[c.id].lane.toUpperCase()}</small><strong>{c.name}</strong><span>{c.title}</span></span><span className="champion-open"><ArrowUpRight size={19} /></span></button><button className={`save-champion ${pool.includes(c.id)?"saved":""}`} aria-label={`${pool.includes(c.id)?"Remove":"Add"} ${c.name} ${pool.includes(c.id)?"from":"to"} your pool`} aria-pressed={pool.includes(c.id)} onClick={() => togglePool(c.id)}><Star size={17} fill={pool.includes(c.id)?"currentColor":"none"} /></button></article>)}</div>{filteredChampions.length===0 && <EmptyState title={poolTab==="saved"&&pool.length===0?"Your pool starts here":"No champions found"} text={poolTab==="saved"&&pool.length===0?"Open All champions and star a champion you want to play.":"Try a different name or role."} onReset={()=>{setChampionQuery("");setLane("all");setPoolTab("all");}} />}</TabsContent>)}</Tabs><p className="catalog-note">Champion information: Riot Games Data Dragon {league.version}. Class filters use Riot’s tags; lane labels are curated starter guidance.</p></div>}

      {view === "collection" && <div className="page-enter"><div className="page-heading"><div><p className="eyebrow">A COLLECTION THAT’S YOURS</p><h1 ref={mainHeading} tabIndex={-1}>More than a skin<span className="heading-dot">.</span></h1><p className="page-description">Keep track of what you own and what you’re after.</p></div><span className="quiet-badge"><CheckCheck size={15} />{localSaveAvailable?"Saved on this device":"Saved for this session"}</span></div><div className="collection-summary"><div><span className="summary-icon"><Layers3 size={23}/></span><span><strong>{owned.length}</strong><small>Skins owned</small></span></div><div><span className="summary-icon purple"><Heart size={23}/></span><span><strong>{wishlist.length}</strong><small>On your wishlist</small></span></div><div><span className="summary-icon neutral"><Sparkles size={23}/></span><span><strong>{league.skins.length}</strong><small>Catalog skins</small></span></div><p>Demo collection<br/><span>Mark ownership manually. No account sync.</span></p></div><Tabs value={skinTab} onValueChange={setSkinTab} className="view-tabs"><div className="filter-toolbar"><TabsList variant="line" className="line-tabs"><TabsTrigger value="all">Discover <span>{league.skins.length}</span></TabsTrigger><TabsTrigger value="owned">Owned <span>{owned.length}</span></TabsTrigger><TabsTrigger value="wishlist">Wishlist <span>{wishlist.length}</span></TabsTrigger></TabsList><div className="search-input"><Search size={16}/><Input value={skinQuery} onChange={e=>setSkinQuery(e.target.value)} placeholder="Search skins or champions" aria-label="Search skins or champions" />{skinQuery&&<button className="clear-input" onClick={()=>setSkinQuery("")} aria-label="Clear skin search"><X size={15}/></button>}</div></div>{["all","owned","wishlist"].map(tab=><TabsContent key={tab} value={tab}><div className="catalog-meta"><span>{filteredSkins.length} skins</span><span>All Data Dragon skins · including classic artwork</span></div><div className="search-filter" style={{marginBottom:20}}><Select value={skinChampion} onValueChange={setSkinChampion}><SelectTrigger aria-label="Filter skins by champion" className="role-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All champions</SelectItem>{league.champions.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div><div className="skin-grid">{filteredSkins.slice(0,skinLimit).map(s=><article className="skin-card" key={s.id}><button className="skin-art" onClick={()=>setSkinPreview(s)} aria-label={`View ${s.name}`}><img src={s.image} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=championById[s.champion]?.image || "/assets/champions/Gwen.jpg";}} alt={s.name} loading="lazy"/><span className="skin-expand"><ArrowUpRight size={18}/></span>{collection[s.id]==="owned"&&<span className="owned-badge"><Check size={12}/>OWNED</span>}</button><div className="skin-details"><p>{championById[s.champion].name}</p><h3>{s.name}</h3><div className="skin-actions"><label className="owned-control"><Checkbox checked={collection[s.id]==="owned"} onCheckedChange={checked=>updateSkin(s.id,checked===true?"owned":undefined)} aria-label={`Mark ${s.name} as owned`}/>Owned</label><button className={`wishlist-control ${collection[s.id]==="wishlist"?"active":""}`} disabled={collection[s.id]==="owned"} onClick={()=>updateSkin(s.id,collection[s.id]==="wishlist"?undefined:"wishlist")} aria-pressed={collection[s.id]==="wishlist"} aria-label={`${collection[s.id]==="wishlist"?"Remove":"Add"} ${s.name} ${collection[s.id]==="wishlist"?"from":"to"} wishlist`}><Heart size={17} fill={collection[s.id]==="wishlist"?"currentColor":"none"}/><span>{collection[s.id]==="wishlist"?"Wishlisted":"Wishlist"}</span></button></div></div></article>)}</div>{filteredSkins.length>skinLimit&&<button className="secondary-button" onClick={()=>setSkinLimit(n=>n+48)}>Load more ({Math.min(skinLimit,filteredSkins.length)} of {filteredSkins.length})</button>}{filteredSkins.length===0&&<EmptyState title={skinQuery?"No matching skins":skinTab==="owned"?"Your collection starts here":"A little room for something new"} text={skinQuery?"Try a champion name or clear your search.":skinTab==="owned"?"Open Discover and mark a skin you own.":"Open Discover and tap a heart to start your wishlist."} onReset={()=>{setSkinQuery("");setSkinTab("all");setSkinChampion("all");}}/>}</TabsContent>)}</Tabs></div>}

      {view === "matches" && <div className="page-enter"><h1 ref={mainHeading} tabIndex={-1}>Match review</h1><LiveMatches version={league.version}/></div>}
      {game === "genshin" && <GenshinWorkspace view={view} onNavigate={navigate} headingRef={mainHeading} completedTasks={genshinTasks} onToggleTask={toggleGenshinTask}/>}
      <footer className="page-footer"><span>PROJECT X <i>/</i> YOUR GAMING WORKSPACE</span><button onClick={()=>setAboutOpen(true)}>Prototype 0.2 <ArrowUpRight size={12}/></button></footer>
    </div>
  </SidebarInset>

  <Sheet open={!!selectedChampion} onOpenChange={open=>{if(!open)setSelectedChampion(null);}}><SheetContent className="champion-sheet">{selectedChampion&&<><div className="sheet-champion-art"><img src={selectedChampion.image} alt={selectedChampion.name}/><span/></div><SheetHeader className="champion-sheet-header"><p className="eyebrow">{guides[selectedChampion.id].lane.toUpperCase()} / {guides[selectedChampion.id].style.toUpperCase()}</p><SheetTitle>{selectedChampion.name}</SheetTitle><SheetDescription>{selectedChampion.title}</SheetDescription><button className={pool.includes(selectedChampion.id)?"secondary-button":"primary-button"} onClick={()=>togglePool(selectedChampion.id)}><Star size={16} fill={pool.includes(selectedChampion.id)?"currentColor":"none"}/>{pool.includes(selectedChampion.id)?"In your champion pool":"Add to my champion pool"}</button></SheetHeader><Tabs defaultValue="overview" key={selectedChampion.id} className="champion-sheet-tabs"><TabsList variant="line" className="line-tabs"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="abilities">Abilities</TabsTrigger><TabsTrigger value="skins">Skins</TabsTrigger></TabsList><TabsContent value="overview"><div className="champion-traits"><span><Shield size={15}/>{selectedChampion.tags.join(" · ")}</span><span>{guides[selectedChampion.id].difficulty}</span></div><h3 className="detail-section-title">The champion</h3><p className="lore-text">{selectedChampion.lore}</p><div className="champion-practice"><span className="eyebrow"><Target size={14}/>A PLACE TO START</span><h3>{guides[selectedChampion.id].focus}</h3><p>{guides[selectedChampion.id].practice}</p></div></TabsContent><TabsContent value="abilities"><div className="ability-list">{selectedChampion.abilities.map(a=><article className="ability" key={a.key}><span className="ability-key">{a.key}</span><div><h3>{a.name}</h3><p>{a.description}</p></div></article>)}</div><p className="catalog-note">Descriptions from Data Dragon {league.version}. Values can change between patches.</p></TabsContent><TabsContent value="skins"><div className="sheet-skin-list">{league.skins.filter(s=>s.champion===selectedChampion.id).map(s=><article key={s.id}><img loading="lazy" src={s.image} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=championById[s.champion]?.image || "/assets/champions/Gwen.jpg";}} alt={s.name}/><h3>{s.name}</h3><button className="secondary-button" onClick={()=>{setSkinChampion(selectedChampion.id);setSkinQuery("");setSkinTab("all");setSelectedChampion(null);navigate("collection");}}>View in collection<ArrowUpRight size={16}/></button></article>)}{league.skins.every(s=>s.champion!==selectedChampion.id)&&<p className="small-empty">Skins are loading. Check the catalog status and retry if needed.</p>}</div></TabsContent></Tabs></>}</SheetContent></Sheet>

  <Dialog open={!!skinPreview} onOpenChange={open=>{if(!open)setSkinPreview(null);}}><DialogContent className="skin-preview-dialog">{skinPreview&&<><img className="skin-preview-image" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=championById[skinPreview.champion]?.image || "/assets/champions/Gwen.jpg";}} src={skinPreview.image} alt={skinPreview.name}/><DialogHeader><p className="eyebrow">{championById[skinPreview.champion].name.toUpperCase()}</p><DialogTitle>{skinPreview.name}</DialogTitle><DialogDescription>{collection[skinPreview.id]==="owned"?"Marked as owned in your local collection.":collection[skinPreview.id]==="wishlist"?"Saved to your local wishlist.":"Add this skin to your local collection or wishlist."}</DialogDescription></DialogHeader><div className="skin-preview-actions"><button className={collection[skinPreview.id]==="owned"?"secondary-button":"primary-button"} onClick={()=>updateSkin(skinPreview.id,collection[skinPreview.id]==="owned"?undefined:"owned")}><Check size={16}/>{collection[skinPreview.id]==="owned"?"Remove ownership":"Mark as owned"}</button><button className="secondary-button" disabled={collection[skinPreview.id]==="owned"} onClick={()=>updateSkin(skinPreview.id,collection[skinPreview.id]==="wishlist"?undefined:"wishlist")}><Heart size={16} fill={collection[skinPreview.id]==="wishlist"?"currentColor":"none"}/>{collection[skinPreview.id]==="wishlist"?"Remove from wishlist":"Add to wishlist"}</button></div></>}</DialogContent></Dialog>

  <Dialog open={aboutOpen} onOpenChange={setAboutOpen}><DialogContent className="about-dialog"><DialogHeader><div className="about-logo" aria-hidden="true">X</div><DialogTitle>Project X, version 0.2</DialogTitle><DialogDescription>A multi-game companion for League of Legends and Genshin Impact.</DialogDescription></DialogHeader><div className="about-content"><p><strong>Two game workspaces.</strong> Switch between the League dashboard and a new Genshin workspace for characters, exploration, collection notes, and a daily checklist.</p><p><strong>Your prototype data.</strong> Matches, insights, ownership, Genshin progress, and initial account details are examples based on a saved snapshot. Your changes are stored on this device when browser storage is available.</p><p><strong>Account connection.</strong> The champion and skin catalog loads from Riot Data Dragon. Match review supports Riot ID search through server-side Account-V1 and Match-V5 APIs when the owner configures a Riot API key. Ownership remains manual.</p><p><strong>Artwork and champion information.</strong> League data comes from Riot Games Data Dragon {league.version}. Patch updates are checked on opening, hourly, and when returning to this tab. Data Dragon releases may lag game patches. Project X is an independent fan prototype and is not endorsed by Riot Games or HoYoverse.</p><a href="https://developer.riotgames.com/docs/lol#data-dragon" target="_blank" rel="noreferrer">Riot Games Data Dragon<ArrowUpRight size={14}/></a></div></DialogContent></Dialog>
  <Toaster theme="dark" position="bottom-right" />
  </SidebarProvider>;
}
