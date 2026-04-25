# jerSEys Backend

This folder contains the backend foundation for the `jerSEys` project, along with existing supporting folders such as `database`, `docs`, `scraper`, and `scripts`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell you can use:

```powershell
Copy-Item .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

## Health Check

Once the server is running, test the health route at:

`http://localhost:5000/api/health`
