# Outland Map Generator

Web app built with React + Vite to generate stylized fantasy maps.

## Development

Requirements:
- Node.js 20+

Commands:
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`

## Deploy on Vercel

This repository is configured for static deployment on Vercel.

How to deploy:
1. Import this repository in Vercel.
2. Keep the framework preset as Vite.
3. Ensure build command is `npm run build` and output directory is `dist`.
4. Deploy.

Routing behavior:
- The app uses client-side routing with BrowserRouter.
- `vercel.json` includes a rewrite to `/index.html` so direct URL access to non-root routes does not return 404.
