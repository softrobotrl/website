# Gradus RL

Website for Gradus RL, a [WAT.ai](https://watai.ca) research team building
reinforcement learning control policies for a tendon-driven soft quadruped
robot.

## Development

```bash
npm ci
npm run dev
```

Run the complete local quality gate before opening a pull request:

```bash
npm run check
```

## Stack

React, TypeScript, Vite, Tailwind CSS.

## Deployment

The site is configured for Vercel as a Vite multi-page build. Vite emits both
`index.html` and a custom `404.html`; leaving unmatched paths unrevised allows
Vercel to return the custom page with a real HTTP 404 status.

1. Import the repository into Vercel.
2. Keep the repository root as the project root.
3. Deploy using the checked-in `vercel.json` settings.

No environment variables are required for a root-domain deployment. If the
site is mounted below a path prefix, set `VITE_BASE_PATH` to that prefix before
building. Imported images, generated bundles, the favicon, home links, and 404
links all respect the configured base path.
