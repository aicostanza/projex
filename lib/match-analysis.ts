import type { Lane, SampleMatch } from './project-data';

// Product heuristics for practice, not population percentiles or Riot ratings.
export class MatchAnalyzer {
  analyze(match: Pick<SampleMatch, 'minutes' | 'kills' | 'deaths' | 'assists' | 'cs' | 'vision' | 'kp'>, role: Lane) {
    const values = [match.minutes, match.kills, match.deaths, match.assists, match.cs, match.vision, match.kp];
    if (values.some(n => !Number.isFinite(n) || n < 0) || match.minutes === 0 || match.kp > 100) return null;
    const targets = { Top: [7, .7, 50], Jungle: [6, 1, 60], Mid: [7, .8, 55], Bot: [7.5, .7, 55], Support: [0, 1.5, 65] }[role];
    const cap = (n: number) => Math.max(0, Math.min(100, n));
    const metrics = [
      ...(role === 'Support' ? [] : [{ name: 'Farming', value: match.cs / match.minutes, target: targets[0], unit: 'CS/min', score: cap(match.cs / match.minutes / targets[0] * 100), weight: 30, advice: 'Collect the next safe wave or camp before looking for a fight.' }]),
      { name: 'Survival', value: match.deaths / match.minutes * 10, target: 2, unit: 'deaths/10 min (lower is better)', score: cap(100 - Math.max(0, match.deaths / match.minutes * 10 - 1) * 35), weight: 30, advice: 'Review your last death and identify a safer position or escape before committing.' },
      { name: 'Vision', value: match.vision / match.minutes, target: targets[1], unit: 'vision/min', score: cap(match.vision / match.minutes / targets[1] * 100), weight: role === 'Support' ? 40 : 20, advice: 'Prepare vision with your team before the next objective; avoid entering unwarded areas alone.' },
      { name: 'Participation', value: match.kp, target: targets[2], unit: '% kill participation', score: cap(match.kp / targets[2] * 100), weight: role === 'Support' ? 30 : 20, advice: 'Check nearby teammates and wave state before moving toward the next skirmish.' },
    ];
    const totalWeight = metrics.reduce((n, m) => n + m.weight, 0);
    const score = Math.round(metrics.reduce((n, m) => n + m.score * m.weight, 0) / totalWeight);
    const weakest = metrics.reduce((a, b) => a.score <= b.score ? a : b);
    return { score, metrics, weakest, games: 1, focus: weakest.score >= 90 ? 'Maintain your fundamentals' : `Practice ${weakest.name.toLowerCase()}`, advice: weakest.score >= 90 ? 'Your tracked metrics meet these practice targets. Review the replay for decisions that summary statistics cannot explain.' : weakest.advice };
  }
}
