"use client";

import type { RefObject } from "react";
import { ArrowRight, CalendarDays, Check, CircleCheck, Compass, Map, PackageOpen, Sparkles, Star, Users, Waves, Wind, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { View } from "@/lib/project-data";
import { toast } from "sonner";

export const genshinNav = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "champions", label: "Characters", icon: Users },
  { id: "matches", label: "Exploration", icon: Map },
  { id: "collection", label: "Collection", icon: PackageOpen },
] as const;

export const genshinTaskIds = new Set(["commissions", "resin", "expeditions"]);

const tasks = [
  { id: "commissions", label: "Daily commissions", detail: "Clear all four commissions", icon: CircleCheck },
  { id: "resin", label: "Spend Original Resin", detail: "Use it on your current build", icon: Waves },
  { id: "expeditions", label: "Claim expeditions", detail: "Collect and send them out again", icon: CalendarDays },
] as const;

const characters = [
  { name: "Flins", element: "Electro", role: "On-field damage", status: "Built", level: "LV. 90", detail: "Talents 4 / 10 / 10", glyph: "F", color: "electro" },
  { name: "Columbina", element: "Hydro", role: "Reaction support", status: "Build next", level: "OBTAINED", detail: "Plan materials and artifacts", glyph: "C", color: "hydro" },
  { name: "Traveler", element: "Adaptive", role: "Flexible utility", status: "Available", level: "ROSTER", detail: "Switch elements as needed", glyph: "T", color: "traveler" },
] as const;

const regions = [
  { name: "Mondstadt", progress: 100, note: "Main areas complete", icon: Wind },
  { name: "Liyue", progress: 100, note: "Main areas complete", icon: Sparkles },
  { name: "The Chasm", progress: 77.6, note: "Continue underground routes", icon: Map },
  { name: "Chenyu Vale", progress: 39.2, note: "Largest remaining opportunity", icon: Waves },
] as const;

function PageHeading({ headingRef, eyebrow, title, description, badge }: { headingRef: RefObject<HTMLHeadingElement | null>; eyebrow: string; title: string; description: string; badge: string }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1 ref={headingRef} tabIndex={-1}>{title}<span className="heading-dot">.</span></h1><p className="page-description">{description}</p></div><span className="quiet-badge"><Sparkles size={15}/>{badge}</span></div>;
}

function DailyTasks({ completed, onToggle }: { completed: string[]; onToggle: (id: string) => void }) {
  return <section className="genshin-dailies panel"><div className="genshin-section-heading"><div><span className="eyebrow">TODAY IN TEYVAT</span><h2>Daily checklist</h2></div><span>{completed.length} / {tasks.length}</span></div><div className="genshin-task-list">{tasks.map(task => { const done = completed.includes(task.id); return <button key={task.id} className={`genshin-task ${done ? "done" : ""}`} onClick={() => onToggle(task.id)} aria-pressed={done}><span className="genshin-task-check">{done ? <Check size={15}/> : <task.icon size={16}/>}</span><span><strong>{task.label}</strong><small>{task.detail}</small></span></button>; })}</div></section>;
}

function RegionList({ compact = false }: { compact?: boolean }) {
  return <div className={`genshin-region-list ${compact ? "compact" : ""}`}>{regions.map(region => <article className="genshin-region" key={region.name}><span className="genshin-region-icon"><region.icon size={18}/></span><div><div className="genshin-region-title"><strong>{region.name}</strong><span>{region.progress}%</span></div><Progress value={region.progress} aria-label={`${region.name} exploration ${region.progress}%`} /><small>{region.note}</small></div></article>)}</div>;
}

function CharacterGrid() {
  return <div className="genshin-character-grid">{characters.map(character => <article className="genshin-character-card panel" key={character.name}><div className={`genshin-character-mark ${character.color}`} aria-hidden="true"><span>{character.glyph}</span></div><div className="genshin-character-copy"><div className="genshin-character-meta"><span>{character.element}</span><span>{character.level}</span></div><h2>{character.name}</h2><p>{character.role}</p><div className="genshin-character-status"><span>{character.status}</span><small>{character.detail}</small></div><button className="secondary-button" onClick={() => toast.success(`${character.name} set as your active build`)}>Set active build<ArrowRight size={15}/></button></div></article>)}</div>;
}

