# jerSEys

This repository is split into:

- [`frontend/`](frontend/) - the Vite React app that can be deployed to Vercel
- [`backend/`](backend/) - SQL files, scraper scripts, and supporting docs

If you want to deploy only the frontend, set Vercel's root directory to `frontend/`.

## Deployment configuration

- Frontend: Vercel with `VITE_API_URL` set to the public backend URL ending in `/api`.
- Backend: a Node.js host such as Render with the variables documented in `backend/.env.example`.
- Database: hosted MySQL initialized from the migrations in `backend/database/`.
- Email: optional SMTP credentials in `EMAIL_USER` and `EMAIL_PASS` for account email workflows.

Never commit `.env` files. The Gmail app password and JWT secret previously present in Git history must be rotated before another deployment, and the public repository history should be cleaned in a separately coordinated rewrite.
