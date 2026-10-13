# SmartFlow React frontend

This Vite + React 19 client consumes the existing C++ Crow API. It does **not** reimplement traffic scheduling in JavaScript.

## Run in VS Code on Windows

1. Install Node.js 20 LTS or later from <https://nodejs.org/>. Close and reopen VS Code afterward.
2. In one terminal, build and start the C++ server. It must listen at `http://localhost:18080`.
3. In a second terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

Vite proxies `/api` requests to `http://localhost:18080`, as configured in `.env` and `vite.config.js`. If the C++ API is offline, the dashboard explicitly displays demo data and disables controls that would otherwise pretend to modify the real scheduler.

## Real API endpoints used

- `GET /api/status`
- `POST /api/vehicles`
- `POST /api/schedule`
- `POST /api/process`
- `POST /api/reset`

## Production note

`npm run build` produces a static `dist/` folder. The current C++ server only serves the old `index.html`, `style.css`, and `script.js` paths; it must be updated to serve Vite's `dist/` assets before using this build in production. During development, use Vite (`npm run dev`) and the proxy described above.
