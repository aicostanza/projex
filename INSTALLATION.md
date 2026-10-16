# Installation guide

Project X is a League-first gaming companion built with React, TypeScript, and Vinext. This repository contains the source exported from the existing ChatGPT Site, including the interface, champion and skin galleries, match analysis, and Riot match-history handler.

## Requirements

- Node.js 22.13 or newer (Node.js 22 or 24).
- npm, included with Node.js.
- Git.
- Linux or Windows Subsystem for Linux (WSL) with Bash for the bundled build scripts.
- Internet access to install dependencies and load remote game data.

On Windows, run the following commands inside a WSL terminal. The bundled scripts also use Linux utilities such as `flock`, GNU `timeout`, `curl`, and `sha256sum`.

## 1. Download the project

```bash
git clone https://github.com/aicostanza/projex.git
cd projex
```

## 2. Install dependencies

```bash
npm ci
chmod +x scripts/*.sh
```

`npm ci` installs the versions recorded in `package-lock.json`. The script permissions are needed because the bundled scripts invoke one another directly.

The repository also includes a Linux installation helper with additional environment and download checks:

```bash
npm run install:ci
```

Use that helper instead of `npm ci` when those checks are required; there is no need to run both for an ordinary installation.

## 3. Start development

```bash
npm run dev
```

Open the local URL printed in the terminal. Keep the terminal running while using the development server. Press Ctrl+C to stop it.

## 4. Build and run

```bash
npm run build
npm run start
```

The current build command uses Vinext and the Cloudflare integration. It does not run a standard Next.js build.

## 5. Run the bundled checks

```bash
npm test
```

This command builds the project before running its Node.js tests. These instructions describe the repository commands; a successful installation and build have not been verified on every operating system.

## Riot API configuration

Champion and skin artwork uses Data Dragon. Player match history requires a separate server-side `RIOT_API_KEY`.

For the existing ChatGPT Site, configure `RIOT_API_KEY` in its runtime environment settings and redeploy. The Worker reads the key from its environment binding and serves `/api/riot/history`. A local or alternate deployment must supply that same server-side binding.

Never put the key in browser code, a public environment variable, a commit, or an issue. Local secret files must remain ignored by Git. The repository does not include the live site's runtime secrets. Match history reports a configuration error when the key is missing.

## Deploying to Vercel

**This export needs a hosting migration before it can run correctly on Vercel.** Importing the repository alone does not convert its Cloudflare Worker into a Vercel Function.

The remaining migration work is:

1. Use standard Next.js development, build, and start commands, or another explicitly supported Vercel runtime.
2. Expose the existing `riotHistory` handler through a Next.js route at `app/api/riot/history/route.ts`, reading `process.env.RIOT_API_KEY` on the server.
3. Adapt or exclude Cloudflare-only files and types from the Vercel build. The current Worker, Vite integration, and D1 helper depend on Cloudflare.
4. Replace any ChatGPT-hosted authentication or storage bindings that the deployed application actually uses.
5. Validate the production build and the live history endpoint.

After that migration:

1. In Vercel, choose **Add New → Project**.
2. Import **aicostanza/projex** and select the correct workspace.
3. Select the Next.js preset and keep the repository root as the root directory.
4. Add `RIOT_API_KEY` as a server-side environment variable for the required environments.
5. Deploy, then check the dashboard, galleries, and match-history search.

Vercel supplies a `.vercel.app` address; buying a domain is optional. Connecting Vercel to ChatGPT also requires authorization for the workspace that owns the project.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `node` or `npm` not found | Install Node.js, reopen the terminal, and check `node --version` and `npm --version`. |
| Permission denied in a shell script | Run `chmod +x scripts/*.sh` inside Linux or WSL. |
| Bash, flock, or timeout missing | Use Linux or WSL and install the missing system utility. |
| Missing dependencies | Run `npm ci` from the repository root. |
| Match history says the API key is missing | Configure the server runtime secret and redeploy; it is not included in the GitHub export. |
| Vercel reports 403 for a workspace | Confirm that the connected Vercel account or integration can deploy to that workspace. |
| Vercel build references Cloudflare or Vinext | Complete the hosting migration described above. |
| Favorites or collection settings disappear | These preferences use browser-local storage; clearing browser data can reset them. |
