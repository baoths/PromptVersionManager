# Prompt Version Manager

Local-first prompt versioning and sharing. All data lives in IndexedDB, so the app works offline after the first load.

## Highlights

- Versioned prompts with diffing and snapshots
- Tags, folders, and fuzzy search
- Shareable links with URL-safe compression
- Export and import formats (JSON, Markdown, XML, AI-agent, plain text)
- PWA-ready for offline use

## Tech Stack

- React + TypeScript + Vite
- Dexie (IndexedDB)
- Zustand state management
- React Router (HashRouter)
- CSS Modules with theme tokens

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## GitHub Pages

1. Ensure the `base` path in vite.config.ts matches your repository name (case-sensitive).
2. Push to the `main` branch. The workflow builds and publishes to `gh-pages`.
3. In the repository settings, set GitHub Pages to deploy from the `gh-pages` branch.

## Notes

- This app is local-first and does not include any backend or user accounts.
- Deployments use the workflow in .github/workflows/deploy.yml.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