export function GenshinWorkspace({ view, onNavigate, headingRef, completedTasks, onToggleTask }: { view: View; onNavigate: (view: View) => void; headingRef: RefObject<HTMLHeadingElement | null>; completedTasks: string[]; onToggleTask: (id: string) => void }) {
  const averageExploration = Math.round(regions.reduce((sum, region) => sum + region.progress, 0) / regions.length);

  if (view === "champions") return <div className="page-enter genshin-page"><PageHeading headingRef={headingRef} eyebrow="GENSHIN IMPACT / CHARACTERS" title="Build your roster" description="Keep your next upgrades visible without losing track of the team you already built." badge="Personal prototype snapshot"/><CharacterGrid/></div>;

  if (view === "matches") return <div className="page-enter genshin-page"><PageHeading headingRef={headingRef} eyebrow="GENSHIN IMPACT / EXPLORATION" title="Finish the map" description="See where your biggest exploration gains are still waiting." badge="Last saved snapshot"/><section className="genshin-exploration-layout"><div className="panel genshin-map-panel"><div className="genshin-section-heading"><div><span className="eyebrow">REGION PROGRESS</span><h2>Your tracked areas</h2></div><strong>{averageExploration}%</strong></div><RegionList/></div><aside className="panel genshin-route-card"><span className="genshin-route-icon"><Compass size={24}/></span><p className="eyebrow">NEXT ROUTE</p><h2>Continue Chenyu Vale</h2><p>It has the most room to grow among the areas in this snapshot. Clear one sub-area at a time, then sweep with the treasure compass.</p><button className="primary-button" onClick={() => toast.success("Chenyu Vale set as your next route")}>Set as next route<ArrowRight size={16}/></button></aside></section></div>;

  if (view === "collection") return <div className="page-enter genshin-page"><PageHeading headingRef={headingRef} eyebrow="GENSHIN IMPACT / COLLECTION" title="Your account, organized" description="A compact home for the characters, weapons, and goals you care about." badge="Manual tracking"/><div className="genshin-collection-grid"><article className="panel genshin-collection-card"><span className="genshin-collection-icon"><Users size={22}/></span><span className="eyebrow">CHARACTERS</span><h2>Flins & Columbina</h2><p>Your two highlighted characters. Flins is built; Columbina is queued for investment.</p><button className="text-button" onClick={() => onNavigate("champions")}>Open characters<ArrowRight size={15}/></button></article><article className="panel genshin-collection-card"><span className="genshin-collection-icon weapon"><Zap size={22}/></span><span className="eyebrow">NOTABLE WEAPON</span><h2>Engulfing Lightning</h2><p>Saved as a notable pull in this prototype collection.</p><button className="secondary-button" onClick={() => toast.success("Weapon note saved")}>Keep in collection<Star size={15}/></button></article><article className="panel genshin-collection-card wide"><span className="genshin-collection-icon goal"><Map size={22}/></span><span className="eyebrow">ACCOUNT GOALS</span><h2>Finish Natlan and Fontaine</h2><p>Keep the big completion goals visible while you work through smaller daily tasks.</p><button className="text-button" onClick={() => onNavigate("matches")}>Review exploration<ArrowRight size={15}/></button></article></div></div>;

  return <div className="page-enter genshin-page"><PageHeading headingRef={headingRef} eyebrow="GENSHIN IMPACT" title="Welcome back, Shaun" description="Your characters, exploration, and daily progress in one workspace." badge="Teyvat workspace"/><div className="genshin-overview-grid"><section className="genshin-hero"><div className="genshin-hero-orbit" aria-hidden="true"><span/><span/><span/></div><div className="genshin-hero-copy"><span className="feature-label"><Compass size={14}/>CURRENT JOURNEY</span><h2>Keep moving through Teyvat.</h2><p>Build Columbina next while continuing the regions that still have the most left to discover.</p><div className="genshin-hero-actions"><button className="primary-button" onClick={() => onNavigate("champions")}>View characters<ArrowRight size={16}/></button><button className="secondary-button" onClick={() => onNavigate("matches")}>Open exploration</button></div></div><span className="genshin-hero-word">TEYVAT</span></section><DailyTasks completed={completedTasks} onToggle={onToggleTask}/></div><div className="stats-grid genshin-stats"><article className="stat-card"><div className="stat-label"><Users size={16}/>Highlighted roster</div><div className="stat-value">2<span>characters</span></div><p className="stat-footnote">Flins built · Columbina next</p></article><article className="stat-card"><div className="stat-label"><Map size={16}/>Exploration snapshot</div><div className="stat-value">{averageExploration}<span>% average</span></div><Progress className="collection-progress" value={averageExploration}/></article><article className="stat-card"><div className="stat-label"><CircleCheck size={16}/>Daily progress</div><div className="stat-value">{completedTasks.length}<span>of {tasks.length}</span></div><p className="stat-footnote">Checklist saved on this device</p></article></div><section className="genshin-region-preview"><div className="section-heading"><h2>Exploration progress <span className="count-pill">SNAPSHOT</span></h2><button className="text-button" onClick={() => onNavigate("matches")}>View all<ArrowRight size={15}/></button></div><RegionList compact/></section></div>;
}
