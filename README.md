# Project X

A League-first gaming companion with a dashboard, champion and skin galleries, match review, cosmetic collections, and a server-side Riot match-history handler.

## Installation

See [INSTALLATION.md](INSTALLATION.md) for requirements, local setup, build commands, Riot API configuration, troubleshooting, and Vercel migration requirements.

## Hosting

This repository is an export of the ChatGPT Site source. Its current scripts use Vinext and Cloudflare Workers. Vercel deployment requires adapting the build and server endpoints; the installation guide explains the remaining work.

## Data and credentials

Data Dragon supplies champion and skin artwork. Live player history uses Riot APIs through a server-side `RIOT_API_KEY`, configured separately in the hosting environment. No live runtime credentials are included in this repository. Data Dragon does not provide a player's skin ownership.

Favorites, collection selections, and preferences use browser-local storage. Illustrative match content is separate from live match results. See `public/asset-credits.json` for bundled artwork credits.

## Object-oriented programming (OOP)

The clearest OOP example is the match-analysis feature. Project X combines a class-based analysis service with React function components; it is not entirely class-based.

### Class, object, and method

[`lib/match-analysis.ts`](lib/match-analysis.ts) defines the **class** `MatchAnalyzer`. A class defines the behavior available to its instances. Its **method**, `analyze(match, role)`, validates match statistics, calculates role-based metrics, and returns a practice score and advice.

[`app/match-analysis.tsx`](app/match-analysis.tsx) creates an **object (instance)** from that class and calls its method:

```ts
const analyzer = new MatchAnalyzer();
const result = analyzer.analyze(match, role);
```

Here, `MatchAnalyzer` is the class, `analyzer` is the object, and `analyze` is the method. The same instance can analyze different matches and roles. The current class is stateless: it does not keep match data in instance fields between calls.

### OOP concepts demonstrated

| Concept | Where it appears | Explanation |
| --- | --- | --- |
| Encapsulation of behavior | `MatchAnalyzer.analyze()` | Validation, role targets, metric calculations, weighting, and advice selection are grouped inside one class method. Intermediate values stay local to the method. The current class has no private instance fields. |
| Abstraction | `analyzer.analyze(match, role)` | The interface asks for an analysis result without repeating the scoring formulas. It displays the returned score, metrics, focus, and advice. |
| Objects and methods | `new MatchAnalyzer()` and `analyzer.analyze(...)` | The application creates a class instance and invokes its behavior through a method. |
| Composition | `MatchAnalysis` uses a `MatchAnalyzer` instance | The UI uses a separate analysis object to perform calculations, keeping display logic separate from scoring behavior. |

### Data contracts

[`lib/project-data.ts`](lib/project-data.ts) defines the `SampleMatch` interface and the `Lane` type. The analyzer uses `Pick<SampleMatch, ...>` to accept only the statistics it needs.

These TypeScript declarations describe valid input shapes during development. They are not runtime classes and do not create objects by themselves. The method also checks numeric input at runtime before calculating results.

### How the feature works

1. The `MatchAnalysis` component receives match statistics.
2. The user selects a role, such as Mid or Support.
3. The component calls `analyzer.analyze(match, role)`.
4. The object checks the inputs and calculates role-specific metrics.
5. The component displays the result, or a message when the data is invalid.

Support analysis omits farming and adjusts the remaining metric weights. This is conditional behavior inside one method, not subclass polymorphism. The scores are practice heuristics, not official Riot ratings.

### Inheritance and polymorphism

The current analysis feature does **not** use class inheritance, overridden methods, or interchangeable analyzer implementations. It should not be presented as demonstrating all four traditional OOP pillars. React function components and TypeScript interfaces alone are also not evidence of inheritance or runtime polymorphism.

A future design could introduce a shared analyzer contract with separate League and Genshin implementations. That would be an extension, not a feature already implemented.

### Short presentation explanation

> “Our clearest use of OOP is the MatchAnalyzer class. We create an object from it and call its analyze method with match statistics and the selected role. The class groups the scoring behavior and gives the interface a simple way to request results. This demonstrates classes, objects, methods, abstraction, and encapsulation of behavior. The current implementation does not use inheritance or method overriding.”
