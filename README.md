# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
\n+## Backend CI (GHCR + VPS)
\n+This repository includes a GitHub Actions workflow at `.github/workflows/backend.yml` that:
- Builds the backend Docker image from `backend/Dockerfile`.
- Pushes to GHCR as `ghcr.io/miralriodev/arroyo-seco-api:latest` and `:<commit-sha>`.
- SSHes into the VPS and restarts the `api_1` and `api_2` services via `docker-compose`.
\n+Required repository secrets:
- `VPS_HOST`: VPS hostname or IP.
- `VPS_USER`: SSH username.
- `VPS_SSH_KEY`: Private key (PEM) for the SSH user.
- `VPS_PORT`: SSH port (e.g. `22`).
- `COMPOSE_PATH`: Absolute path to `docker-compose.yml` on the VPS.
\n+Notes:
- The workflow logs in to GHCR using `GITHUB_TOKEN` and pushes images to `ghcr.io`.
- Ensure your VPS has Docker and Docker Compose v2 installed.
- The compose file should define services `api_1` and `api_2` using the image `ghcr.io/miralriodev/arroyo-seco-api:latest`.
