'use client';
import { useState } from 'react';
import { MatchAnalyzer } from '@/lib/match-analysis';
import { championGuides, type Lane, type SampleMatch } from '@/lib/project-data';

const analyzer = new MatchAnalyzer();
export function MatchAnalysis({ match }: { match: Pick<SampleMatch, 'minutes' | 'kills' | 'deaths' | 'assists' | 'cs' | 'vision' | 'kp' | 'champion'> & { source?: string } }) {
  const [role, setRole] = useState<Lane>(championGuides[match.champion]?.lane ?? 'Mid');
  const result = analyzer.analyze(match, role);
  return <section className="algorithm-panel" aria-label="Calculated match analysis">
    <div className="algorithm-heading"><div><span className="eyebrow">CALCULATED ANALYSIS · V1</span><h3>Your practice snapshot</h3></div><label>Role <select value={role} onChange={e => setRole(e.target.value as Lane)}>{(['Top','Jungle','Mid','Bot','Support'] as Lane[]).map(r => <option key={r}>{r}</option>)}</select></label></div>
    {!result ? <p>Not enough valid data to analyze this match.</p> : <><div className="algorithm-score"><strong>{result.score}<small>/100</small></strong><p>Practice score <span>{match.source ?? 'One sample match'} · {role}</span></p></div><div className="algorithm-metrics">{result.metrics.map(m => <div key={m.name}><div><strong>{m.name}</strong><span>{Math.round(m.score)}/100</span></div><progress value={m.score} max={100} aria-label={`${m.name} score`} /><small>{m.value.toFixed(1)} {m.unit} · target {m.name === 'Survival' ? '≤' : '≥'} {m.target}</small></div>)}</div><div className="algorithm-advice"><span className="eyebrow">NEXT PRACTICE FOCUS</span><h3>{result.focus}</h3><p>{result.advice}</p></div></>}
    <details><summary>How this algorithm works</summary><p>Farming, vision and participation scores are actual ÷ role target × 100, capped at 100. Survival is 100 − 35 × max(0, deaths per 10 minutes − 1), floored at zero; at most 2 deaths per 10 minutes is a practice target, not the full-score threshold. The overall score is the weighted mean: farming 30%, survival 30%, vision 20%, participation 20%. Support excludes farming and uses 30% survival, 40% vision, 30% participation. The lowest scoring metric determines the focus.</p><p>These are Project X practice heuristics, not rank benchmarks, Riot ratings, or predictions. Role defaults from the champion guide; change it if needed. KDA and win/loss do not change the score. Summary stats cannot establish objective timing, positioning mistakes, or why a match was won. The existing written insights and timeline are illustrative, separate from this calculation.</p></details>
  </section>;
}
